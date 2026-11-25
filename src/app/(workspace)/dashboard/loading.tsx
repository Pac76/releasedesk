export default function DashboardLoading() {
  return (
    <main className="dashboard-content" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando tu espacio…</span>
      <div className="dashboard-loading-heading">
        <span className="loading-line loading-line-short" />
        <span className="loading-line loading-line-title" />
      </div>
      <div className="metric-grid">
        {Array.from({ length: 6 }, (_, index) => (
          <span className="metric-card loading-metric" key={index} />
        ))}
      </div>
      <span className="dashboard-work loading-panel" />
    </main>
  );
}
