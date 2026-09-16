import * as cookie from "cookie";
import { z } from "zod";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq, sql, or } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { signSessionToken } from "./kimi/session";
import { randomBytes } from "node:crypto";
import { env } from "./lib/env";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),

  updateMe: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(255).optional(),
        email: z.string().email().max(320).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.email !== undefined) updateData.email = input.email;

      if (Object.keys(updateData).length > 0) {
        await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, ctx.user.id));
      }

      const updated = await db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
      });
      return updated;
    }),

  register: publicQuery
    .input(
      z.object({
        name: z.string().min(2).max(255),
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const unionId = randomBytes(16).toString("hex");

      const [insertResult] = await db.insert(users).values({
        unionId,
        name: input.name,
        email: input.email,
        password: hashedPassword,
        lastSignInAt: new Date(),
      }).$returningId();

      const user = await db.query.users.findFirst({
        where: eq(users.id, insertResult.id),
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      const token = await signSessionToken({
        unionId: user.unionId,
        clientId: env.appId,
        sessionVersion: user.sessionVersion,
        jti: randomBytes(16).toString("hex"),
      });

      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return { success: true };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (!user || !user.password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const isValid = await bcrypt.compare(input.password, user.password);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const token = await signSessionToken({
        unionId: user.unionId,
        clientId: env.appId,
        sessionVersion: user.sessionVersion,
        jti: randomBytes(16).toString("hex"),
      });

      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return { success: true };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    await getDb()
      .update(users)
      .set({ sessionVersion: sql`${users.sessionVersion} + 1` })
      .where(eq(users.id, ctx.user.id));

    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
  googleAuthUrl: publicQuery
    .input(z.object({ origin: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
      const origin = input?.origin || ctx.req.headers.get("origin") || "http://localhost:3000";
      const options = {
        redirect_uri: `${origin}/auth/google/callback`,
        client_id: env.googleClientId,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
      };

      const qs = new URLSearchParams(options);
      return { url: `${rootUrl}?${qs.toString()}` };
    }),

  googleCallback: publicQuery
    .input(z.object({ code: z.string(), origin: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const origin = input.origin || ctx.req.headers.get("origin") || "http://localhost:3000";
      
      // 1. Exchange code for tokens
      const redirectUri = `${origin}/auth/google/callback`;
      
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: input.code,
          client_id: env.googleClientId,
          client_secret: env.googleClientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        console.error("Google Token Error:", error);
        throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to exchange code" });
      }

      const { access_token } = await tokenResponse.json() as { access_token: string };

      // 2. Get user info from Google
      const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!userResponse.ok) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to get user info" });
      }

      const googleUser = await userResponse.json() as {
        sub: string;
        name: string;
        email: string;
        picture: string;
      };

      // 3. Find or create user in database
      let user = await db.query.users.findFirst({
        where: or(eq(users.unionId, googleUser.sub), eq(users.email, googleUser.email)),
      });

      if (!user) {
        const [result] = await db.insert(users).values({
          unionId: googleUser.sub,
          name: googleUser.name,
          email: googleUser.email,
          avatar: googleUser.picture,
          role: "user",
        }).$returningId();
        
        user = await db.query.users.findFirst({
          where: eq(users.id, result.id),
        });
      }

      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to sync user" });

      // 4. Create session
      const token = await signSessionToken({
        unionId: user.unionId,
        clientId: env.appId,
        sessionVersion: user.sessionVersion,
        jti: randomBytes(16).toString("hex"),
      });

      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      };
    }),
});
