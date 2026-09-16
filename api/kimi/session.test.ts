import { beforeEach, describe, expect, it, vi } from "vitest";

describe("session token signing and verification", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.APP_SECRET = "test-secret-123";
    process.env.APP_ID = "test-client-id";
    process.env.DATABASE_URL = "mysql://test";
    process.env.KIMI_AUTH_URL = "https://auth.example.com";
    process.env.KIMI_OPEN_URL = "https://open.example.com";
  });

  it("verifies a valid session token", async () => {
    const { signSessionToken, verifySessionToken } = await import("./session");
    const token = await signSessionToken({
      unionId: "user-1",
      clientId: "test-client-id",
      sessionVersion: 3,
      jti: "abc123",
    });
    const payload = await verifySessionToken(token);
    expect(payload?.unionId).toBe("user-1");
    expect(payload?.clientId).toBe("test-client-id");
    expect(payload?.sessionVersion).toBe(3);
  });

  it("rejects malformed or tampered token", async () => {
    const { signSessionToken, verifySessionToken } = await import("./session");
    const token = await signSessionToken({
      unionId: "user-2",
      clientId: "test-client-id",
      sessionVersion: 1,
      jti: "xyz987",
    });
    const tampered = `${token}x`;
    const payload = await verifySessionToken(tampered);
    expect(payload).toBeNull();
  });
});
