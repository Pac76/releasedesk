"use client";

import Link from "next/link";

export default function ProjectsError({ reset }: { reset: () => void }) {
  return (
    <main className="projects-content">
      <section className="projects-empty" aria-labelledby="projects-error-title">
        <span aria-hidden="true">!</span>
        <div>
          <p className="eyebrow eyebrow-dark">Interrupción temporal</p>
          <h1 id="projects-error-title">No pudimos cargar tus proyectos.</h1>
          <p>
            No se expuso ningún detalle de datos. Reintentá o volvé al resumen.
          </p>
          <div className="state-actions">
            <button className="button button-ink" onClick={reset} type="button">
              Reintentar
            </button>
            <Link className="text-link text-link-dark" href="/dashboard">
              Volver al resumen
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
