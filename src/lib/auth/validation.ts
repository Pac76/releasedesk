import { localize, type Locale } from "@/lib/i18n/locale";

export type AuthFieldErrors = {
  email?: string;
  password?: string;
};

export type AuthActionState = {
  fieldErrors?: AuthFieldErrors;
  message?: string;
  status: "idle" | "error" | "success" | "setup";
};

export const INITIAL_AUTH_STATE: AuthActionState = { status: "idle" };

export type ValidatedCredentials = {
  email: string;
  password: string;
};

export type CredentialsValidationResult =
  | { data: ValidatedCredentials; success: true }
  | { errors: AuthFieldErrors; success: false };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readTextValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function validateCredentials(
  formData: FormData,
  locale: Locale = "en",
): CredentialsValidationResult {
  const email = readTextValue(formData, "email").trim().toLowerCase();
  const password = readTextValue(formData, "password");
  const errors: AuthFieldErrors = {};

  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.email = localize(locale, {
      en: "Enter a valid email address.",
      es: "Ingresá un correo electrónico válido.",
    });
  }

  if (password.length < 8 || password.length > 128) {
    errors.password = localize(locale, {
      en: "Password must be between 8 and 128 characters.",
      es: "La contraseña debe tener entre 8 y 128 caracteres.",
    });
  }

  if (Object.keys(errors).length > 0) {
    return { errors, success: false };
  }

  return {
    data: { email, password },
    success: true,
  };
}

export type AuthOperation = "sign-in" | "sign-up";

function readErrorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return undefined;
}

export function mapAuthError(
  operation: AuthOperation,
  error: unknown,
  locale: Locale = "en",
): string {
  const code = readErrorCode(error);
  const copy = localize(locale, {
    en: {
      confirmEmail: "Confirm your email before signing in.",
      createAccount: "We couldn't create the account. Try again in a few minutes.",
      invalidCredentials: "We couldn't verify those credentials.",
      rateLimit: "Too many attempts. Wait a few minutes and try again.",
      signIn: "We couldn't sign you in. Check your details and try again.",
      signUpDisabled: "Sign-up is temporarily unavailable.",
      weakPassword: "Choose a stronger password and try again.",
    },
    es: {
      confirmEmail: "Confirmá tu correo antes de ingresar.",
      createAccount: "No pudimos crear la cuenta. Intentá nuevamente en unos minutos.",
      invalidCredentials: "No pudimos validar esas credenciales.",
      rateLimit: "Hay demasiados intentos. Esperá unos minutos y volvé a probar.",
      signIn: "No pudimos iniciar sesión. Revisá los datos e intentá nuevamente.",
      signUpDisabled: "El registro está temporalmente deshabilitado.",
      weakPassword: "Elegí una contraseña más segura e intentá nuevamente.",
    },
  });

  if (operation === "sign-in") {
    if (code === "email_not_confirmed") {
      return copy.confirmEmail;
    }

    if (code === "invalid_credentials") {
      return copy.invalidCredentials;
    }

    if (code === "over_request_rate_limit") {
      return copy.rateLimit;
    }

    return copy.signIn;
  }

  if (code === "signup_disabled") {
    return copy.signUpDisabled;
  }

  if (
    code === "weak_password" ||
    code === "password_too_short" ||
    code === "validation_failed"
  ) {
    return copy.weakPassword;
  }

  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit"
  ) {
    return copy.rateLimit;
  }

  return copy.createAccount;
}
