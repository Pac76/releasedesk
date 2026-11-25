import { NextResponse, type NextRequest } from "next/server";

import { parseConfirmationInput } from "@/lib/auth/confirmation";
import { sanitizeNextPath } from "@/lib/auth/redirects";
import {
  createSupabaseResponseContext,
  finalizeAuthResponse,
} from "@/lib/supabase/response";
import { createClient } from "@/lib/supabase/server";

function loginRedirect(request: NextRequest, notice: string): NextResponse {
  const url = new URL("/login", request.url);
  url.searchParams.set("notice", notice);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const responseContext = createSupabaseResponseContext();
  const confirmation = parseConfirmationInput(request.nextUrl.searchParams);
  if (!confirmation) {
    return finalizeAuthResponse(
      loginRedirect(request, "confirmation_error"),
      responseContext,
    );
  }

  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient({ responseContext });
  } catch {
    return finalizeAuthResponse(
      loginRedirect(request, "setup"),
      responseContext,
    );
  }

  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: confirmation.tokenHash,
      type: confirmation.type,
    });

    if (error) {
      return finalizeAuthResponse(
        loginRedirect(request, "confirmation_error"),
        responseContext,
      );
    }
  } catch {
    return finalizeAuthResponse(
      loginRedirect(request, "confirmation_error"),
      responseContext,
    );
  }

  const nextPath = sanitizeNextPath(
    request.nextUrl.searchParams.get("next"),
  );
  return finalizeAuthResponse(
    NextResponse.redirect(new URL(nextPath, request.url)),
    responseContext,
  );
}
