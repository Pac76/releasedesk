import "server-only";

import { cookies } from "next/headers";

import {
  LOCALE_COOKIE_NAME,
  parseLocale,
  type Locale,
} from "@/lib/i18n/locale";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}
