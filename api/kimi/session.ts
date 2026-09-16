import * as jose from "jose";
import { env } from "../lib/env";
import type { SessionPayload } from "./types";
import { Session } from "@contracts/constants";

const JWT_ALG = "HS256";

export async function signSessionToken(
  payload: SessionPayload,
): Promise<string> {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuer(Session.issuer)
    .setAudience(env.appId)
    .setSubject(payload.unionId)
    .setJti(payload.jti)
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + Session.maxAgeMs) / 1000))
    .sign(secret);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  if (!token) {
    console.warn("[session] No token provided for verification.");
    return null;
  }
  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
      issuer: Session.issuer,
      audience: env.appId,
    });
    const { unionId, clientId, sessionVersion, jti } = payload;
    if (
      typeof unionId !== "string" ||
      typeof clientId !== "string" ||
      typeof sessionVersion !== "number" ||
      typeof jti !== "string"
    ) {
      console.warn("[session] JWT payload missing required fields.");
      return null;
    }
    return { unionId, clientId, sessionVersion, jti };
  } catch (error) {
    console.warn("[session] JWT verification failed:", error);
    return null;
  }
}
