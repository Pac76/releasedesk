export default function Loading() {
  return (
    <main className="state-page" aria-busy="true" aria-live="polite">
      <div className="state-card">
        <span className="loading-line loading-line-short" />
        <span className="loading-line loading-line-title" />
        <span className="loading-line" />
        <span className="loading-line loading-line-medium" />
        <span className="sr-only">Cargando ReleaseDesk…</span>
      </div>
    </main>
  );
}

