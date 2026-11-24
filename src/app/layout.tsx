import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ReleaseDesk — Entregas bajo control",
    template: "%s · ReleaseDesk",
  },
  description:
    "Organizá proyectos, detectá bloqueos y llegá a cada entrega de software con señales claras.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

