import Link from "next/link";
import { localize } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";

export default async function ProjectNotFound() {
  const locale = await getLocale();
  const copy = localize(locale, {
    en: { back: "Back to projects", description: "It may no longer exist or may not be available to your account.", heading: "We couldn't find this project.", kicker: "Project unavailable" },
    es: { back: "Volver a proyectos", description: "Puede que ya no exista o que no esté disponible para tu cuenta.", heading: "No encontramos este proyecto.", kicker: "Proyecto no disponible" },
  });
  return (
    <main className="project-detail-content">
      <section className="work-empty" aria-labelledby="project-not-found">
        <span aria-hidden="true">404</span>
        <div>
          <p className="eyebrow eyebrow-dark">{copy.kicker}</p>
          <h1 id="project-not-found">{copy.heading}</h1>
          <p>{copy.description}</p>
          <Link className="button button-ink" href="/projects">
            {copy.back}
          </Link>
        </div>
      </section>
    </main>
  );
}
