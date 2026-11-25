"use client";

import { useActionState } from "react";

import {
  INITIAL_PROJECT_ACTION_STATE,
  type ProjectActionState,
} from "@/lib/projects/action-state";

export type ProjectServerAction = (
  previousState: ProjectActionState,
  formData: FormData,
) => Promise<ProjectActionState>;

type ProjectFormProps = {
  action: ProjectServerAction;
  project?: {
    description: string | null;
    id: string;
    name: string;
    target_date: string | null;
  };
  variant: "create" | "edit";
};

function ProjectFeedback({ state }: { state: ProjectActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={`project-feedback project-feedback-${state.status}`}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}

export function ProjectForm({ action, project, variant }: ProjectFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_PROJECT_ACTION_STATE,
  );
  const isEditing = variant === "edit";
  const prefix = isEditing ? `edit-${project?.id}` : "create-project";

  return (
    <form action={formAction} className="project-form">
      {project ? (
        <input name="project_id" type="hidden" value={project.id} />
      ) : null}

      <div className="project-field project-field-name">
        <label htmlFor={`${prefix}-name`}>Nombre</label>
        <input
          aria-describedby={
            state.fieldErrors?.name ? `${prefix}-name-error` : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.name)}
          defaultValue={project?.name}
          id={`${prefix}-name`}
          maxLength={80}
          name="name"
          placeholder="Lanzamiento de noviembre"
          required
        />
        {state.fieldErrors?.name ? (
          <span className="field-error" id={`${prefix}-name-error`}>
            {state.fieldErrors.name}
          </span>
        ) : null}
      </div>

      <div className="project-field project-field-date">
        <label htmlFor={`${prefix}-target-date`}>Fecha objetivo</label>
        <input
          aria-describedby={
            state.fieldErrors?.targetDate
              ? `${prefix}-target-date-error`
              : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.targetDate)}
          defaultValue={project?.target_date ?? ""}
          id={`${prefix}-target-date`}
          name="target_date"
          type="date"
        />
        {state.fieldErrors?.targetDate ? (
          <span className="field-error" id={`${prefix}-target-date-error`}>
            {state.fieldErrors.targetDate}
          </span>
        ) : null}
      </div>

      <div className="project-field project-field-description">
        <label htmlFor={`${prefix}-description`}>Descripción</label>
        <textarea
          aria-describedby={`${prefix}-description-help${
            state.fieldErrors?.description
              ? ` ${prefix}-description-error`
              : ""
          }`}
          aria-invalid={Boolean(state.fieldErrors?.description)}
          defaultValue={project?.description ?? ""}
          id={`${prefix}-description`}
          maxLength={500}
          name="description"
          placeholder="Qué tiene que estar listo para considerar exitosa esta entrega."
          rows={isEditing ? 3 : 4}
        />
        <span className="field-help" id={`${prefix}-description-help`}>
          Opcional · hasta 500 caracteres.
        </span>
        {state.fieldErrors?.description ? (
          <span className="field-error" id={`${prefix}-description-error`}>
            {state.fieldErrors.description}
          </span>
        ) : null}
      </div>

      <ProjectFeedback state={state} />
      <button
        className="button button-ink project-submit"
        disabled={pending}
        type="submit"
      >
        {pending
          ? "Guardando…"
          : isEditing
            ? "Guardar cambios"
            : "Crear proyecto"}
      </button>
    </form>
  );
}
