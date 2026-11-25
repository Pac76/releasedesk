// @vitest-environment node

import { describe, expect, it } from "vitest";

import nextConfig, { SECURITY_HEADERS } from "../../next.config";

describe("Next.js security response headers", () => {
  it("applies the reviewed hardening headers to every route", async () => {
    const rules = await nextConfig.headers?.();

    expect(rules).toEqual([
      {
        headers: [...SECURITY_HEADERS],
        source: "/:path*",
      },
    ]);
    const headers = Object.fromEntries(
      SECURITY_HEADERS.map(({ key, value }) => [key, value]),
    );

    expect(headers).toEqual({
      "Permissions-Policy":
        "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    });
  });
});
