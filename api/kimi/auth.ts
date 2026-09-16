import type { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import * as jose from "jose";
import * as cookie from "cookie";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";
import { Paths, Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { signSessionToken, verifySessionToken } from "./session";
import { users as kimiUsers } from "./platform";
import { findUserByUnionId, upsertUser } from "../queries/users";
import type { TokenResponse } from "./types";
import { getRequestIp, isRateLimited } from "../lib/rate-limit";

async function exchangeAuthCode(
  code: string,
  redirectUri: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: env.appId,
    redirect_uri: redirectUri,
    client_secret: env.appSecret,
  });

  const resp = await fetch(`${env.kimiAuthUrl}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token exchange failed (${resp.status}): ${text}`);
  }

  return resp.json() as Promise<TokenResponse>;
}

const jwks = jose.createRemoteJWKSet(
  new URL(`${env.kimiAuthUrl}/api/.well-known/jwks.json`),
);

async function verifyAccessToken(
  accessToken: string,
): Promise<{ userId: string; clientId: string }> {
  const { payload } = await jose.jwtVerify(accessToken, jwks, {
    audience: env.appId,
    issuer: env.kimiTokenIssuer || undefined,
  });
  const userId = payload.user_id as string;
  const clientId = payload.client_id as string;
  if (!userId || !clientId) {
    throw new Error("user_id missing from access token");
  }
  if (clientId !== env.appId) {
    throw new Error("access token is not issued for this client");
  }
  return { userId, clientId };
}

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    console.warn("[auth] No session cookie found in request.");
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const user = await findUserByUnionId(claim.unionId);
  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }
  if (claim.clientId !== env.appId || user.sessionVersion !== claim.sessionVersion) {
    throw Errors.forbidden("Session expired. Please re-login.");
  }
  return user;
}

function getOAuthRedirectUri(c: Context): string {
  const url = new URL(c.req.url);
  return `${url.origin}${Paths.oauthCallback}`;
}

function createOAuthState(): string {
  return randomBytes(32).toString("base64url");
}

function verifyState(expected: string, actual: string): boolean {
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(actual);
  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }
  return timingSafeEqual(expectedBuf, actualBuf);
}

export function createOAuthStartHandler() {
  return async (c: Context) => {
    const state = createOAuthState();
    const redirectUri = getOAuthRedirectUri(c);
    const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
    setCookie(c, Session.oauthStateCookieName, state, {
      ...cookieOpts,
      maxAge: Session.oauthStateTtlSec,
    });

    const url = new URL(`${env.kimiAuthUrl}/api/oauth/authorize`);
    url.searchParams.set("client_id", env.appId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "profile");
    url.searchParams.set("state", state);
    return c.redirect(url.toString(), 302);
  };
}

export function createOAuthCallbackHandler() {
  return async (c: Context) => {
    const ip = getRequestIp(c.req.raw.headers);
    const limited = isRateLimited(`oauth-callback:${ip}`, {
      windowMs: 60_000,
      maxRequests: 10,
    });
    if (limited) {
      return c.json({ error: "Too many callback attempts" }, 429);
    }

    const code = c.req.query("code");
    const state = c.req.query("state");
    const error = c.req.query("error");
    const errorDescription = c.req.query("error_description");

    if (error) {
      if (error === "access_denied") {
        return c.redirect("/", 302);
      }
      return c.json(
        { error, error_description: errorDescription },
        400,
      );
    }

    if (!code || !state) {
      return c.json({ error: "code and state are required" }, 400);
    }

    const cookies = cookie.parse(c.req.raw.headers.get("cookie") || "");
    const cookieState = cookies[Session.oauthStateCookieName];
    deleteCookie(c, Session.oauthStateCookieName, {
      path: "/",
    });
    if (!cookieState || !verifyState(cookieState, state)) {
      return c.json({ error: "Invalid OAuth state" }, 400);
    }

    try {
      const redirectUri = getOAuthRedirectUri(c);
      const tokenResp = await exchangeAuthCode(code, redirectUri);
      const { userId } = await verifyAccessToken(tokenResp.access_token);
      const userProfile = await kimiUsers.getProfile(tokenResp.access_token);
      if (!userProfile) {
        throw new Error("Failed to fetch user profile from Kimi Open");
      }

      await upsertUser({
        unionId: userId,
        name: userProfile.name,
        avatar: userProfile.avatar_url,
        lastSignInAt: new Date(),
      });
      const user = await findUserByUnionId(userId);
      if (!user) {
        throw new Error("Failed to load user session.");
      }

      const token = await signSessionToken({
        unionId: userId,
        clientId: env.appId,
        sessionVersion: user.sessionVersion,
        jti: randomBytes(16).toString("hex"),
      });

      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });

      return c.redirect("/", 302);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      return c.json({ error: "OAuth callback failed" }, 500);
    }
  };
}

export { exchangeAuthCode, verifyAccessToken };
