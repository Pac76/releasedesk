import Link from "next/link";
import { localize } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";

export default async function NotFound() {
  const locale = await getLocale();
  const copy = localize(locale, {
    en: { back: "Back to home", description: "The page you are looking for does not exist or has moved.", heading: "This route is not part of the release." },
    es: { back: "Volver al inicio", description: "La página que buscás no existe o cambió de ubicación.", heading: "Esta ruta no forma parte de la entrega." },
  });
  return (
    <main className="state-page">
      <section className="state-card" aria-labelledby="not-found-title">
        <p className="eyebrow eyebrow-dark">Error 404</p>
        <h1 id="not-found-title">{copy.heading}</h1>
        <p>{copy.description}</p>
        <Link className="button button-ink" href="/">{copy.back}</Link>
      </section>
    </main>
  );
}

