import { describe, expect, it } from "vitest";

import {
  getTrustedSiteOrigin,
  isProtectedPath,
  sanitizeNextPath,
} from "@/lib/auth/redirects";

describe("authentication redirect safety", () => {
  it("keeps normal relative destinations", () => {
    expect(sanitizeNextPath("/dashboard?view=ready")).toBe(
      "/dashboard?view=ready",
    );
  });

  it("keeps encoded internal paths inside query values", () => {
    expect(sanitizeNextPath("/login?next=%2Fprojects")).toBe(
      "/login?next=%2Fprojects",
    );
  });

  it.each([
    "https://attacker.example/steal",
    "//attacker.example/steal",
    "/\\attacker.example/steal",
    "/..//attacker.example/steal",
    "/%2f%2fattacker.example/steal",
  ])("rejects unsafe destination %s", (candidate) => {
    expect(sanitizeNextPath(candidate)).toBe("/dashboard");
  });

  it("trusts only local development and the production host", () => {
    expect(
      getTrustedSiteOrigin(new Headers({ host: "localhost:3000" })),
    ).toBe("http://localhost:3000");
    expect(
      getTrustedSiteOrigin(
        new Headers({ "x-forwarded-host": "releasedesk-three.vercel.app" }),
      ),
    ).toBe("https://releasedesk-three.vercel.app");
    expect(
      getTrustedSiteOrigin(new Headers({ host: "attacker.example" })),
    ).toBe("https://releasedesk-three.vercel.app");
  });

  it("recognizes the dashboard route tree only", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/dashboard/projects/one")).toBe(true);
    expect(isProtectedPath("/projects")).toBe(true);
    expect(isProtectedPath("/projects/one")).toBe(true);
    expect(isProtectedPath("/dashboarding")).toBe(false);
    expect(isProtectedPath("/project-settings")).toBe(false);
    expect(isProtectedPath("/login")).toBe(false);
  });
});
