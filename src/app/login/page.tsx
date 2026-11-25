import type { Metadata } from "next";
import Link from "next/link";

import { signInAction, signUpAction } from "@/app/login/actions";
import { AuthForm } from "@/app/login/auth-form";
import { BrandMark } from "@/components/brand-mark";
import { sanitizeNextPath } from "@/lib/auth/redirects";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Acceso seguro",
};

const loginNotices: Record<string, string> = {
  confirmation_error:
    "El enlace de confirmación no es válido o ya venció. Solicitá uno nuevo desde Supabase Auth.",
  setup:
    "Falta conectar Supabase para completar la confirmación de correo.",
};

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchValue(
  value: string | string[] | undefined,
): string | undefined {
  return typeof value === "string" ? value : value?.[0];
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = (await searchParams) ?? {};
  const nextPath = sanitizeNextPath(readSearchValue(query.next));
  const noticeKey = readSearchValue(query.notice);
  const notice = noticeKey ? loginNotices[noticeKey] : undefined;
  const isConfigured = hasSupabaseConfig();

  return (
    <main className="auth-page">
      <section className="auth-intro" aria-labelledby="login-title">
        <Link
          className="brand-link auth-brand"
          href="/"
          aria-label="Volver al inicio de ReleaseDesk"
        >
          <BrandMark className="brand-mark" />
          <span>ReleaseDesk</span>
        </Link>
        <div>
          <p className="eyebrow eyebrow-light">
            <span aria-hidden="true" />
            Acceso protegido
          </p>
          <h1 id="login-title">Tu próxima entrega empieza con una señal clara.</h1>
          <p className="auth-intro-copy">
            Ingresá o creá una cuenta para preparar proyectos y trabajo sin
            mezclar datos entre usuarios.
          </p>
        </div>
        <Link className="text-link" href="/">
          <span aria-hidden="true">←</span> Volver al inicio
        </Link>
      </section>

      <section className="auth-workspace" aria-label="Acceso a ReleaseDesk">
        <div className="auth-workspace-inner">
          <div className="auth-workspace-heading">
            <p className="eyebrow eyebrow-dark">Espacio personal</p>
            <h2>Acceso a ReleaseDesk</h2>
            <p>
              Correo y contraseña viajan a Supabase Auth desde acciones del
              servidor. ReleaseDesk no almacena tu contraseña.
            </p>
          </div>

          {notice ? (
            <p className="auth-page-notice" role="status">
              {notice}
            </p>
          ) : null}

          {!isConfigured ? (
            <div className="auth-setup" role="status">
              <strong>Conexión pendiente</strong>
              <p>
                La interfaz está lista, pero faltan la URL y la clave pública
                de Supabase. Configuralas para habilitar registro e ingreso.
              </p>
              <Link className="text-link text-link-dark" href="/">
                Revisar el producto <span aria-hidden="true">→</span>
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

