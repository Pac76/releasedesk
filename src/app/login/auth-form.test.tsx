import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthForm } from "@/app/login/auth-form";
import { LocaleProvider } from "@/components/locale-provider";
import type { AuthActionState } from "@/lib/auth/validation";

const action = vi.fn(
  async (): Promise<AuthActionState> => ({ status: "idle" }),
);

describe("AuthForm", () => {
  it("renders an accessible sign-in form with a safe destination", () => {
    render(
      <AuthForm
        action={action}
        nextPath="/dashboard"
        variant="sign-in"
      />,
    );

    expect(screen.getByLabelText(/email address/i)).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.getByLabelText(/password/i)).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
    expect(document.querySelector('input[name="next"]')).toHaveValue(
      "/dashboard",
    );
  });

  it("uses new-password semantics for registration", () => {
    render(
      <AuthForm
        action={action}
        nextPath="/dashboard"
        variant="sign-up"
      />,
    );

    expect(screen.getByLabelText(/password/i)).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeEnabled();
  });

  it("preserves the complete Spanish form copy when selected", () => {
    render(
      <LocaleProvider locale="es">
        <AuthForm action={action} nextPath="/dashboard" variant="sign-in" />
      </LocaleProvider>,
    );

    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeEnabled();
  });
});
