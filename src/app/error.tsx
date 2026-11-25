"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { localize } from "@/lib/i18n/locale";

export default function ErrorPage({ retry }: { retry: () => void }) {
  const locale = useLocale();
  const copy = localize(locale, {
    en: { back: "Back to home", description: "Try again. If the problem continues, return to the home page.", heading: "We couldn't load this view.", kicker: "Something did not go as expected", retry: "Try again" },
    es: { back: "Volver al inicio", description: "Podés volver a intentarlo. Si el problema continúa, regresá al inicio.", heading: "No pudimos cargar esta vista.", kicker: "Algo no salió como esperábamos", retry: "Reintentar" },
  });
  return (
    <main className="state-page">
      <section className="state-card" aria-labelledby="error-title">
        <p className="eyebrow eyebrow-dark">{copy.kicker}</p>
        <h1 id="error-title">{copy.heading}</h1>
        <p>{copy.description}</p>
        <div className="state-actions">
          <button className="button button-accent" onClick={retry} type="button">{copy.retry}</button>
          <Link className="text-link text-link-dark" href="/">{copy.back}</Link>
        </div>
      </section>
    </main>
  );
}

