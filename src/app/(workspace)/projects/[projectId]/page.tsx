import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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
import { isValidUuid } from "@/lib/projects/validation";
import {
  currentIsoDate,
  parseWorkItemFilters,
} from "@/lib/work-items/validation";

export const metadata: Metadata = {
  title: "Detalle de proyecto",
};

type ProjectDetailPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{
    priority?: string | string[];
    status?: string | string[];
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

function formatTargetDate(value: string | null): string {
  return value
    ? dateFormatter.format(new Date(`${value}T00:00:00Z`))
    : "Sin fecha objetivo";
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: ProjectDetailPageProps) {
  const auth = await getVerifiedAuth();
  if (!auth) {
    redirect("/login");
  }

  const { projectId } = await params;
  if (!isValidUuid(projectId)) {
    notFound();
  }

  const filters = parseWorkItemFilters(await searchParams);
  const projectQuery = auth.supabase
    .from("projects")
    .select("id, name, description, target_date")
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

  const [projectResult, itemResult] = await Promise.all([
    projectQuery,
    itemsQuery
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
  ]);

  if (projectResult.error || itemResult.error) {
    throw new Error("Project work could not be loaded.");
  }

  const project = projectResult.data?.[0];
  if (!project) {
    notFound();
  }

  return (
    <main className="project-detail-content">
      <nav aria-label="Ruta del proyecto" className="project-breadcrumb">
        <Link href="/projects">Proyectos</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{project.name}</span>
      </nav>

      <header className="project-detail-heading">
        <div>
          <p className="eyebrow eyebrow-dark">Preparación de entrega</p>
          <h1>{project.name}</h1>
          <p>{project.description || "Sin descripción de proyecto."}</p>
        </div>
        <div className="project-target-date">
          <span>Objetivo</span>
          <strong>{formatTargetDate(project.target_date)}</strong>
        </div>
      </header>

      <section className="work-create" aria-labelledby="create-work-title">
        <div className="work-create-copy">
          <span aria-hidden="true">Nuevo paso</span>
          <h2 id="create-work-title">Sumá trabajo a esta entrega</h2>
          <p>
            Convertí el objetivo en una tarea verificable y avanzala hasta
            que quede lista.
          </p>
        </div>
        <WorkItemForm
          action={createWorkItemAction}
          projectId={projectId}
          variant="create"
        />
      </section>

      <section className="work-filter-panel" aria-labelledby="filters-title">
        <div>
          <p className="eyebrow eyebrow-dark">Vista de trabajo</p>
          <h2 id="filters-title">Filtrá sin perder el contexto</h2>
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
