import Link from "next/link";

import { ReleasePreview } from "@/components/release-preview";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const capabilities = [
  {
    number: "01",
    title: "Un mapa único de la entrega",
    description: "Proyectos, prioridades y fechas viven en el mismo lugar. Sabés qué está listo y qué todavía necesita atención.",
  },
  {
    number: "02",
    title: "Decisiones que dejan rastro",
    description: "Cada cambio de estado hace visible el avance real, sin depender de reuniones ni planillas paralelas.",
  },
  {
    number: "03",
    title: "Riesgos antes del último día",
    description: "Los pendientes vencidos y los ítems en revisión aparecen cuando todavía hay tiempo para actuar.",
  },
] as const;

const stages = [
  { name: "Backlog", description: "Capturá el alcance sin perder contexto." },
  { name: "En curso", description: "Priorizá el trabajo que mueve la entrega." },
  { name: "Revisión", description: "Concentrá validaciones y últimos ajustes." },
  { name: "Listo", description: "Cerrá con una señal compartida y verificable." },
] as const;

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="page-shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span aria-hidden="true" /> Release readiness, sin ruido</p>
              <h1 id="hero-title">Llegá a cada entrega con señales claras, no con suposiciones.</h1>
              <p className="hero-lead">
                ReleaseDesk ordena proyectos, trabajo pendiente y revisiones en una vista simple para que sepas qué puede salir y qué necesita atención.
              </p>
              <div className="hero-actions">
                <Link className="button button-accent" href="/login">Crear mi espacio</Link>
                <a className="text-link" href="#flujo">Ver cómo funciona <span aria-hidden="true">→</span></a>
              </div>
              <div className="proof-line" aria-label="Características principales">
                <span><i aria-hidden="true" /> Foco individual</span>
                <span><i aria-hidden="true" /> Estado en tiempo real</span>
                <span><i aria-hidden="true" /> Datos protegidos</span>
              </div>
            </div>
            <ReleasePreview />
          </div>
        </section>

        <section className="capabilities-section" id="control" aria-labelledby="control-title">
          <div className="page-shell">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow eyebrow-dark">Menos coordinación manual</p>
                <h2 id="control-title">Todo lo importante, visible antes de publicar.</h2>
              </div>
              <p>Una vista operativa pensada para personas que construyen y entregan software, no para llenar reportes.</p>
            </div>
            <div className="capability-grid">
              {capabilities.map((capability) => (
                <article className="capability-card" key={capability.number}>
                  <span className="capability-number">{capability.number}</span>
                  <h3>{capability.title}</h3>
                  <p>{capability.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="workflow-section" id="flujo" aria-labelledby="flow-title">
          <div className="page-shell workflow-grid">
            <div className="workflow-intro">
              <p className="eyebrow eyebrow-dark">Un flujo, cuatro señales</p>
              <h2 id="flow-title">Del alcance inicial a una entrega lista.</h2>
              <p>Cada ítem avanza con un lenguaje simple. El tablero deja de ser un inventario y se convierte en una decisión de release.</p>
              <Link className="text-link text-link-dark" href="/login">Preparar una entrega <span aria-hidden="true">→</span></Link>
            </div>
            <ol aria-label="Etapas de una entrega" className="stage-list">
              {stages.map((stage, index) => (
                <li key={stage.name}>
                  <span className="stage-index">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{stage.name}</h3>
                    <p>{stage.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="security-section" id="seguridad" aria-labelledby="security-title">
          <div className="page-shell security-card">
            <div className="security-mark" aria-hidden="true">
              <svg fill="none" viewBox="0 0 48 48"><path d="M24 5 40 11v11c0 10.2-6.6 18.7-16 21-9.4-2.3-16-10.8-16-21V11l16-6Z" stroke="currentColor" strokeWidth="2"/><path d="m17.5 24 4.5 4.5 9-10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
            </div>
            <div>
              <p className="eyebrow eyebrow-light">Seguridad por diseño</p>
              <h2 id="security-title">Tu espacio se mantiene realmente tuyo.</h2>
            </div>
            <p>El acceso se valida en el servidor y la base de datos aplica reglas por propietario. La interfaz nunca es la única barrera entre una persona y los datos de otra.</p>
          </div>
        </section>

        <section className="closing-section" aria-labelledby="closing-title">
          <div className="page-shell closing-inner">
            <p className="eyebrow eyebrow-dark">La próxima entrega empieza acá</p>
            <h2 id="closing-title">Menos dudas al final.<br />Más claridad durante todo el camino.</h2>
            <Link className="button button-ink" href="/login">Empezar con ReleaseDesk</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

