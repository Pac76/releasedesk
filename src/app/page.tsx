import Link from "next/link";

import { ReleasePreview } from "@/components/release-preview";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const capabilities = [
  {
    number: "01",
    title: "GitHub convertido en una decisión",
    description: "ReleaseDesk reúne workflow, commit principal, pull requests e issues en una captura verificable.",
  },
  {
    number: "02",
    title: "Capturas que dejan rastro",
    description: "Cada sincronización guarda evidencia inmutable para explicar qué señal produjo cada veredicto.",
  },
  {
    number: "03",
    title: "Operación y alcance, juntos",
    description: "Las señales del repositorio conviven con el trabajo de release, sus prioridades y sus fechas.",
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
              <p className="eyebrow"><span aria-hidden="true" /> Control operativo de releases</p>
              <h1 id="hero-title">Convertí las señales de GitHub en una decisión de release.</h1>
              <p className="hero-lead">
                Conectá un repositorio público, capturá su estado y entendé por qué una entrega está lista, en riesgo o bloqueada.
              </p>
              <div className="hero-actions">
                <Link className="button button-accent" href="/login">Crear mi espacio</Link>
                <a className="text-link" href="#flujo">Ver cómo funciona <span aria-hidden="true">→</span></a>
              </div>
              <div className="proof-line" aria-label="Características principales">
                <span><i aria-hidden="true" /> Evidencia de GitHub</span>
                <span><i aria-hidden="true" /> Política determinística</span>
                <span><i aria-hidden="true" /> Historial inmutable</span>
              </div>
            </div>
            <ReleasePreview />
          </div>
        </section>

        <section className="capabilities-section" id="control" aria-labelledby="control-title">
          <div className="page-shell">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow eyebrow-dark">Menos interpretación manual</p>
                <h2 id="control-title">La salud técnica y el trabajo operativo, en un mismo lugar.</h2>
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

