export const LOCALE_COOKIE_NAME = "releasedesk_locale";
export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "es"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "es";
}

export function parseLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function localize<T>(
  locale: Locale,
  values: Record<Locale, T>,
): T {
  return values[locale];
}
