import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { LanguageSwitcher } from "@/components/language-switcher";
import { localize, type Locale } from "@/lib/i18n/locale";

export function SiteHeader({ locale }: Readonly<{ locale: Locale }>) {
  const copy = localize(locale, {
    en: {
      brandLabel: "ReleaseDesk home",
      navigation: [
        { href: "#flujo", label: "How it works" },
        { href: "#control", label: "What you control" },
        { href: "#seguridad", label: "Security" },
      ],
      navigationLabel: "Primary navigation",
      signIn: "Sign in",
    },
    es: {
      brandLabel: "ReleaseDesk, inicio",
      navigation: [
        { href: "#flujo", label: "Cómo funciona" },
        { href: "#control", label: "Qué controlás" },
        { href: "#seguridad", label: "Seguridad" },
      ],
      navigationLabel: "Navegación principal",
      signIn: "Ingresar",
    },
  });
  return (
    <header className="site-header">
      <div className="page-shell header-inner">
        <Link className="brand-link" href="/" aria-label={copy.brandLabel}>
          <BrandMark className="brand-mark" />
          <span>ReleaseDesk</span>
        </Link>

        <nav aria-label={copy.navigationLabel} className="desktop-navigation">
          {copy.navigation.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <LanguageSwitcher />
          <Link className="button button-small button-ink" href="/login">
            {copy.signIn}
          </Link>
        </div>
      </div>
    </header>
  );
}

