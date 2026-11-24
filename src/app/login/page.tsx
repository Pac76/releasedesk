import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export const metadata: Metadata = {
  title: "Acceso en preparación",
};

export default function LoginPlaceholderPage() {
  return (
    <main className="placeholder-page">
      <section className="placeholder-card" aria-labelledby="login-title">
        <Link className="brand-link" href="/" aria-label="Volver al inicio de ReleaseDesk">
          <BrandMark className="brand-mark" />
          <span>ReleaseDesk</span>
        </Link>
        <p className="eyebrow eyebrow-dark">Próximo incremento</p>
        <h1 id="login-title">El acceso al espacio está en preparación.</h1>
        <p>
          La autenticación segura con Supabase se habilitará en el incremento de acceso. Esta pantalla todavía no solicita ni almacena credenciales.
        </p>
        <Link className="text-link text-link-dark" href="/">
          <span aria-hidden="true">←</span> Volver al inicio
        </Link>
      </section>
    </main>
  );
}

