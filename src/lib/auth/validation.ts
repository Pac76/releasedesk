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
): CredentialsValidationResult {
  const email = readTextValue(formData, "email").trim().toLowerCase();
  const password = readTextValue(formData, "password");
  const errors: AuthFieldErrors = {};

  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.email = "Ingresá un correo electrónico válido.";
  }

  if (password.length < 8 || password.length > 128) {
    errors.password = "La contraseña debe tener entre 8 y 128 caracteres.";
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
): string {
  const code = readErrorCode(error);

  if (operation === "sign-in") {
    if (code === "email_not_confirmed") {
      return "Confirmá tu correo antes de ingresar.";
    }

    if (code === "invalid_credentials") {
      return "No pudimos validar esas credenciales.";
    }

    if (code === "over_request_rate_limit") {
      return "Hay demasiados intentos. Esperá unos minutos y volvé a probar.";
    }

    return "No pudimos iniciar sesión. Revisá los datos e intentá nuevamente.";
  }

  if (code === "signup_disabled") {
    return "El registro está temporalmente deshabilitado.";
  }

  if (
    code === "weak_password" ||
    code === "password_too_short" ||
    code === "validation_failed"
  ) {
    return "Elegí una contraseña más segura e intentá nuevamente.";
  }

  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit"
  ) {
    return "Hay demasiados intentos. Esperá unos minutos y volvé a probar.";
  }

  return "No pudimos crear la cuenta. Intentá nuevamente en unos minutos.";
}
