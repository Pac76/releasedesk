import type { Metadata } from "next";
import Link from "next/link";

import { signInAction, signUpAction } from "@/app/login/actions";
import { AuthForm } from "@/app/login/auth-form";
import { BrandMark } from "@/components/brand-mark";
import { LanguageSwitcher } from "@/components/language-switcher";
import { sanitizeNextPath } from "@/lib/auth/redirects";
import { localize } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: localize(locale, { en: "Secure access", es: "Acceso seguro" }),
  };
}

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchValue(
  value: string | string[] | undefined,
): string | undefined {
  return typeof value === "string" ? value : value?.[0];
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const locale = await getLocale();
  const copy = localize(locale, {
    en: {
      accessDescription: "Email and password are sent to Supabase Auth through server actions. ReleaseDesk never stores your password.",
      accessHeading: "ReleaseDesk access",
      accessLabel: "ReleaseDesk access",
      brandLabel: "Back to the ReleaseDesk home page",
      intro: "Sign in or create an account to manage projects and work without mixing data between users.",
      kicker: "Protected access",
      notices: {
        confirmation_error: "The confirmation link is invalid or has expired. Request a new one through Supabase Auth.",
        setup: "Connect Supabase to complete email confirmation.",
      } as Record<string, string>,
      personal: "Personal workspace",
      reviewProduct: "Review the product",
      setupDescription: "The interface is ready, but the Supabase URL and public key are missing. Configure them to enable sign-up and sign-in.",
      setupHeading: "Connection required",
      title: "Your next release starts with a clear signal.",
      back: "Back to home",
    },
    es: {
      accessDescription: "Correo y contraseña viajan a Supabase Auth desde acciones del servidor. ReleaseDesk no almacena tu contraseña.",
      accessHeading: "Acceso a ReleaseDesk",
      accessLabel: "Acceso a ReleaseDesk",
      brandLabel: "Volver al inicio de ReleaseDesk",
      intro: "Ingresá o creá una cuenta para preparar proyectos y trabajo sin mezclar datos entre usuarios.",
      kicker: "Acceso protegido",
      notices: {
        confirmation_error: "El enlace de confirmación no es válido o ya venció. Solicitá uno nuevo desde Supabase Auth.",
        setup: "Falta conectar Supabase para completar la confirmación de correo.",
      } as Record<string, string>,
      personal: "Espacio personal",
      reviewProduct: "Revisar el producto",
      setupDescription: "La interfaz está lista, pero faltan la URL y la clave pública de Supabase. Configuralas para habilitar registro e ingreso.",
      setupHeading: "Conexión pendiente",
      title: "Tu próxima entrega empieza con una señal clara.",
      back: "Volver al inicio",
    },
  });
  const query = (await searchParams) ?? {};
  const nextPath = sanitizeNextPath(readSearchValue(query.next));
  const noticeKey = readSearchValue(query.notice);
  const notice = noticeKey ? copy.notices[noticeKey] : undefined;
  const isConfigured = hasSupabaseConfig();

  return (
    <main className="auth-page">
      <section className="auth-intro" aria-labelledby="login-title">
        <div className="auth-brand-row">
          <Link
            className="brand-link auth-brand"
            href="/"
            aria-label={copy.brandLabel}
          >
            <BrandMark className="brand-mark" />
            <span>ReleaseDesk</span>
          </Link>
          <LanguageSwitcher className="language-switcher-inverse" />
        </div>
        <div>
          <p className="eyebrow eyebrow-light">
            <span aria-hidden="true" />
            {copy.kicker}
          </p>
          <h1 id="login-title">{copy.title}</h1>
          <p className="auth-intro-copy">{copy.intro}</p>
        </div>
        <Link className="text-link" href="/">
          <span aria-hidden="true">←</span> {copy.back}
        </Link>
      </section>

      <section className="auth-workspace" aria-label={copy.accessLabel}>
        <div className="auth-workspace-inner">
          <div className="auth-workspace-heading">
            <p className="eyebrow eyebrow-dark">{copy.personal}</p>
            <h2>{copy.accessHeading}</h2>
            <p>{copy.accessDescription}</p>
          </div>

          {notice ? (
            <p className="auth-page-notice" role="status">
              {notice}
            </p>
          ) : null}

          {!isConfigured ? (
            <div className="auth-setup" role="status">
              <strong>{copy.setupHeading}</strong>
              <p>{copy.setupDescription}</p>
              <Link className="text-link text-link-dark" href="/">
                {copy.reviewProduct} <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            <div className="auth-forms-grid">
              <AuthForm
                action={signInAction}
                nextPath={nextPath}
                variant="sign-in"
              />
              <AuthForm
                action={signUpAction}
                nextPath={nextPath}
                variant="sign-up"
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

