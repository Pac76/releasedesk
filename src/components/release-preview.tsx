const repositorySignals = [
  { label: "GitHub Actions", owner: "Última ejecución", status: "Correcta", tone: "ready" },
  { label: "Pull requests", owner: "Abiertos", status: "0", tone: "ready" },
  { label: "Issues", owner: "Abiertos", status: "2", tone: "review" },
] as const;

export function ReleasePreview() {
  return (
    <div className="release-preview" aria-label="Vista previa del control operativo de un repositorio">
      <div className="preview-topbar">
        <div>
          <span className="preview-kicker">Repositorio conectado</span>
          <h2>acme/checkout</h2>
        </div>
        <span className="release-health"><span aria-hidden="true" /> En riesgo</span>
      </div>
      <div className="readiness-block">
        <div className="readiness-copy">
          <span>Commit observado</span>
          <strong>7f3a91c</strong>
        </div>
        <span>main · actualizado hoy</span>
      </div>
      <div className="preview-list" role="list" aria-label="Señales del repositorio">
        {repositorySignals.map((item) => (
          <div className="preview-row" key={item.label} role="listitem">
            <span className="row-icon" aria-hidden="true" />
            <div className="row-main"><strong>{item.label}</strong><span>{item.owner}</span></div>
            <span className={`status status-${item.tone}`}>{item.status}</span>
          </div>
        ))}
      </div>
      <div className="preview-footer">
        <span>Decisión trazable</span>
        <strong>2 issues requieren revisión</strong>
      </div>
    </div>
  );
}
