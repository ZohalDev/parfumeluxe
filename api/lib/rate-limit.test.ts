import { describe, expect, it } from "vitest";
import { getRequestIp, isRateLimited } from "./rate-limit";

describe("rate-limit utility", () => {
  it("extracts first forwarded IP", () => {
    const headers = new Headers({
      "x-forwarded-for": "1.2.3.4, 5.6.7.8",
    });
    expect(getRequestIp(headers)).toBe("1.2.3.4");
  });

  it("limits when request count exceeds max", () => {
    const key = `test-${Date.now()}`;
    const options = { windowMs: 1000, maxRequests: 2 };
    expect(isRateLimited(key, options)).toBe(false);
    expect(isRateLimited(key, options)).toBe(false);
    expect(isRateLimited(key, options)).toBe(true);
  });
});
