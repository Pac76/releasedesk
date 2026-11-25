"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main className="dashboard-content">
      <section className="dashboard-empty" aria-labelledby="dashboard-error">
        <div className="dashboard-empty-marker" aria-hidden="true">
          !
        </div>
        <div>
          <p className="eyebrow eyebrow-dark">Interrupción temporal</p>
          <h1 id="dashboard-error">No pudimos cargar tu espacio.</h1>
          <p>
            Tu sesión sigue protegida. Probá nuevamente y, si el problema
            continúa, volvé a ingresar.
          </p>
        </div>
        <button className="button button-ink" onClick={reset} type="button">
          Reintentar
        </button>
      </section>
    </main>
  );
}
