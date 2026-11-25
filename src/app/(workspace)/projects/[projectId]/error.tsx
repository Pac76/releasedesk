"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { localize } from "@/lib/i18n/locale";

export default function ProjectDetailError({ reset }: { reset: () => void }) {
  const locale = useLocale();
  const copy = localize(locale, {
    en: { back: "Back to projects", description: "No data details were exposed. Try again or return to your projects.", heading: "We couldn't load this project.", kicker: "Temporary interruption", retry: "Try again" },
    es: { back: "Volver a proyectos", description: "No se expuso ningún detalle de datos. Reintentá o volvé a tus proyectos.", heading: "No pudimos cargar este proyecto.", kicker: "Interrupción temporal", retry: "Reintentar" },
  });
  return (
    <main className="project-detail-content">
      <section className="work-empty" aria-labelledby="project-work-error">
        <span aria-hidden="true">!</span>
        <div>
          <p className="eyebrow eyebrow-dark">{copy.kicker}</p>
          <h1 id="project-work-error">{copy.heading}</h1>
          <p>{copy.description}</p>
          <div className="state-actions">
            <button className="button button-ink" onClick={reset} type="button">
              {copy.retry}
            </button>
            <Link className="text-link text-link-dark" href="/projects">
              {copy.back}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
