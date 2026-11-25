"use client";

import Link from "next/link";

export default function ProjectDetailError({ reset }: { reset: () => void }) {
  return (
    <main className="project-detail-content">
      <section className="work-empty" aria-labelledby="project-work-error">
        <span aria-hidden="true">!</span>
        <div>
          <p className="eyebrow eyebrow-dark">Interrupción temporal</p>
          <h1 id="project-work-error">No pudimos cargar este proyecto.</h1>
          <p>
            No se expuso ningún detalle de datos. Reintentá o volvé a tus
            proyectos.
          </p>
          <div className="state-actions">
            <button className="button button-ink" onClick={reset} type="button">
              Reintentar
            </button>
            <Link className="text-link text-link-dark" href="/projects">
              Volver a proyectos
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
