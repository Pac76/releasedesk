import { describe, expect, it } from "vitest";

import { isLocale, localize, parseLocale } from "@/lib/i18n/locale";

describe("locale helpers", () => {
  it("defaults missing or invalid values to English", () => {
    expect(parseLocale(undefined)).toBe("en");
    expect(parseLocale("fr")).toBe("en");
  });

  it("accepts only the supported locale allowlist", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("es")).toBe(true);
    expect(isLocale("EN")).toBe(false);
  });

  it("selects the requested locale without fallback ambiguity", () => {
    expect(localize("en", { en: "Ready", es: "Listo" })).toBe("Ready");
    expect(localize("es", { en: "Ready", es: "Listo" })).toBe("Listo");
  });
});
