"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { setLocaleAction } from "@/app/locale/actions";
import { useLocale } from "@/components/locale-provider";
import { localize } from "@/lib/i18n/locale";

export function LanguageSwitcher({
  className = "",
}: Readonly<{ className?: string }>) {
  const locale = useLocale();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const query = searchParams?.toString() ?? "";
  const currentPath = query ? `${pathname}?${query}` : pathname;
  const label = localize(locale, {
    en: "Language",
    es: "Idioma",
  });

  return (
    <form
      action={setLocaleAction}
      aria-label={label}
      className={`language-switcher ${className}`.trim()}
    >
      <input name="current_path" type="hidden" value={currentPath} />
      <button
        aria-pressed={locale === "en"}
        name="locale"
        type="submit"
        value="en"
      >
        EN
      </button>
      <span aria-hidden="true">/</span>
      <button
        aria-pressed={locale === "es"}
        name="locale"
        type="submit"
        value="es"
      >
        ES
      </button>
    </form>
  );
}
