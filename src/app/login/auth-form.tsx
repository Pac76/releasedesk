"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

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
  const idleLabel = variant === "sign-in" ? "Ingresar" : "Crear cuenta";

  return (
    <button
      className="button button-ink auth-submit"
      disabled={pending}
      type="submit"
    >
      {pending ? "Procesando…" : idleLabel}
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

  return (
    <form action={formAction} className="auth-form">
      <input name="next" type="hidden" value={nextPath} />
      <div className="auth-form-heading">
        <p className="auth-form-index" aria-hidden="true">
          {isSignIn ? "01" : "02"}
        </p>
        <div>
          <h2>{isSignIn ? "Ingresá a tu espacio" : "Creá tu cuenta"}</h2>
          <p>
            {isSignIn
              ? "Retomá el control de tu próxima entrega."
              : "Empezá con un espacio privado para tus proyectos."}
          </p>
        </div>
      </div>

      <div className="auth-field">
        <label htmlFor={`${prefix}-email`}>Correo electrónico</label>
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
          placeholder="vos@ejemplo.com"
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
        <label htmlFor={`${prefix}-password`}>Contraseña</label>
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
          Entre 8 y 128 caracteres.
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
