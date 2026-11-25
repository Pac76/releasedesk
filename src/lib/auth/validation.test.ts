import { describe, expect, it } from "vitest";

import { mapAuthError, validateCredentials } from "@/lib/auth/validation";

function credentials(email: string, password: string): FormData {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("password", password);
  return formData;
}

describe("authentication input validation", () => {
  it("normalizes a valid email without changing the password", () => {
    expect(
      validateCredentials(credentials("  AGUSTIN@Example.COM ", "Pass word 123")),
    ).toEqual({
      data: {
        email: "agustin@example.com",
        password: "Pass word 123",
      },
      success: true,
    });
  });

  it("returns field-specific errors for invalid credentials", () => {
    expect(validateCredentials(credentials("not-an-email", "short"))).toEqual({
      errors: {
        email: "Ingresá un correo electrónico válido.",
        password: "La contraseña debe tener entre 8 y 128 caracteres.",
      },
      success: false,
    });
  });

  it("maps known auth codes without returning provider details", () => {
    const providerMessage = "provider detail that must stay private";
    const message = mapAuthError("sign-in", {
      code: "invalid_credentials",
      message: providerMessage,
    });

    expect(message).toBe("No pudimos validar esas credenciales.");
    expect(message).not.toContain(providerMessage);
    expect(
      mapAuthError("sign-up", { code: "over_email_send_rate_limit" }),
    ).toMatch(/demasiados intentos/i);
  });
});
