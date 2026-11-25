"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { useLocale } from "@/components/locale-provider";
import { localize } from "@/lib/i18n/locale";
import {
  INITIAL_AUTH_STATE,
  type AuthActionState,
} from "@/lib/auth/validation";

type AuthServerAction = (
  previousState: AuthActionState,
  formData: FormData,
) => Promise<AuthActionState>;

type AuthFormProps = {
  action: AuthServerAction;
  nextPath: string;
  variant: "sign-in" | "sign-up";
};

function SubmitButton({ variant }: Pick<AuthFormProps, "variant">) {
  const { pending } = useFormStatus();
  const locale = useLocale();
  const copy = localize(locale, {
    en: { pending: "Processing…", signIn: "Sign in", signUp: "Create account" },
    es: { pending: "Procesando…", signIn: "Ingresar", signUp: "Crear cuenta" },
  });
  const idleLabel = variant === "sign-in" ? copy.signIn : copy.signUp;

  return (
    <button
      className="button button-ink auth-submit"
      disabled={pending}
      type="submit"
    >
      {pending ? copy.pending : idleLabel}
    </button>
  );
}

function FormFeedback({ state }: { state: AuthActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={`auth-feedback auth-feedback-${state.status}`}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}

export function AuthForm({ action, nextPath, variant }: AuthFormProps) {
  const [state, formAction] = useActionState(action, INITIAL_AUTH_STATE);
  const isSignIn = variant === "sign-in";
  const prefix = isSignIn ? "sign-in" : "sign-up";
  const locale = useLocale();
  const copy = localize(locale, {
    en: {
      email: "Email address",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passwordHelp: "Between 8 and 128 characters.",
      signInDescription: "Take control of your next release.",
      signInHeading: "Sign in to your workspace",
      signUpDescription: "Start with a private workspace for your projects.",
      signUpHeading: "Create your account",
    },
    es: {
      email: "Correo electrónico",
      emailPlaceholder: "vos@ejemplo.com",
      password: "Contraseña",
      passwordHelp: "Entre 8 y 128 caracteres.",
      signInDescription: "Retomá el control de tu próxima entrega.",
      signInHeading: "Ingresá a tu espacio",
      signUpDescription: "Empezá con un espacio privado para tus proyectos.",
      signUpHeading: "Creá tu cuenta",
    },
  });

  return (
    <form action={formAction} className="auth-form">
      <input name="next" type="hidden" value={nextPath} />
      <div className="auth-form-heading">
        <p className="auth-form-index" aria-hidden="true">
          {isSignIn ? "01" : "02"}
        </p>
        <div>
          <h2>{isSignIn ? copy.signInHeading : copy.signUpHeading}</h2>
          <p>
            {isSignIn
              ? copy.signInDescription
              : copy.signUpDescription}
          </p>
        </div>
      </div>

      <div className="auth-field">
        <label htmlFor={`${prefix}-email`}>{copy.email}</label>
        <input
          aria-describedby={
            state.fieldErrors?.email ? `${prefix}-email-error` : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.email)}
          autoComplete="email"
          id={`${prefix}-email`}
          inputMode="email"
          maxLength={254}
          name="email"
          placeholder={copy.emailPlaceholder}
          required
          type="email"
        />
        {state.fieldErrors?.email ? (
          <span className="field-error" id={`${prefix}-email-error`}>
            {state.fieldErrors.email}
          </span>
        ) : null}
      </div>

      <div className="auth-field">
        <label htmlFor={`${prefix}-password`}>{copy.password}</label>
        <input
          aria-describedby={`${prefix}-password-help${
            state.fieldErrors?.password ? ` ${prefix}-password-error` : ""
          }`}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          autoComplete={isSignIn ? "current-password" : "new-password"}
          id={`${prefix}-password`}
          maxLength={128}
          minLength={8}
          name="password"
          required
          type="password"
        />
        <span className="field-help" id={`${prefix}-password-help`}>
          {copy.passwordHelp}
        </span>
        {state.fieldErrors?.password ? (
          <span className="field-error" id={`${prefix}-password-error`}>
            {state.fieldErrors.password}
          </span>
        ) : null}
      </div>

      <FormFeedback state={state} />
      <SubmitButton variant={variant} />
    </form>
  );
}
