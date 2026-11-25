import type { Metadata } from "next";
import type { ReactNode } from "react";

import { LocaleProvider } from "@/components/locale-provider";
import { localize } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return localize(locale, {
    en: {
      title: {
        default: "ReleaseDesk — Releases under control",
        template: "%s · ReleaseDesk",
      },
      description:
        "Organize projects, identify blockers, and ship software with clear release signals.",
    },
    es: {
      title: {
        default: "ReleaseDesk — Entregas bajo control",
        template: "%s · ReleaseDesk",
      },
      description:
        "Organizá proyectos, detectá bloqueos y llegá a cada entrega de software con señales claras.",
    },
  });
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}

