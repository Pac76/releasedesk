"use client";

import { useLocale } from "@/components/locale-provider";
import { localize } from "@/lib/i18n/locale";

export default function DashboardError({ reset }: { reset: () => void }) {
  const locale = useLocale();
  const copy = localize(locale, {
    en: { description: "Your session remains protected. Try again and, if the problem continues, sign in again.", heading: "We couldn't load your workspace.", kicker: "Temporary interruption", retry: "Try again" },
    es: { description: "Tu sesión sigue protegida. Probá nuevamente y, si el problema continúa, volvé a ingresar.", heading: "No pudimos cargar tu espacio.", kicker: "Interrupción temporal", retry: "Reintentar" },
  });
  return (
    <main className="dashboard-content">
      <section className="dashboard-empty" aria-labelledby="dashboard-error">
        <div className="dashboard-empty-marker" aria-hidden="true">
          !
        </div>
        <div>
          <p className="eyebrow eyebrow-dark">{copy.kicker}</p>
          <h1 id="dashboard-error">{copy.heading}</h1>
          <p>{copy.description}</p>
        </div>
        <button className="button button-ink" onClick={reset} type="button">
          {copy.retry}
        </button>
      </section>
    </main>
  );
}
