import Link from "next/link";

export default function NotFound() {
  return (
    <main className="state-page">
      <section className="state-card" aria-labelledby="not-found-title">
        <p className="eyebrow eyebrow-dark">Error 404</p>
        <h1 id="not-found-title">Esta ruta no forma parte de la entrega.</h1>
        <p>La página que buscás no existe o cambió de ubicación.</p>
        <Link className="button button-ink" href="/">Volver al inicio</Link>
      </section>
    </main>
  );
}

