import type { Metadata } from "next";
import Link from "next/link";

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
          Ya podés administrar proyectos. Las métricas de trabajo y avance se
          habilitan en el próximo incremento, sin inventar datos intermedios.
        </p>
      </header>

      <section className="metric-grid" aria-label="Métricas próximas">
        {placeholderMetrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>Disponible con trabajo real</small>
          </article>
        ))}
      </section>

      <section className="dashboard-empty" aria-labelledby="empty-title">
        <div className="dashboard-empty-marker" aria-hidden="true">
          RD
        </div>
        <div>
          <p className="eyebrow eyebrow-dark">Primera señal</p>
          <h2 id="empty-title">Prepará el proyecto de tu próxima entrega.</h2>
          <p>
            Definí el objetivo, la fecha y el contexto. El trabajo y sus
            estados se sumarán en el siguiente incremento.
          </p>
        </div>
        <Link className="button button-ink" href="/projects">
          Gestionar proyectos
        </Link>
      </section>
    </main>
  );
}
