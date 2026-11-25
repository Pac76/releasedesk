import { localize, type Locale } from "@/lib/i18n/locale";

export function ReleasePreview({ locale }: Readonly<{ locale: Locale }>) {
  const copy = localize(locale, {
    en: {
      ariaLabel: "Repository operations preview",
      connected: "Connected repository",
      decision: "Traceable decision",
      health: "At risk",
      observedCommit: "Observed commit",
      signals: [
        { label: "GitHub Actions", owner: "Latest run", status: "Passing", tone: "ready" },
        { label: "Pull requests", owner: "Open", status: "0", tone: "ready" },
        { label: "Issues", owner: "Open", status: "2", tone: "review" },
      ],
      signalsLabel: "Repository signals",
      summary: "2 issues need review",
      updated: "main · updated today",
    },
    es: {
      ariaLabel: "Vista previa del control operativo de un repositorio",
      connected: "Repositorio conectado",
      decision: "Decisión trazable",
      health: "En riesgo",
      observedCommit: "Commit observado",
      signals: [
        { label: "GitHub Actions", owner: "Última ejecución", status: "Correcta", tone: "ready" },
        { label: "Pull requests", owner: "Abiertos", status: "0", tone: "ready" },
        { label: "Issues", owner: "Abiertos", status: "2", tone: "review" },
      ],
      signalsLabel: "Señales del repositorio",
      summary: "2 issues requieren revisión",
      updated: "main · actualizado hoy",
    },
  } as const);
  return (
    <div className="release-preview" aria-label={copy.ariaLabel}>
      <div className="preview-topbar">
        <div>
          <span className="preview-kicker">{copy.connected}</span>
          <h2>acme/checkout</h2>
        </div>
        <span className="release-health"><span aria-hidden="true" /> {copy.health}</span>
      </div>
      <div className="readiness-block">
        <div className="readiness-copy">
          <span>{copy.observedCommit}</span>
          <strong>7f3a91c</strong>
        </div>
        <span>{copy.updated}</span>
      </div>
      <div className="preview-list" role="list" aria-label={copy.signalsLabel}>
        {copy.signals.map((item) => (
          <div className="preview-row" key={item.label} role="listitem">
            <span className="row-icon" aria-hidden="true" />
            <div className="row-main"><strong>{item.label}</strong><span>{item.owner}</span></div>
            <span className={`status status-${item.tone}`}>{item.status}</span>
          </div>
        ))}
      </div>
      <div className="preview-footer">
        <span>{copy.decision}</span>
        <strong>{copy.summary}</strong>
      </div>
    </div>
  );
}
