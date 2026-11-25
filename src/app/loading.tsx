import { localize } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";

export default async function Loading() {
  const locale = await getLocale();
  return (
    <main className="state-page" aria-busy="true" aria-live="polite">
      <div className="state-card">
        <span className="loading-line loading-line-short" />
        <span className="loading-line loading-line-title" />
        <span className="loading-line" />
        <span className="loading-line loading-line-medium" />
        <span className="sr-only">{localize(locale, { en: "Loading ReleaseDesk…", es: "Cargando ReleaseDesk…" })}</span>
      </div>
    </main>
  );
}

