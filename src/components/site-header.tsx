import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

const navigation = [
  { href: "#flujo", label: "Cómo funciona" },
  { href: "#control", label: "Qué controlás" },
  { href: "#seguridad", label: "Seguridad" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page-shell header-inner">
        <Link className="brand-link" href="/" aria-label="ReleaseDesk, inicio">
          <BrandMark className="brand-mark" />
          <span>ReleaseDesk</span>
        </Link>

        <nav aria-label="Navegación principal" className="desktop-navigation">
          {navigation.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <Link className="button button-small button-ink" href="/login">
          Ingresar
        </Link>
      </div>
    </header>
  );
}

