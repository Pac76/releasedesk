export default function ProjectDetailLoading() {
  return (
    <main
      className="project-detail-content"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Cargando proyecto y trabajo…</span>
      <div className="projects-loading-heading">
        <span className="loading-line loading-line-short" />
        <span className="loading-line loading-line-title" />
        <span className="loading-line loading-line-medium" />
      </div>
      <span className="work-create projects-loading-panel" />
      <div className="projects-loading-grid">
        <span className="work-item-card projects-loading-card" />
        <span className="work-item-card projects-loading-card" />
      </div>
    </main>
  );
}
