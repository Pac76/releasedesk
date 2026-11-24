import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-inner">
        <Link className="brand-link" href="/" aria-label="ReleaseDesk, inicio">
          <BrandMark className="brand-mark" />
          <span>ReleaseDesk</span>
        </Link>
        <p>Un espacio claro para llegar a cada entrega con confianza.</p>
      </div>
    </footer>
  );
}

