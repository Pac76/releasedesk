import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel",
};

const placeholderMetrics = [
  { label: "Proyectos", value: "—" },
  { label: "En curso", value: "—" },
  { label: "En revisión", value: "—" },
  { label: "Listos", value: "—" },
] as const;

export default function DashboardPage() {
  return (
    <main className="dashboard-content">
      <header className="dashboard-heading">
        <div>
          <p className="eyebrow eyebrow-dark">Centro de preparación</p>
          <h1>Tu mesa de entrega está lista.</h1>
        </div>
        <p>
          La conexión segura ya está preparada. Los proyectos y señales de
          avance se habilitan en el próximo incremento.
        </p>
      </header>

      <section className="metric-grid" aria-label="Métricas próximas">
        {placeholderMetrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>Sin datos todavía</small>
          </article>
        ))}
      </section>

      <section className="dashboard-empty" aria-labelledby="empty-title">
        <div className="dashboard-empty-marker" aria-hidden="true">
          RD
        </div>
        <div>
          <p className="eyebrow eyebrow-dark">Siguiente señal</p>
          <h2 id="empty-title">Todavía no hay proyectos en este espacio.</h2>
          <p>
            En el siguiente incremento vas a poder crear el primero, definir
            su fecha objetivo y ordenar el trabajo hasta dejarlo listo para
            publicar.
          </p>
        </div>
        <span className="dashboard-next-action" aria-disabled="true">
          Crear proyecto · próximamente
        </span>
      </section>
    </main>
  );
}
