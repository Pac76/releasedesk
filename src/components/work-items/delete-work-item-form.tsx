"use client";

import { useActionState } from "react";

import type { WorkItemServerAction } from "@/components/work-items/work-item-form";
import { INITIAL_WORK_ITEM_ACTION_STATE } from "@/lib/work-items/action-state";

type DeleteWorkItemFormProps = {
  action: WorkItemServerAction;
  itemId: string;
  itemTitle: string;
  projectId: string;
};

export function DeleteWorkItemForm({
  action,
  itemId,
  itemTitle,
  projectId,
}: DeleteWorkItemFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_WORK_ITEM_ACTION_STATE,
  );

  return (
    <form
      action={formAction}
      className="delete-work-item-form"
      onSubmit={(event) => {
        if (
          !window.confirm(
            `¿Eliminar “${itemTitle}”? Esta acción no se puede deshacer.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input name="project_id" type="hidden" value={projectId} />
      <input name="work_item_id" type="hidden" value={itemId} />
      {state.message ? (
        <p
          className={`project-feedback project-feedback-${state.status}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
      <button className="work-delete" disabled={pending} type="submit">
        {pending ? "Eliminando…" : "Eliminar trabajo"}
      </button>
    </form>
  );
}
