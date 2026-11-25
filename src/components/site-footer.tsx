import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { localize, type Locale } from "@/lib/i18n/locale";

export function SiteFooter({ locale }: Readonly<{ locale: Locale }>) {
  const copy = localize(locale, {
    en: {
      brandLabel: "ReleaseDesk home",
      tagline: "A clear workspace for shipping every release with confidence.",
    },
    es: {
      brandLabel: "ReleaseDesk, inicio",
      tagline: "Un espacio claro para llegar a cada entrega con confianza.",
    },
  });
  return (
    <footer className="site-footer">
      <div className="page-shell footer-inner">
        <Link className="brand-link" href="/" aria-label={copy.brandLabel}>
          <BrandMark className="brand-mark" />
          <span>ReleaseDesk</span>
        </Link>
        <p>{copy.tagline}</p>
      </div>
    </footer>
  );
}

