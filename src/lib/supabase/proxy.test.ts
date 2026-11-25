// @vitest-environment node

import type { CookieOptions } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  getSupabaseConfig: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: mocks.createServerClient,
}));
vi.mock("@/lib/supabase/config", () => ({
  getSupabaseConfig: mocks.getSupabaseConfig,
}));

import { updateSession } from "@/lib/supabase/proxy";
import { AUTH_RESPONSE_HEADERS } from "@/lib/supabase/response";
import { config as proxyConfig } from "@/proxy";

type CookieToSet = {
  name: string;
  options: CookieOptions;
  value: string;
};

type ServerClientOptions = {
  cookies: {
    getAll: () => { name: string; value: string }[];
    setAll: (
      cookies: CookieToSet[],
      headers: Record<string, string>,
    ) => void;
  };
};

function expectNoCacheHeaders(response: Response) {
  expect(response.headers.get("cache-control")).toBe(
    AUTH_RESPONSE_HEADERS["cache-control"],
  );
  expect(response.headers.get("expires")).toBe("0");
  expect(response.headers.get("pragma")).toBe("no-cache");
}

describe("Supabase auth proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSupabaseConfig.mockReturnValue({
      publishableKey: "public-key",
      url: "https://project.supabase.co",
    });
  });

  it("covers every route that can write authentication cookies", () => {
    expect(proxyConfig.matcher).toEqual([
      "/login",
      "/auth/confirm",
      "/dashboard/:path*",
    ]);
  });

  it("redirects an unauthenticated dashboard request", async () => {
    mocks.createServerClient.mockReturnValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: null, error: null }),
      },
    });

    const response = await updateSession(
      new NextRequest("http://localhost:3000/dashboard?view=ready"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?next=%2Fdashboard%3Fview%3Dready",
    );
    expectNoCacheHeaders(response);
  });

  it("rejects a malicious login destination and preserves refreshed auth state", async () => {
    mocks.createServerClient.mockImplementation(
      (_url: string, _key: string, options: ServerClientOptions) => ({
        auth: {
          getClaims: vi.fn().mockImplementation(async () => {
            options.cookies.setAll(
              [
                {
                  name: "sb-test-auth-token",
                  options: { httpOnly: true, path: "/", sameSite: "lax" },
                  value: "refreshed-token",
                },
              ],
              AUTH_RESPONSE_HEADERS,
            );
            return {
              data: { claims: { sub: "user-id" } },
              error: null,
            };
          }),
        },
      }),
    );

    const response = await updateSession(
      new NextRequest(
        "http://localhost:3000/login?next=%2F%2Fattacker.example",
      ),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/dashboard",
    );
    expect(response.headers.get("set-cookie")).toContain(
      "sb-test-auth-token=refreshed-token",
    );
    expectNoCacheHeaders(response);
  });

  it("passes an authenticated dashboard request with refreshed cookies", async () => {
    mocks.createServerClient.mockImplementation(
      (_url: string, _key: string, options: ServerClientOptions) => ({
        auth: {
          getClaims: vi.fn().mockImplementation(async () => {
            options.cookies.setAll(
              [
                {
                  name: "sb-test-auth-token",
                  options: { path: "/", sameSite: "lax" },
                  value: "fresh-token",
                },
              ],
              AUTH_RESPONSE_HEADERS,
            );
            return {
              data: { claims: { sub: "user-id" } },
              error: null,
            };
          }),
        },
      }),
    );

    const response = await updateSession(
      new NextRequest("http://localhost:3000/dashboard"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain(
      "sb-test-auth-token=fresh-token",
    );
    expectNoCacheHeaders(response);
  });
});
