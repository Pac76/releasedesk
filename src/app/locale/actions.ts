"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { sanitizeNextPath } from "@/lib/auth/redirects";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE_NAME,
} from "@/lib/i18n/locale";

export async function setLocaleAction(formData: FormData): Promise<void> {
  const requestedLocale = formData.get("locale");
  const locale = isLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  const currentPathValue = formData.get("current_path");
  const currentPath = sanitizeNextPath(
    typeof currentPathValue === "string" ? currentPathValue : undefined,
    "/",
  );
  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect(currentPath);
}
