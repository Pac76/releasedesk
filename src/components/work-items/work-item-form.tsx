"use client";

import { useActionState } from "react";

import { useLocale } from "@/components/locale-provider";
import { localize } from "@/lib/i18n/locale";
import type { Database } from "@/types/database";
import {
  INITIAL_WORK_ITEM_ACTION_STATE,
  type WorkItemActionState,
} from "@/lib/work-items/action-state";
import { getWorkItemPriorityLabels, getWorkItemStatusLabels } from "@/lib/work-items/labels";
import {
  WORK_ITEM_PRIORITIES,
  WORK_ITEM_STATUSES,
} from "@/lib/work-items/validation";

type WorkItem = Database["public"]["Tables"]["work_items"]["Row"];

export type WorkItemServerAction = (
  previousState: WorkItemActionState,
  formData: FormData,
) => Promise<WorkItemActionState>;

type WorkItemFormProps = {
  action: WorkItemServerAction;
  item?: Pick<
    WorkItem,
    | "description"
    | "due_date"
    | "id"
    | "priority"
    | "project_id"
    | "status"
    | "title"
  >;
  projectId: string;
  variant: "create" | "edit";
};

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <span className="field-error" id={id}>
      {message}
    </span>
  ) : null;
}

export function WorkItemForm({
  action,
  item,
  projectId,
  variant,
}: WorkItemFormProps) {
  const locale = useLocale();
  const statusLabels = getWorkItemStatusLabels(locale);
  const priorityLabels = getWorkItemPriorityLabels(locale);
  const copy = localize(locale, {
    en: {
      add: "Add work item",
      description: "Description",
      descriptionHelp: "Optional · up to 2,000 characters.",
      descriptionPlaceholder: "Criteria, context, or dependencies needed to complete this work.",
      dueDate: "Due date",
      priority: "Priority",
      save: "Save work item",
      saving: "Saving…",
      status: "Status",
      title: "Title",
      titlePlaceholder: "Validate the checkout flow",
    },
    es: {
      add: "Agregar trabajo",
      description: "Descripción",
      descriptionHelp: "Opcional · hasta 2000 caracteres.",
      descriptionPlaceholder: "Criterios, contexto o dependencias para completar este trabajo.",
      dueDate: "Fecha límite",
      priority: "Prioridad",
      save: "Guardar trabajo",
      saving: "Guardando…",
      status: "Estado",
      title: "Título",
      titlePlaceholder: "Validar el flujo de compra",
    },
  });
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_WORK_ITEM_ACTION_STATE,
  );
  const isEditing = variant === "edit";
  const prefix = isEditing ? `work-${item?.id}` : `new-work-${projectId}`;

  return (
    <form action={formAction} className="work-item-form">
      <input name="project_id" type="hidden" value={projectId} />
      {item ? (
        <input name="work_item_id" type="hidden" value={item.id} />
      ) : null}

      <div className="work-field work-field-title">
        <label htmlFor={`${prefix}-title`}>{copy.title}</label>
        <input
          aria-describedby={
            state.fieldErrors?.title ? `${prefix}-title-error` : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.title)}
          defaultValue={item?.title}
          id={`${prefix}-title`}
          maxLength={120}
          name="title"
          placeholder={copy.titlePlaceholder}
          required
        />
        <FieldError
          id={`${prefix}-title-error`}
          message={state.fieldErrors?.title}
        />
      </div>

      <div className="work-field">
        <label htmlFor={`${prefix}-status`}>{copy.status}</label>
        <select
          aria-describedby={
            state.fieldErrors?.status ? `${prefix}-status-error` : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.status)}
          defaultValue={item?.status ?? "backlog"}
          id={`${prefix}-status`}
          name="status"
        >
          {WORK_ITEM_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
        <FieldError
          id={`${prefix}-status-error`}
          message={state.fieldErrors?.status}
        />
      </div>

      <div className="work-field">
        <label htmlFor={`${prefix}-priority`}>{copy.priority}</label>
        <select
          aria-describedby={
            state.fieldErrors?.priority
              ? `${prefix}-priority-error`
              : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.priority)}
          defaultValue={item?.priority ?? "medium"}
          id={`${prefix}-priority`}
          name="priority"
        >
          {WORK_ITEM_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priorityLabels[priority]}
            </option>
          ))}
        </select>
        <FieldError
          id={`${prefix}-priority-error`}
          message={state.fieldErrors?.priority}
        />
      </div>

      <div className="work-field">
        <label htmlFor={`${prefix}-due-date`}>{copy.dueDate}</label>
        <input
          aria-describedby={
            state.fieldErrors?.dueDate
              ? `${prefix}-due-date-error`
              : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.dueDate)}
          defaultValue={item?.due_date ?? ""}
          id={`${prefix}-due-date`}
          name="due_date"
          type="date"
        />
        <FieldError
          id={`${prefix}-due-date-error`}
          message={state.fieldErrors?.dueDate}
        />
      </div>

      <div className="work-field work-field-description">
        <label htmlFor={`${prefix}-description`}>{copy.description}</label>
        <textarea
          aria-describedby={`${prefix}-description-help${
            state.fieldErrors?.description
              ? ` ${prefix}-description-error`
              : ""
          }`}
          aria-invalid={Boolean(state.fieldErrors?.description)}
          defaultValue={item?.description ?? ""}
          id={`${prefix}-description`}
          maxLength={2000}
          name="description"
          placeholder={copy.descriptionPlaceholder}
          rows={isEditing ? 3 : 4}
        />
        <span className="field-help" id={`${prefix}-description-help`}>
          {copy.descriptionHelp}
        </span>
        <FieldError
          id={`${prefix}-description-error`}
          message={state.fieldErrors?.description}
        />
      </div>

      {state.message ? (
        <p
          className={`project-feedback project-feedback-${state.status}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}

      <button
        className="button button-ink work-submit"
        disabled={pending}
        type="submit"
      >
        {pending ? copy.saving : isEditing ? copy.save : copy.add}
      </button>
    </form>
  );
}
