import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { signOutAction } from "@/app/login/actions";
import { BrandMark } from "@/components/brand-mark";
import { createClient } from "@/lib/supabase/server";

type DashboardLayoutProps = Readonly<{ children: ReactNode }>;

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  let email = "Cuenta verificada";
  let isAuthenticated = false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const claims = data?.claims;

    isAuthenticated = !error && Boolean(claims?.sub);

    if (typeof claims?.email === "string") {
      email = claims.email;
    }
  } catch {
    isAuthenticated = false;
  }

  if (!isAuthenticated) {
    redirect("/login?next=%2Fdashboard");
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link
          className="brand-link dashboard-brand"
          href="/dashboard"
          aria-label="ReleaseDesk, panel principal"
        >
          <BrandMark className="brand-mark" />
          <span>ReleaseDesk</span>
        </Link>

        <nav aria-label="Navegación del espacio" className="dashboard-nav">
          <Link aria-current="page" href="/dashboard">
            <span aria-hidden="true">01</span>
            Resumen
          </Link>
          <span aria-disabled="true">
            <span aria-hidden="true">02</span>
            Proyectos · próximo
          </span>
        </nav>

        <div className="dashboard-account">
          <span>Sesión verificada</span>
          <strong title={email}>{email}</strong>
          <form action={signOutAction}>
            <button className="dashboard-signout" type="submit">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-mobile-header">
          <Link className="brand-link" href="/dashboard">
            <BrandMark className="brand-mark" />
            <span>ReleaseDesk</span>
          </Link>
          <form action={signOutAction}>
            <button className="dashboard-signout" type="submit">
              Salir
            </button>
          </form>
        </header>
        {children}
      </div>
    </div>
  );
}
