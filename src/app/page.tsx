import Link from "next/link";

import { ReleasePreview } from "@/components/release-preview";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { localize } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";

export default async function HomePage() {
  const locale = await getLocale();
  const copy = localize(locale, {
    en: {
      capabilities: [
        {
          number: "01",
          title: "Turn GitHub into a decision",
          description: "ReleaseDesk combines workflow, default-branch commit, pull requests, and issues in one verifiable snapshot.",
        },
        {
          number: "02",
          title: "Snapshots that leave a trail",
          description: "Every sync stores immutable evidence so each readiness verdict can be explained.",
        },
        {
          number: "03",
          title: "Operations and scope, together",
          description: "Repository signals live alongside release work, priorities, and target dates.",
        },
      ],
      capabilitiesIntro: "An operational view for people who build and ship software—not for filling out reports.",
      capabilitiesKicker: "Less manual interpretation",
      capabilitiesTitle: "Technical health and operational work, in one place.",
      closingAction: "Start with ReleaseDesk",
      closingKicker: "Your next release starts here",
      closingTitleFirst: "Fewer doubts at the finish.",
      closingTitleSecond: "More clarity throughout the process.",
      flowAction: "Prepare a release",
      flowDescription: "Each item moves forward in plain language. The board stops being an inventory and becomes a release decision.",
      flowKicker: "One flow, four signals",
      flowLabel: "Release stages",
      flowTitle: "From initial scope to release-ready.",
      heroAction: "Create my workspace",
      heroDescription: "Connect a public repository, capture its state, and understand why a release is ready, at risk, or blocked.",
      heroKicker: "Release operations control",
      heroProofLabel: "Key product capabilities",
      heroProofs: ["GitHub evidence", "Deterministic policy", "Immutable history"],
      heroSecondaryAction: "See how it works",
      heroTitle: "Turn GitHub signals into a release decision.",
      securityDescription: "Access is verified on the server, and the database enforces ownership rules. The interface is never the only barrier between one person and another person's data.",
      securityKicker: "Security by design",
      securityTitle: "Your workspace stays truly yours.",
      stages: [
        { name: "Backlog", description: "Capture scope without losing context." },
        { name: "In progress", description: "Prioritize the work that moves the release forward." },
        { name: "Review", description: "Focus validation and final adjustments." },
        { name: "Ready", description: "Close with a shared, verifiable signal." },
      ],
    },
    es: {
      capabilities: [
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
      ],
      capabilitiesIntro: "Una vista operativa pensada para personas que construyen y entregan software, no para llenar reportes.",
      capabilitiesKicker: "Menos interpretación manual",
      capabilitiesTitle: "La salud técnica y el trabajo operativo, en un mismo lugar.",
      closingAction: "Empezar con ReleaseDesk",
      closingKicker: "La próxima entrega empieza acá",
      closingTitleFirst: "Menos dudas al final.",
      closingTitleSecond: "Más claridad durante todo el camino.",
      flowAction: "Preparar una entrega",
      flowDescription: "Cada ítem avanza con un lenguaje simple. El tablero deja de ser un inventario y se convierte en una decisión de release.",
      flowKicker: "Un flujo, cuatro señales",
      flowLabel: "Etapas de una entrega",
      flowTitle: "Del alcance inicial a una entrega lista.",
      heroAction: "Crear mi espacio",
      heroDescription: "Conectá un repositorio público, capturá su estado y entendé por qué una entrega está lista, en riesgo o bloqueada.",
      heroKicker: "Control operativo de releases",
      heroProofLabel: "Características principales",
      heroProofs: ["Evidencia de GitHub", "Política determinística", "Historial inmutable"],
      heroSecondaryAction: "Ver cómo funciona",
      heroTitle: "Convertí las señales de GitHub en una decisión de release.",
      securityDescription: "El acceso se valida en el servidor y la base de datos aplica reglas por propietario. La interfaz nunca es la única barrera entre una persona y los datos de otra.",
      securityKicker: "Seguridad por diseño",
      securityTitle: "Tu espacio se mantiene realmente tuyo.",
      stages: [
        { name: "Backlog", description: "Capturá el alcance sin perder contexto." },
        { name: "En curso", description: "Priorizá el trabajo que mueve la entrega." },
        { name: "Revisión", description: "Concentrá validaciones y últimos ajustes." },
        { name: "Listo", description: "Cerrá con una señal compartida y verificable." },
      ],
    },
  } as const);
  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="page-shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span aria-hidden="true" /> {copy.heroKicker}</p>
              <h1 id="hero-title">{copy.heroTitle}</h1>
              <p className="hero-lead">{copy.heroDescription}</p>
              <div className="hero-actions">
                <Link className="button button-accent" href="/login">{copy.heroAction}</Link>
                <a className="text-link" href="#flujo">{copy.heroSecondaryAction} <span aria-hidden="true">→</span></a>
              </div>
              <div className="proof-line" aria-label={copy.heroProofLabel}>
                {copy.heroProofs.map((proof) => <span key={proof}><i aria-hidden="true" /> {proof}</span>)}
              </div>
            </div>
            <ReleasePreview locale={locale} />
          </div>
        </section>

        <section className="capabilities-section" id="control" aria-labelledby="control-title">
          <div className="page-shell">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow eyebrow-dark">{copy.capabilitiesKicker}</p>
                <h2 id="control-title">{copy.capabilitiesTitle}</h2>
              </div>
              <p>{copy.capabilitiesIntro}</p>
            </div>
            <div className="capability-grid">
              {copy.capabilities.map((capability) => (
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
              <p className="eyebrow eyebrow-dark">{copy.flowKicker}</p>
              <h2 id="flow-title">{copy.flowTitle}</h2>
              <p>{copy.flowDescription}</p>
              <Link className="text-link text-link-dark" href="/login">{copy.flowAction} <span aria-hidden="true">→</span></Link>
            </div>
            <ol aria-label={copy.flowLabel} className="stage-list">
              {copy.stages.map((stage, index) => (
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
              <p className="eyebrow eyebrow-light">{copy.securityKicker}</p>
              <h2 id="security-title">{copy.securityTitle}</h2>
            </div>
            <p>{copy.securityDescription}</p>
          </div>
        </section>

        <section className="closing-section" aria-labelledby="closing-title">
          <div className="page-shell closing-inner">
            <p className="eyebrow eyebrow-dark">{copy.closingKicker}</p>
            <h2 id="closing-title">{copy.closingTitleFirst}<br />{copy.closingTitleSecond}</h2>
            <Link className="button button-ink" href="/login">{copy.closingAction}</Link>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}

