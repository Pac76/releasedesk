"use client";

import { useActionState } from "react";

import { useLocale } from "@/components/locale-provider";
import { localize } from "@/lib/i18n/locale";
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
  const locale = useLocale();
  const copy = localize(locale, {
    en: {
      create: "Create project",
      description: "Description",
      descriptionHelp: "Optional · up to 500 characters.",
      descriptionPlaceholder: "What must be ready for this release to be considered successful.",
      name: "Name",
      namePlaceholder: "November release",
      save: "Save changes",
      saving: "Saving…",
      targetDate: "Target date",
    },
    es: {
      create: "Crear proyecto",
      description: "Descripción",
      descriptionHelp: "Opcional · hasta 500 caracteres.",
      descriptionPlaceholder: "Qué tiene que estar listo para considerar exitosa esta entrega.",
      name: "Nombre",
      namePlaceholder: "Lanzamiento de noviembre",
      save: "Guardar cambios",
      saving: "Guardando…",
      targetDate: "Fecha objetivo",
    },
  });
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
        <label htmlFor={`${prefix}-name`}>{copy.name}</label>
        <input
          aria-describedby={
            state.fieldErrors?.name ? `${prefix}-name-error` : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.name)}
          defaultValue={project?.name}
          id={`${prefix}-name`}
          maxLength={80}
          name="name"
          placeholder={copy.namePlaceholder}
          required
        />
        {state.fieldErrors?.name ? (
          <span className="field-error" id={`${prefix}-name-error`}>
            {state.fieldErrors.name}
          </span>
        ) : null}
      </div>

      <div className="project-field project-field-date">
        <label htmlFor={`${prefix}-target-date`}>{copy.targetDate}</label>
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
        <label htmlFor={`${prefix}-description`}>{copy.description}</label>
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
          placeholder={copy.descriptionPlaceholder}
          rows={isEditing ? 3 : 4}
        />
        <span className="field-help" id={`${prefix}-description-help`}>
          {copy.descriptionHelp}
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
        {pending ? copy.saving : isEditing ? copy.save : copy.create}
      </button>
    </form>
  );
}
