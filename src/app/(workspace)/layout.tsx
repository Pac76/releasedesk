import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { signOutAction } from "@/app/login/actions";
import { BrandMark } from "@/components/brand-mark";
import { LanguageSwitcher } from "@/components/language-switcher";
import { WorkspaceNavigation } from "@/components/workspace-navigation";
import { getVerifiedAuth } from "@/lib/auth/verified-user";
import { localize } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";

type WorkspaceLayoutProps = Readonly<{ children: ReactNode }>;

export default async function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  const [auth, locale] = await Promise.all([getVerifiedAuth(), getLocale()]);

  if (!auth) {
    redirect("/login");
  }

  const copy = localize(locale, {
    en: {
      brandLabel: "ReleaseDesk dashboard",
      signOut: "Sign out",
      unknownAccount: "Verified account",
      verified: "Verified session",
    },
    es: {
      brandLabel: "ReleaseDesk, panel principal",
      signOut: "Cerrar sesión",
      unknownAccount: "Cuenta verificada",
      verified: "Sesión verificada",
    },
  });

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link
          className="brand-link dashboard-brand"
          href="/dashboard"
          aria-label={copy.brandLabel}
        >
          <BrandMark className="brand-mark" />
          <span>ReleaseDesk</span>
        </Link>

        <WorkspaceNavigation />

        <LanguageSwitcher className="language-switcher-inverse workspace-language-control" />

        <div className="dashboard-account">
          <span>{copy.verified}</span>
          <strong title={auth.email || copy.unknownAccount}>
            {auth.email || copy.unknownAccount}
          </strong>
          <form action={signOutAction}>
            <button className="dashboard-signout" type="submit">
              {copy.signOut}
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
          <div className="dashboard-mobile-actions">
            <LanguageSwitcher className="language-switcher-inverse" />
            <form action={signOutAction}>
              <button className="dashboard-signout" type="submit">
                {copy.signOut}
              </button>
            </form>
          </div>
        </header>
        <WorkspaceNavigation mobile />
        {children}
      </div>
    </div>
  );
}
