import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getVerifiedAuth } from "@/lib/auth/verified-user";
import {
  WORK_ITEM_PRIORITY_LABELS,
  WORK_ITEM_STATUS_LABELS,
} from "@/lib/work-items/labels";
import {
  currentIsoDate,
  type WorkItemPriority,
  type WorkItemStatus,
} from "@/lib/work-items/validation";

export const metadata: Metadata = {
  title: "Panel",
};

type UpcomingItem = {
  due_date: string | null;
  id: string;
  priority: WorkItemPriority;
  project: { name: string } | null;
  project_id: string;
  status: WorkItemStatus;
  title: string;
  updated_at: string;
};

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

function formatDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export default async function DashboardPage() {
  const auth = await getVerifiedAuth();
  if (!auth) {
    redirect("/login?next=%2Fdashboard");
  }

  const today = currentIsoDate();
  const projectCountQuery = auth.supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", auth.userId);
  const itemCountQuery = auth.supabase
    .from("work_items")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", auth.userId);
  const inProgressCountQuery = auth.supabase
    .from("work_items")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", auth.userId)
    .eq("status", "in_progress");
  const reviewCountQuery = auth.supabase
    .from("work_items")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", auth.userId)
    .eq("status", "review");
  const readyCountQuery = auth.supabase
    .from("work_items")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", auth.userId)
    .eq("status", "ready");
  const overdueCountQuery = auth.supabase
    .from("work_items")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", auth.userId)
    .lt("due_date", today)
    .neq("status", "ready");
  const upcomingQuery = auth.supabase
    .from("work_items")
    .select(
      "id, project_id, title, status, priority, due_date, updated_at, project:projects!work_items_project_owner_fkey(name)",
    )
    .eq("owner_id", auth.userId)
    .neq("status", "ready")
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .limit(5);

  const [
    projectResult,
    itemResult,
    inProgressResult,
    reviewResult,
    readyResult,
    overdueResult,
    upcomingResult,
  ] = await Promise.all([
    projectCountQuery,
    itemCountQuery,
    inProgressCountQuery,
    reviewCountQuery,
    readyCountQuery,
    overdueCountQuery,
    upcomingQuery,
  ]);

  if (
    projectResult.error ||
    itemResult.error ||
    inProgressResult.error ||
    reviewResult.error ||
    readyResult.error ||
    overdueResult.error ||
    upcomingResult.error
  ) {
    throw new Error("Dashboard data could not be loaded.");
  }

  const metrics = [
    { label: "Proyectos", value: projectResult.count ?? 0 },
    { label: "Trabajo total", value: itemResult.count ?? 0 },
    { label: "En curso", value: inProgressResult.count ?? 0 },
    { label: "En revisión", value: reviewResult.count ?? 0 },
    { label: "Listos", value: readyResult.count ?? 0 },
    { label: "Vencidos", value: overdueResult.count ?? 0 },
  ];
  const upcoming = (upcomingResult.data ?? []) as UpcomingItem[];

  return (
    <main className="dashboard-content">
      <header className="dashboard-heading">
        <div>
          <p className="eyebrow eyebrow-dark">Centro de preparación</p>
          <h1>Una lectura real de tu próxima entrega.</h1>
        </div>
        <p>
          Las señales se calculan sobre tus proyectos y trabajo verificados.
          Sin estimaciones inventadas ni datos de otras cuentas.
        </p>
      </header>

      <section
        className="metric-grid metric-grid-complete"
        aria-label="Métricas de entrega"
      >
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>Datos actuales</small>
          </article>
        ))}
      </section>

      <section className="dashboard-work" aria-labelledby="dashboard-work-title">
        <div className="dashboard-work-heading">
          <div>
            <p className="eyebrow eyebrow-dark">Próxima atención</p>
            <h2 id="dashboard-work-title">Trabajo activo</h2>
          </div>
          <Link className="text-link text-link-dark" href="/projects">
            Ver proyectos
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="dashboard-work-empty">
            <p>No hay trabajo activo para mostrar.</p>
            <Link className="button button-ink" href="/projects">
              Preparar una entrega
            </Link>
          </div>
        ) : (
          <ul className="dashboard-work-list">
            {upcoming.map((item) => (
              <li key={item.id}>
                <div>
                  <span>{item.project?.name ?? "Proyecto"}</span>
                  <Link href={`/projects/${item.project_id}`}>{item.title}</Link>
                </div>
                <div className="dashboard-work-meta">
                  <span className={`status-badge status-${item.status}`}>
                    {WORK_ITEM_STATUS_LABELS[item.status]}
                  </span>
                  <span>{WORK_ITEM_PRIORITY_LABELS[item.priority]}</span>
                  <time dateTime={item.due_date ?? undefined}>
                    {item.due_date
                      ? formatDate(item.due_date)
                      : "Sin fecha límite"}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
