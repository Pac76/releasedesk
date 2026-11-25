import { describe, expect, it } from "vitest";

import { parseConfirmationInput } from "@/lib/auth/confirmation";

describe("email confirmation input", () => {
  it("accepts the documented email token-hash shape", () => {
    const params = new URLSearchParams({
      token_hash: "safe-token-hash",
      type: "email",
    });

    expect(parseConfirmationInput(params)).toEqual({
      tokenHash: "safe-token-hash",
      type: "email",
    });
  });

  it("rejects missing hashes and unsupported OTP types", () => {
    expect(
      parseConfirmationInput(new URLSearchParams({ type: "email" })),
    ).toBeNull();
    expect(
      parseConfirmationInput(
        new URLSearchParams({ token_hash: "hash", type: "recovery" }),
      ),
    ).toBeNull();
  });
});
