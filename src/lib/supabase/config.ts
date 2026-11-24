export const SUPABASE_CONFIG_ERROR =
  "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.";

type SupabaseEnvironment = {
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
};

export type SupabasePublicConfig = {
  publishableKey: string;
  url: string;
};

function readPublicEnvironment(): SupabaseEnvironment {
  return {
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };
}

export function getSupabaseConfig(
  environment: SupabaseEnvironment = readPublicEnvironment(),
): SupabasePublicConfig {
  const rawUrl = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!rawUrl || !publishableKey) {
    throw new Error(SUPABASE_CONFIG_ERROR);
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error(
      "Supabase configuration is invalid. NEXT_PUBLIC_SUPABASE_URL must be an HTTP(S) URL.",
    );
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(
      "Supabase configuration is invalid. NEXT_PUBLIC_SUPABASE_URL must be an HTTP(S) URL.",
    );
  }

  return {
    publishableKey,
    url: rawUrl.replace(/\/+$/, ""),
  };
}

export function hasSupabaseConfig(
  environment: SupabaseEnvironment = readPublicEnvironment(),
): boolean {
  try {
    getSupabaseConfig(environment);
    return true;
  } catch {
    return false;
  }
}

