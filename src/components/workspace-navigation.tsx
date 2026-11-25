"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const workspaceLinks = [
  { href: "/dashboard", index: "01", label: "Resumen" },
  { href: "/projects", index: "02", label: "Proyectos" },
] as const;

type WorkspaceNavigationProps = {
  mobile?: boolean;
};

export function WorkspaceNavigation({ mobile = false }: WorkspaceNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={mobile ? "Navegación móvil del espacio" : "Navegación del espacio"}
      className={mobile ? "workspace-mobile-nav" : "dashboard-nav"}
    >
      {workspaceLinks.map((link) => {
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
          Trabajo · próximo
        </span>
      ) : null}
    </nav>
  );
}
