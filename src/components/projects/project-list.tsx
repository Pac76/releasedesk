import type { ProjectServerAction } from "@/components/projects/project-form";
import { DeleteProjectForm } from "@/components/projects/delete-project-form";
import { ProjectForm } from "@/components/projects/project-form";
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

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

function formatTargetDate(value: string | null): string {
  if (!value) {
    return "Sin fecha objetivo";
  }

  return `Objetivo · ${dateFormatter.format(new Date(`${value}T00:00:00Z`))}`;
}

export function ProjectList({
  deleteAction,
  projects,
  updateAction,
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <section className="projects-empty" aria-labelledby="projects-empty-title">
        <span aria-hidden="true">00</span>
        <div>
          <h2 id="projects-empty-title">Todavía no hay proyectos.</h2>
          <p>
            Creá el primero con el formulario. Solo vos vas a poder leerlo o
            modificarlo.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="project-list-title" className="project-list-section">
      <div className="project-list-heading">
        <h2 id="project-list-title">Proyectos activos</h2>
        <span>{projects.length.toString().padStart(2, "0")}</span>
      </div>
      <ul className="project-list">
        {projects.map((project) => (
          <li className="project-card" key={project.id}>
            <div className="project-card-main">
              <div className="project-card-meta">
                <span>{formatTargetDate(project.target_date)}</span>
                <span>Preparación de entrega</span>
              </div>
              <h3>{project.name}</h3>
              <p>{project.description || "Sin descripción."}</p>
            </div>

            <details className="project-editor">
              <summary>Editar proyecto</summary>
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
