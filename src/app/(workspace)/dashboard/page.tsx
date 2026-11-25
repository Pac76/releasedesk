import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getVerifiedAuth } from "@/lib/auth/verified-user";
import { localize } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import {
  getWorkItemPriorityLabels,
  getWorkItemStatusLabels,
} from "@/lib/work-items/labels";
import {
  currentIsoDate,
  type WorkItemPriority,
  type WorkItemStatus,
} from "@/lib/work-items/validation";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: localize(locale, { en: "Dashboard", es: "Panel" }) };
}

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

export default async function DashboardPage() {
  const [locale, auth] = await Promise.all([getLocale(), getVerifiedAuth()]);
  const statusLabels = getWorkItemStatusLabels(locale);
  const priorityLabels = getWorkItemPriorityLabels(locale);
  const copy = localize(locale, {
    en: {
      active: "Active work",
      currentData: "Current data",
      description: "Signals are calculated from your verified projects and work. No invented estimates or data from other accounts.",
      empty: "There is no active work to show.",
      heading: "A real view of your next release.",
      inProgress: "In progress",
      kicker: "Readiness center",
      metricsLabel: "Release metrics",
      nextAttention: "Next up",
      noDueDate: "No due date",
      prepare: "Prepare a release",
      project: "Project",
      projects: "Projects",
      ready: "Ready",
      review: "In review",
      totalWork: "Total work",
      overdue: "Overdue",
      viewProjects: "View projects",
    },
    es: {
      active: "Trabajo activo",
      currentData: "Datos actuales",
      description: "Las señales se calculan sobre tus proyectos y trabajo verificados. Sin estimaciones inventadas ni datos de otras cuentas.",
      empty: "No hay trabajo activo para mostrar.",
      heading: "Una lectura real de tu próxima entrega.",
      inProgress: "En curso",
      kicker: "Centro de preparación",
      metricsLabel: "Métricas de entrega",
      nextAttention: "Próxima atención",
      noDueDate: "Sin fecha límite",
      prepare: "Preparar una entrega",
      project: "Proyecto",
      projects: "Proyectos",
      ready: "Listos",
      review: "En revisión",
      totalWork: "Trabajo total",
      overdue: "Vencidos",
      viewProjects: "Ver proyectos",
    },
  });
  const dateFormatter = new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
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
    { label: copy.projects, value: projectResult.count ?? 0 },
    { label: copy.totalWork, value: itemResult.count ?? 0 },
    { label: copy.inProgress, value: inProgressResult.count ?? 0 },
    { label: copy.review, value: reviewResult.count ?? 0 },
    { label: copy.ready, value: readyResult.count ?? 0 },
    { label: copy.overdue, value: overdueResult.count ?? 0 },
  ];
  const upcoming = (upcomingResult.data ?? []) as UpcomingItem[];

  return (
    <main className="dashboard-content">
      <header className="dashboard-heading">
        <div>
          <p className="eyebrow eyebrow-dark">{copy.kicker}</p>
          <h1>{copy.heading}</h1>
        </div>
        <p>{copy.description}</p>
      </header>

      <section
        className="metric-grid metric-grid-complete"
        aria-label={copy.metricsLabel}
      >
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{copy.currentData}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-work" aria-labelledby="dashboard-work-title">
        <div className="dashboard-work-heading">
          <div>
            <p className="eyebrow eyebrow-dark">{copy.nextAttention}</p>
            <h2 id="dashboard-work-title">{copy.active}</h2>
          </div>
          <Link className="text-link text-link-dark" href="/projects">
            {copy.viewProjects}
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="dashboard-work-empty">
            <p>{copy.empty}</p>
            <Link className="button button-ink" href="/projects">
              {copy.prepare}
            </Link>
          </div>
        ) : (
          <ul className="dashboard-work-list">
            {upcoming.map((item) => (
              <li key={item.id}>
                <div>
                  <span>{item.project?.name ?? copy.project}</span>
                  <Link href={`/projects/${item.project_id}`}>{item.title}</Link>
                </div>
                <div className="dashboard-work-meta">
                  <span className={`status-badge status-${item.status}`}>
                    {statusLabels[item.status]}
                  </span>
                  <span>{priorityLabels[item.priority]}</span>
                  <time dateTime={item.due_date ?? undefined}>
                    {item.due_date
                      ? dateFormatter.format(new Date(`${item.due_date}T00:00:00Z`))
                      : copy.noDueDate}
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
