"use client";

import { createContext, type ReactNode, useContext } from "react";

import type { Locale } from "@/lib/i18n/locale";

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({
  children,
  locale,
}: Readonly<{ children: ReactNode; locale: Locale }>) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}
