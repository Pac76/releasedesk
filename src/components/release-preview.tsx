const releaseItems = [
  { label: "Flujo de compra", owner: "Producto", status: "En revisión", tone: "review" },
  { label: "Regresión de pagos", owner: "QA", status: "Listo", tone: "ready" },
  { label: "Notas de versión", owner: "Producto", status: "En curso", tone: "progress" },
] as const;

export function ReleasePreview() {
  return (
    <div className="release-preview" aria-label="Vista previa del panel de una entrega">
      <div className="preview-topbar">
        <div>
          <span className="preview-kicker">Entrega activa</span>
          <h2>Checkout v2.4</h2>
        </div>
        <span className="release-health"><span aria-hidden="true" /> En buen rumbo</span>
      </div>

      <div className="readiness-block">
        <div className="readiness-copy">
          <span>Preparación general</span>
          <strong>82%</strong>
        </div>
        <div aria-label="82 por ciento completado" className="progress-track" role="progressbar" aria-valuemax={100} aria-valuemin={0} aria-valuenow={82}>
          <span />
        </div>
      </div>

      <div className="preview-list" role="list" aria-label="Ítems de la entrega">
        {releaseItems.map((item) => (
          <div className="preview-row" key={item.label} role="listitem">
            <span className="row-icon" aria-hidden="true" />
            <div className="row-main">
              <strong>{item.label}</strong>
              <span>{item.owner}</span>
            </div>
            <span className={`status status-${item.tone}`}>{item.status}</span>
          </div>
        ))}
      </div>

      <div className="preview-footer">
        <span>Próximo hito</span>
        <strong>Validación final · 28 nov</strong>
      </div>
    </div>
  );
}

