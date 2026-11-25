import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type VerifiedAuth = {
  email: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
};

async function verifyAuth(): Promise<VerifiedAuth | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const claims = data?.claims;

    if (
      error ||
      typeof claims?.sub !== "string" ||
      !claims.sub ||
      claims.is_anonymous === true
    ) {
      return null;
    }

    return {
      email:
        typeof claims.email === "string" ? claims.email : "Cuenta verificada",
      supabase,
      userId: claims.sub,
    };
  } catch {
    return null;
  }
}

export const getVerifiedAuth = cache(verifyAuth);
