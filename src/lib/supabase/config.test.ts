import { describe, expect, it } from "vitest";

import {
  getSupabaseConfig,
  hasSupabaseConfig,
  SUPABASE_CONFIG_ERROR,
} from "@/lib/supabase/config";

describe("Supabase public configuration", () => {
  it("returns a normalized public configuration", () => {
    expect(
      getSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: " public-key ",
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co/",
      }),
    ).toEqual({
      publishableKey: "public-key",
      url: "https://project.supabase.co",
    });
  });

  it("fails safely when public variables are missing", () => {
    expect(() => getSupabaseConfig({})).toThrow(SUPABASE_CONFIG_ERROR);
  });

  it("rejects malformed URLs without echoing their value", () => {
    const invalidValue = "definitely-not-a-url";

    expect(() =>
      getSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-key",
        NEXT_PUBLIC_SUPABASE_URL: invalidValue,
      }),
    ).toThrow("NEXT_PUBLIC_SUPABASE_URL must be an HTTP(S) URL");

    try {
      getSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-key",
        NEXT_PUBLIC_SUPABASE_URL: invalidValue,
      });
    } catch (error) {
      expect(String(error)).not.toContain(invalidValue);
    }
  });

  it("reports availability without throwing", () => {
    expect(hasSupabaseConfig({})).toBe(false);
    expect(
      hasSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-key",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      }),
    ).toBe(true);
  });
});

