import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { signOutAction } from "@/app/login/actions";
import { BrandMark } from "@/components/brand-mark";
import { WorkspaceNavigation } from "@/components/workspace-navigation";
import { getVerifiedAuth } from "@/lib/auth/verified-user";

type WorkspaceLayoutProps = Readonly<{ children: ReactNode }>;

export default async function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  const auth = await getVerifiedAuth();

  if (!auth) {
    redirect("/login");
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

        <WorkspaceNavigation />

        <div className="dashboard-account">
          <span>Sesión verificada</span>
          <strong title={auth.email}>{auth.email}</strong>
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
        <WorkspaceNavigation mobile />
        {children}
      </div>
    </div>
  );
}
