// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  headers: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import {
  signInAction,
  signOutAction,
  signUpAction,
} from "@/app/login/actions";
import { INITIAL_AUTH_STATE } from "@/lib/auth/validation";
import { getLocale } from "@/lib/i18n/server";

class RedirectSignal extends Error {
  constructor(readonly destination: string) {
    super(`Redirect to ${destination}`);
  }
}

function formData(
  next = "/dashboard",
  email = " User@Example.com ",
  password = "password-123",
): FormData {
  const data = new FormData();
  data.set("email", email);
  data.set("password", password);
  data.set("next", next);
  return data;
}

function clientWithAuth(auth: Record<string, unknown>) {
  return { auth };
}

describe("authentication server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.headers.mockResolvedValue(new Headers({ host: "localhost:3000" }));
    mocks.redirect.mockImplementation((destination: string) => {
      throw new RedirectSignal(destination);
    });
  });

  it("validates sign-in input before creating a Supabase client", async () => {
    const state = await signInAction(
      INITIAL_AUTH_STATE,
      formData("/dashboard", "invalid", "short"),
    );

    expect(state.status).toBe("error");
    expect(state.fieldErrors).toEqual({
      email: "Enter a valid email address.",
      password: "Password must be between 8 and 128 characters.",
    });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("returns a generic sign-in error without provider details", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      error: { code: "unexpected_failure", message: "private provider detail" },
    });
    mocks.createClient.mockResolvedValue(
      clientWithAuth({ signInWithPassword }),
    );

    const state = await signInAction(INITIAL_AUTH_STATE, formData());

    expect(state.message).toMatch(/couldn't sign you in/i);
    expect(state.message).not.toContain("private provider detail");
  });

  it("returns server-action validation feedback in Spanish when selected", async () => {
    vi.mocked(getLocale).mockResolvedValueOnce("es");

    const state = await signInAction(
      INITIAL_AUTH_STATE,
      formData("/dashboard", "invalid", "short"),
    );

    expect(state.fieldErrors).toEqual({
      email: "Ingresá un correo electrónico válido.",
      password: "La contraseña debe tener entre 8 y 128 caracteres.",
    });
  });

  it("normalizes credentials and rejects an unsafe post-login redirect", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
    mocks.createClient.mockResolvedValue(
      clientWithAuth({ signInWithPassword }),
    );

    await expect(
      signInAction(INITIAL_AUTH_STATE, formData("//attacker.example")),
    ).rejects.toMatchObject({ destination: "/dashboard" });
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password-123",
    });
  });

  it("returns the confirmation-required signup state", async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mocks.createClient.mockResolvedValue(clientWithAuth({ signUp }));

    const state = await signUpAction(INITIAL_AUTH_STATE, formData());

    expect(state).toEqual({
      message: "Check your email and confirm your account using the link we sent.",
      status: "success",
    });
    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        options: { emailRedirectTo: "http://localhost:3000" },
      }),
    );
  });

  it("redirects an immediate-session signup to a safe destination", async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: { session: { access_token: "not-returned-to-the-client" } },
      error: null,
    });
    mocks.createClient.mockResolvedValue(clientWithAuth({ signUp }));

    await expect(
      signUpAction(
        INITIAL_AUTH_STATE,
        formData("/dashboard?view=ready"),
      ),
    ).rejects.toMatchObject({ destination: "/dashboard?view=ready" });
  });

  it("clears the local auth cookie state before signing out", async () => {
    const getClaims = vi.fn().mockResolvedValue({
      data: { claims: { sub: "user-id" } },
      error: null,
    });
    const signOut = vi.fn().mockResolvedValue({ error: null });
    mocks.createClient.mockResolvedValue(
      clientWithAuth({ getClaims, signOut }),
    );

    await expect(signOutAction()).rejects.toMatchObject({ destination: "/" });
    expect(getClaims).toHaveBeenCalledOnce();
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
  });
});
