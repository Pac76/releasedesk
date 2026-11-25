import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  syncRepositoryAction,
} from "@/app/projects/actions";
import { RepositoryHealth } from "@/components/projects/repository-health";
import {
  changeWorkItemStatusAction,
  createWorkItemAction,
  deleteWorkItemAction,
  updateWorkItemAction,
} from "@/app/work-items/actions";
import { WorkItemFilterForm } from "@/components/work-items/work-item-filters";
import { WorkItemForm } from "@/components/work-items/work-item-form";
import { WorkItemList } from "@/components/work-items/work-item-list";
import { getVerifiedAuth } from "@/lib/auth/verified-user";
import { localize } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import { isValidUuid } from "@/lib/projects/validation";
import {
  currentIsoDate,
  parseWorkItemFilters,
} from "@/lib/work-items/validation";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: localize(locale, { en: "Project details", es: "Detalle de proyecto" }) };
}

type ProjectDetailPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{
    priority?: string | string[];
    status?: string | string[];
  }>;
};

export default async function ProjectDetailPage({
  params,
  searchParams,
}: ProjectDetailPageProps) {
  const [locale, auth, resolvedParams, resolvedSearchParams] = await Promise.all([
    getLocale(),
    getVerifiedAuth(),
    params,
    searchParams,
  ]);
  const copy = localize(locale, {
    en: {
      breadcrumb: "Project path",
      createDescription: "Turn the goal into a verifiable task and move it forward until it is ready.",
      createHeading: "Add work to this release",
      filterHeading: "Filter without losing context",
      filterKicker: "Work view",
      kicker: "Release preparation",
      newStep: "New step",
      noDescription: "No project description.",
      noTarget: "No target date",
      projects: "Projects",
      target: "Target",
    },
    es: {
      breadcrumb: "Ruta del proyecto",
      createDescription: "Convertí el objetivo en una tarea verificable y avanzala hasta que quede lista.",
      createHeading: "Sumá trabajo a esta entrega",
      filterHeading: "Filtrá sin perder el contexto",
      filterKicker: "Vista de trabajo",
      kicker: "Preparación de entrega",
      newStep: "Nuevo paso",
      noDescription: "Sin descripción de proyecto.",
      noTarget: "Sin fecha objetivo",
      projects: "Proyectos",
      target: "Objetivo",
    },
  });
  const dateFormatter = new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
    day: "2-digit",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  });
  if (!auth) {
    redirect("/login");
  }

  const { projectId } = resolvedParams;
  if (!isValidUuid(projectId)) {
    notFound();
  }

  const filters = parseWorkItemFilters(resolvedSearchParams);
  const projectQuery = auth.supabase
    .from("projects")
    .select("id, name, description, target_date, repository_full_name")
    .eq("id", projectId)
    .eq("owner_id", auth.userId)
    .limit(1);

  let itemsQuery = auth.supabase
    .from("work_items")
    .select(
      "id, project_id, title, description, status, priority, due_date, created_at, updated_at",
    )
    .eq("project_id", projectId)
    .eq("owner_id", auth.userId);

  if (filters.status) {
    itemsQuery = itemsQuery.eq("status", filters.status);
  }
  if (filters.priority) {
    itemsQuery = itemsQuery.eq("priority", filters.priority);
  }

  const snapshotQuery = auth.supabase
    .from("repository_snapshots")
    .select("id, owner_id, project_id, repository_full_name, default_branch, head_sha, head_committed_at, workflow_status, open_pull_requests, open_issues, captured_at")
    .eq("project_id", projectId)
    .eq("owner_id", auth.userId)
    .order("captured_at", { ascending: false })
    .limit(1);

  const [projectResult, itemResult, snapshotResult] = await Promise.all([
    projectQuery,
    itemsQuery
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
    snapshotQuery,
  ]);

  if (projectResult.error || itemResult.error || snapshotResult.error) {
    throw new Error("Project work could not be loaded.");
  }

  const project = projectResult.data?.[0];
  if (!project) {
    notFound();
  }

  return (
    <main className="project-detail-content">
      <nav aria-label={copy.breadcrumb} className="project-breadcrumb">
        <Link href="/projects">{copy.projects}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{project.name}</span>
      </nav>

      <header className="project-detail-heading">
        <div>
          <p className="eyebrow eyebrow-dark">{copy.kicker}</p>
          <h1>{project.name}</h1>
          <p>{project.description || copy.noDescription}</p>
        </div>
        <div className="project-target-date">
          <span>{copy.target}</span>
          <strong>
            {project.target_date
              ? dateFormatter.format(new Date(`${project.target_date}T00:00:00Z`))
              : copy.noTarget}
          </strong>
        </div>
      </header>

      <RepositoryHealth
        action={syncRepositoryAction}
        currentRepository={project.repository_full_name}
        projectId={projectId}
        snapshot={snapshotResult.data?.[0] ?? null}
      />

      <section className="work-create" aria-labelledby="create-work-title">
        <div className="work-create-copy">
          <span aria-hidden="true">{copy.newStep}</span>
          <h2 id="create-work-title">{copy.createHeading}</h2>
          <p>{copy.createDescription}</p>
        </div>
        <WorkItemForm
          action={createWorkItemAction}
          projectId={projectId}
          variant="create"
        />
      </section>

      <section className="work-filter-panel" aria-labelledby="filters-title">
        <div>
          <p className="eyebrow eyebrow-dark">{copy.filterKicker}</p>
          <h2 id="filters-title">{copy.filterHeading}</h2>
        </div>
        <WorkItemFilterForm filters={filters} projectId={projectId} />
      </section>

      <WorkItemList
        changeStatusAction={changeWorkItemStatusAction}
        deleteAction={deleteWorkItemAction}
        filters={filters}
        items={itemResult.data ?? []}
        projectId={projectId}
        today={currentIsoDate()}
        updateAction={updateWorkItemAction}
      />
    </main>
  );
}
