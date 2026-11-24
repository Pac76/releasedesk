"use client";

import Link from "next/link";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <main className="state-page">
      <section className="state-card" aria-labelledby="error-title">
        <p className="eyebrow eyebrow-dark">Algo no salió como esperábamos</p>
        <h1 id="error-title">No pudimos cargar esta vista.</h1>
        <p>Podés volver a intentarlo. Si el problema continúa, regresá al inicio.</p>
        <div className="state-actions">
          <button className="button button-accent" onClick={retry} type="button">Reintentar</button>
          <Link className="text-link text-link-dark" href="/">Volver al inicio</Link>
        </div>
      </section>
    </main>
  );
}

