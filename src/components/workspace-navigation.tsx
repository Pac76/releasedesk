"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLocale } from "@/components/locale-provider";
import { localize } from "@/lib/i18n/locale";

type WorkspaceNavigationProps = {
  mobile?: boolean;
};

export function WorkspaceNavigation({ mobile = false }: WorkspaceNavigationProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const copy = localize(locale, {
    en: {
      label: "Workspace navigation",
      links: [
        { href: "/dashboard", index: "01", label: "Overview" },
        { href: "/projects", index: "02", label: "Projects" },
      ],
      mobileLabel: "Mobile workspace navigation",
      next: "Work · next",
    },
    es: {
      label: "Navegación del espacio",
      links: [
        { href: "/dashboard", index: "01", label: "Resumen" },
        { href: "/projects", index: "02", label: "Proyectos" },
      ],
      mobileLabel: "Navegación móvil del espacio",
      next: "Trabajo · próximo",
    },
  } as const);

  return (
    <nav
      aria-label={mobile ? copy.mobileLabel : copy.label}
      className={mobile ? "workspace-mobile-nav" : "dashboard-nav"}
    >
      {copy.links.map((link) => {
        const isCurrent =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            aria-current={isCurrent ? "page" : undefined}
            href={link.href}
            key={link.href}
          >
            {!mobile ? <span aria-hidden="true">{link.index}</span> : null}
            {link.label}
          </Link>
        );
      })}
      {!mobile ? (
        <span aria-disabled="true">
          <span aria-hidden="true">03</span>
          {copy.next}
        </span>
      ) : null}
    </nav>
  );
}
