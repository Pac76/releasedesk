import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  isProtectedPath,
  sanitizeNextPath,
} from "@/lib/auth/redirects";
import { getSupabaseConfig } from "@/lib/supabase/config";
import {
  applyAuthResponseHeaders,
  finalizeAuthResponse,
} from "@/lib/supabase/response";
import type { Database } from "@/types/database";

function copyAuthResponse(
  source: NextResponse,
  destination: NextResponse,
): NextResponse {
  source.cookies
    .getAll()
    .forEach((cookie) => destination.cookies.set(cookie));

  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(header);
    if (value) {
      destination.headers.set(header, value);
    }
  }

  applyAuthResponseHeaders(destination.headers);
  return destination;
}

function redirectWithAuthCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
): NextResponse {
  return copyAuthResponse(
    response,
    NextResponse.redirect(new URL(pathname, request.url)),
  );
}

function loginDestination(request: NextRequest): string {
  const requestedPath = sanitizeNextPath(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return `/login?next=${encodeURIComponent(requestedPath)}`;
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectsRoute = isProtectedPath(pathname);

  let config;
  try {
    config = getSupabaseConfig();
  } catch {
    if (protectsRoute) {
      return finalizeAuthResponse(
        NextResponse.redirect(
          new URL(loginDestination(request), request.url),
        ),
      );
    }

    return finalizeAuthResponse(NextResponse.next({ request }));
  }

  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient<Database>(
    config.url,
    config.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  let isAuthenticated = false;
  try {
    const { data, error } = await supabase.auth.getClaims();
    isAuthenticated = !error && Boolean(data?.claims?.sub);
  } catch {
    isAuthenticated = false;
  }

  if (protectsRoute && !isAuthenticated) {
    return redirectWithAuthCookies(
      request,
      supabaseResponse,
      loginDestination(request),
    );
  }

  if (pathname === "/login" && isAuthenticated) {
    const nextPath = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
    return redirectWithAuthCookies(request, supabaseResponse, nextPath);
  }

  return finalizeAuthResponse(supabaseResponse);
}
