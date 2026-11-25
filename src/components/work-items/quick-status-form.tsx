"use client";

import { useActionState } from "react";

import type { WorkItemServerAction } from "@/components/work-items/work-item-form";
import { INITIAL_WORK_ITEM_ACTION_STATE } from "@/lib/work-items/action-state";
import { WORK_ITEM_STATUS_LABELS } from "@/lib/work-items/labels";
import type { WorkItemStatus } from "@/lib/work-items/validation";

type QuickStatusFormProps = {
  action: WorkItemServerAction;
  itemId: string;
  nextStatus: WorkItemStatus;
  projectId: string;
};

export function QuickStatusForm({
  action,
  itemId,
  nextStatus,
  projectId,
}: QuickStatusFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_WORK_ITEM_ACTION_STATE,
  );

  return (
    <form action={formAction} className="quick-status-form">
      <input name="project_id" type="hidden" value={projectId} />
      <input name="work_item_id" type="hidden" value={itemId} />
      <input name="status" type="hidden" value={nextStatus} />
      <button disabled={pending} type="submit">
        {pending
          ? "Actualizando…"
          : `Avanzar a ${WORK_ITEM_STATUS_LABELS[nextStatus]}`}
      </button>
      {state.message ? (
        <span
          className={`quick-status-feedback project-feedback-${state.status}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
