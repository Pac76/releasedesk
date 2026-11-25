import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <main className="project-detail-content">
      <section className="work-empty" aria-labelledby="project-not-found">
        <span aria-hidden="true">404</span>
        <div>
          <p className="eyebrow eyebrow-dark">Proyecto no disponible</p>
          <h1 id="project-not-found">No encontramos este proyecto.</h1>
          <p>
            Puede que ya no exista o que no esté disponible para tu cuenta.
          </p>
          <Link className="button button-ink" href="/projects">
            Volver a proyectos
          </Link>
        </div>
      </section>
    </main>
  );
}
