export default function ProjectsLoading() {
  return (
    <main className="projects-content" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando proyectos…</span>
      <div className="projects-loading-heading">
        <span className="loading-line loading-line-short" />
        <span className="loading-line loading-line-title" />
        <span className="loading-line loading-line-medium" />
      </div>
      <span className="project-create projects-loading-panel" />
      <div className="projects-loading-grid">
        <span className="project-card projects-loading-card" />
        <span className="project-card projects-loading-card" />
      </div>
    </main>
  );
}
