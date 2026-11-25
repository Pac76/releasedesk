"use client";

import Link from "next/link";

import { useLocale } from "@/components/locale-provider";
import type { ProjectServerAction } from "@/components/projects/project-form";
import { DeleteProjectForm } from "@/components/projects/delete-project-form";
import { ProjectForm } from "@/components/projects/project-form";
import { localize } from "@/lib/i18n/locale";
import type { Database } from "@/types/database";

export type ProjectSummary = Pick<
  Database["public"]["Tables"]["projects"]["Row"],
  "created_at" | "description" | "id" | "name" | "target_date"
>;

type ProjectListProps = {
  deleteAction: ProjectServerAction;
  projects: ProjectSummary[];
  updateAction: ProjectServerAction;
};

export function ProjectList({
  deleteAction,
  projects,
  updateAction,
}: ProjectListProps) {
  const locale = useLocale();
  const copy = localize(locale, {
    en: {
      active: "Active projects",
      edit: "Edit project",
      empty: "No projects yet.",
      emptyDescription: "Create the first one with the form. Only you will be able to read or change it.",
      noDescription: "No description.",
      noTargetDate: "No target date",
      open: "Open project work",
      preparation: "Release preparation",
      target: "Target",
    },
    es: {
      active: "Proyectos activos",
      edit: "Editar proyecto",
      empty: "Todavía no hay proyectos.",
      emptyDescription: "Creá el primero con el formulario. Solo vos vas a poder leerlo o modificarlo.",
      noDescription: "Sin descripción.",
      noTargetDate: "Sin fecha objetivo",
      open: "Abrir trabajo del proyecto",
      preparation: "Preparación de entrega",
      target: "Objetivo",
    },
  });
  const dateFormatter = new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
  const formatTargetDate = (value: string | null): string =>
    value
      ? `${copy.target} · ${dateFormatter.format(new Date(`${value}T00:00:00Z`))}`
      : copy.noTargetDate;

  if (projects.length === 0) {
    return (
      <section className="projects-empty" aria-labelledby="projects-empty-title">
        <span aria-hidden="true">00</span>
        <div>
          <h2 id="projects-empty-title">{copy.empty}</h2>
          <p>{copy.emptyDescription}</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="project-list-title" className="project-list-section">
      <div className="project-list-heading">
        <h2 id="project-list-title">{copy.active}</h2>
        <span>{projects.length.toString().padStart(2, "0")}</span>
      </div>
      <ul className="project-list">
        {projects.map((project) => (
          <li className="project-card" key={project.id}>
            <div className="project-card-main">
              <div className="project-card-meta">
                <span>{formatTargetDate(project.target_date)}</span>
                <span>{copy.preparation}</span>
              </div>
              <h3>
                <Link href={`/projects/${project.id}`}>{project.name}</Link>
              </h3>
              <p>{project.description || copy.noDescription}</p>
              <Link
                className="project-detail-link"
                href={`/projects/${project.id}`}
              >
                {copy.open}
              </Link>
            </div>

            <details className="project-editor">
              <summary>{copy.edit}</summary>
              <div className="project-editor-panel">
                <ProjectForm
                  action={updateAction}
                  project={project}
                  variant="edit"
                />
                <DeleteProjectForm
                  action={deleteAction}
                  projectId={project.id}
                  projectName={project.name}
                />
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
