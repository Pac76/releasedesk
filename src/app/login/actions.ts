"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  type AuthActionState,
  mapAuthError,
  validateCredentials,
} from "@/lib/auth/validation";
import {
  getTrustedSiteOrigin,
  sanitizeNextPath,
} from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";
import { localize } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";

function setupState(locale: Awaited<ReturnType<typeof getLocale>>): AuthActionState {
  return {
    message: localize(locale, {
      en: "Supabase is not connected. Configure the public environment variables to enable access.",
      es: "Falta conectar Supabase. Configurá las variables públicas para habilitar el acceso.",
    }),
    status: "setup",
  };
}

function readNextPath(formData: FormData): string {
  const next = formData.get("next");
  return sanitizeNextPath(typeof next === "string" ? next : undefined);
}

export async function signInAction(
  previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  void previousState;
  const locale = await getLocale();
  const validation = validateCredentials(formData, locale);

  if (!validation.success) {
    return {
      fieldErrors: validation.errors,
      message: localize(locale, {
        en: "Review the highlighted fields.",
        es: "Revisá los campos marcados.",
      }),
      status: "error",
    };
  }

  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
  } catch {
    return setupState(locale);
  }

  try {
    const { error } = await supabase.auth.signInWithPassword(validation.data);

    if (error) {
      return {
        message: mapAuthError("sign-in", error, locale),
        status: "error",
      };
    }
  } catch {
    return {
      message: mapAuthError("sign-in", undefined, locale),
      status: "error",
    };
  }

  redirect(readNextPath(formData));
}

export async function signUpAction(
  previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  void previousState;
  const locale = await getLocale();
  const validation = validateCredentials(formData, locale);

  if (!validation.success) {
    return {
      fieldErrors: validation.errors,
      message: localize(locale, {
        en: "Review the highlighted fields.",
        es: "Revisá los campos marcados.",
      }),
      status: "error",
    };
  }

  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
  } catch {
    return setupState(locale);
  }

  let hasSession = false;
  try {
    const requestHeaders = await headers();
    const { data, error } = await supabase.auth.signUp({
      ...validation.data,
      options: {
        emailRedirectTo: getTrustedSiteOrigin(requestHeaders),
      },
    });

    if (error) {
      return {
        message: mapAuthError("sign-up", error, locale),
        status: "error",
      };
    }

    hasSession = Boolean(data.session);
  } catch {
    return {
      message: mapAuthError("sign-up", undefined, locale),
      status: "error",
    };
  }

  if (hasSession) {
    redirect(readNextPath(formData));
  }

  return {
    message: localize(locale, {
      en: "Check your email and confirm your account using the link we sent.",
      es: "Revisá tu correo y confirmá la cuenta desde el enlace que te enviamos.",
    }),
    status: "success",
  };
}

export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    try {
      await supabase.auth.getClaims();
    } finally {
      await supabase.auth.signOut({ scope: "local" });
    }
  } catch {
    // The destination remains public even if the remote session is unavailable.
  }

  redirect("/");
}
