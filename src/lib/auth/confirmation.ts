import type { EmailOtpType } from "@supabase/supabase-js";

const CONFIRMATION_TYPES = new Set<EmailOtpType>(["email", "signup"]);

export type ConfirmationInput = {
  tokenHash: string;
  type: EmailOtpType;
};

export function parseConfirmationInput(
  searchParams: URLSearchParams,
): ConfirmationInput | null {
  const tokenHash = searchParams.get("token_hash")?.trim();
  const type = searchParams.get("type") as EmailOtpType | null;

  if (
    !tokenHash ||
    tokenHash.length > 2048 ||
    /\s/.test(tokenHash) ||
    !type ||
    !CONFIRMATION_TYPES.has(type)
  ) {
    return null;
  }

  return { tokenHash, type };
}
