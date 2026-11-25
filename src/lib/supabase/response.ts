import type { CookieOptions } from "@supabase/ssr";
import type { NextResponse } from "next/server";

export const AUTH_RESPONSE_HEADERS = {
  "cache-control": "private, no-cache, no-store, must-revalidate, max-age=0",
  expires: "0",
  pragma: "no-cache",
} as const;

type PendingCookie = {
  name: string;
  options: CookieOptions;
  value: string;
};

export type SupabaseResponseContext = {
  cookies: PendingCookie[];
  headers: Headers;
};

export function createSupabaseResponseContext(): SupabaseResponseContext {
  return {
    cookies: [],
    headers: new Headers(),
  };
}

export function captureSupabaseResponse(
  context: SupabaseResponseContext,
  cookies: PendingCookie[],
  headers: Record<string, string>,
): void {
  context.cookies.push(...cookies);
  Object.entries(headers).forEach(([key, value]) =>
    context.headers.set(key, value),
  );
}

export function applyAuthResponseHeaders(headers: Headers): void {
  Object.entries(AUTH_RESPONSE_HEADERS).forEach(([key, value]) =>
    headers.set(key, value),
  );
}

export function finalizeAuthResponse(
  response: NextResponse,
  context?: SupabaseResponseContext,
): NextResponse {
  applyAuthResponseHeaders(response.headers);

  if (!context) {
    return response;
  }

  context.cookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options),
  );
  context.headers.forEach((value, key) => response.headers.set(key, value));

  return response;
}
