// @vitest-environment node

import type { CookieOptions } from "@supabase/ssr";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieSet: vi.fn(),
  createServerClient: vi.fn(),
  getSupabaseConfig: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [],
    set: mocks.cookieSet,
  })),
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: mocks.createServerClient,
}));
vi.mock("@/lib/supabase/config", () => ({
  getSupabaseConfig: mocks.getSupabaseConfig,
}));

import { createSupabaseResponseContext } from "@/lib/supabase/response";
import { createClient } from "@/lib/supabase/server";

type CookieToSet = {
  name: string;
  options: CookieOptions;
  value: string;
};

type CapturedClient = {
  cookies: {
    setAll: (
      cookies: CookieToSet[],
      headers: Record<string, string>,
    ) => void;
  };
};

describe("Supabase server client response contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSupabaseConfig.mockReturnValue({
      publishableKey: "public-key",
      url: "https://project.supabase.co",
    });
    mocks.createServerClient.mockImplementation(
      (_url: string, _key: string, options: CapturedClient) => options,
    );
  });

  it("captures every cookie and response header supplied by @supabase/ssr", async () => {
    const responseContext = createSupabaseResponseContext();
    const client = (await createClient({ responseContext })) as unknown as CapturedClient;
    const cookie = {
      name: "sb-test-auth-token",
      options: { httpOnly: true, path: "/" },
      value: "fresh-token",
    } satisfies CookieToSet;

    client.cookies.setAll([cookie], {
      "cache-control": "private, no-store",
      expires: "0",
      pragma: "no-cache",
      "x-supabase-test": "preserved",
    });

    expect(mocks.cookieSet).toHaveBeenCalledWith(
      cookie.name,
      cookie.value,
      cookie.options,
    );
    expect(responseContext.cookies).toEqual([cookie]);
    expect(responseContext.headers.get("cache-control")).toBe(
      "private, no-store",
    );
    expect(responseContext.headers.get("x-supabase-test")).toBe("preserved");
  });
});
