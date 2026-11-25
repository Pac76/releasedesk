"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { localize } from "@/lib/i18n/locale";

export default function ProjectsError({ reset }: { reset: () => void }) {
  const locale = useLocale();
  const copy = localize(locale, {
    en: { back: "Back to dashboard", description: "No data details were exposed. Try again or return to the dashboard.", heading: "We couldn't load your projects.", kicker: "Temporary interruption", retry: "Try again" },
    es: { back: "Volver al resumen", description: "No se expuso ningún detalle de datos. Reintentá o volvé al resumen.", heading: "No pudimos cargar tus proyectos.", kicker: "Interrupción temporal", retry: "Reintentar" },
  });
  return (
    <main className="projects-content">
      <section className="projects-empty" aria-labelledby="projects-error-title">
        <span aria-hidden="true">!</span>
        <div>
          <p className="eyebrow eyebrow-dark">{copy.kicker}</p>
          <h1 id="projects-error-title">{copy.heading}</h1>
          <p>{copy.description}</p>
          <div className="state-actions">
            <button className="button button-ink" onClick={reset} type="button">
              {copy.retry}
            </button>
            <Link className="text-link text-link-dark" href="/dashboard">
              {copy.back}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
