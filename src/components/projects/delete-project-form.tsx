"use client";

import { useActionState } from "react";

import type { ProjectServerAction } from "@/components/projects/project-form";
import { INITIAL_PROJECT_ACTION_STATE } from "@/lib/projects/action-state";

type DeleteProjectFormProps = {
  action: ProjectServerAction;
  projectId: string;
  projectName: string;
};

export function DeleteProjectForm({
  action,
  projectId,
  projectName,
}: DeleteProjectFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_PROJECT_ACTION_STATE,
  );

  return (
    <form
      action={formAction}
      className="delete-project-form"
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `¿Eliminar “${projectName}” y todo su trabajo? Esta acción no se puede deshacer.`,
        );
        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input name="project_id" type="hidden" value={projectId} />
      {state.message ? (
        <p
          className={`project-feedback project-feedback-${state.status}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
      <button className="project-delete" disabled={pending} type="submit">
        {pending ? "Eliminando…" : "Eliminar proyecto"}
      </button>
    </form>
  );
}
