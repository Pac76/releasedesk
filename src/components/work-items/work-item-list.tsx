"use client";

import { useLocale } from "@/components/locale-provider";
import { DeleteWorkItemForm } from "@/components/work-items/delete-work-item-form";
import { QuickStatusForm } from "@/components/work-items/quick-status-form";
import {
  WorkItemForm,
  type WorkItemServerAction,
} from "@/components/work-items/work-item-form";
import { localize } from "@/lib/i18n/locale";
import { getWorkItemPriorityLabels, getWorkItemStatusLabels } from "@/lib/work-items/labels";
import {
  isWorkItemOverdue,
  nextWorkItemStatus,
  type WorkItemFilters,
} from "@/lib/work-items/validation";
import type { Database } from "@/types/database";

export type WorkItemSummary = Pick<
  Database["public"]["Tables"]["work_items"]["Row"],
  | "created_at"
  | "description"
  | "due_date"
  | "id"
  | "priority"
  | "project_id"
  | "status"
  | "title"
  | "updated_at"
>;

type WorkItemListProps = {
  changeStatusAction: WorkItemServerAction;
  deleteAction: WorkItemServerAction;
  filters: WorkItemFilters;
  items: WorkItemSummary[];
  projectId: string;
  today?: string;
  updateAction: WorkItemServerAction;
};

export function WorkItemList({
  changeStatusAction,
  deleteAction,
  filters,
  items,
  projectId,
  today,
  updateAction,
}: WorkItemListProps) {
  const locale = useLocale();
  const statusLabels = getWorkItemStatusLabels(locale);
  const priorityLabels = getWorkItemPriorityLabels(locale);
  const copy = localize(locale, {
    en: {
      due: "Due date",
      edit: "Edit work item",
      empty: "No work items yet.",
      emptyDescription: "Add the first concrete step toward preparing this release.",
      filteredEmpty: "No work items match these filters.",
      filteredEmptyDescription: "Try another combination or clear the filters to see everything.",
      listHeading: "Release work",
      noDescription: "No description.",
      noDueDate: "No due date",
      overdue: "Overdue",
      priority: "Priority",
      ready: "Ready to release",
      wasDue: "Was due",
    },
    es: {
      due: "Fecha límite",
      edit: "Editar trabajo",
      empty: "Todavía no hay trabajo cargado.",
      emptyDescription: "Agregá el primer paso concreto para preparar esta entrega.",
      filteredEmpty: "No hay trabajo con estos filtros.",
      filteredEmptyDescription: "Probá otra combinación o limpiá los filtros para ver todo.",
      listHeading: "Trabajo de la entrega",
      noDescription: "Sin descripción.",
      noDueDate: "Sin fecha límite",
      overdue: "Vencido",
      priority: "Prioridad",
      ready: "Listo para entregar",
      wasDue: "Venció",
    },
  });
  const dateFormatter = new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
  const formatDueDate = (value: string): string =>
    dateFormatter.format(new Date(`${value}T00:00:00Z`));

  if (items.length === 0) {
    const filtered = Boolean(filters.status || filters.priority);
    return (
      <section className="work-empty" aria-labelledby="work-empty-title">
        <span aria-hidden="true">00</span>
        <div>
          <h2 id="work-empty-title">
            {filtered ? copy.filteredEmpty : copy.empty}
          </h2>
          <p>
            {filtered ? copy.filteredEmptyDescription : copy.emptyDescription}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="work-list-title" className="work-list-section">
      <div className="project-list-heading">
        <h2 id="work-list-title">{copy.listHeading}</h2>
        <span>{items.length.toString().padStart(2, "0")}</span>
      </div>
      <ul className="work-item-list">
        {items.map((item) => {
          const overdue = isWorkItemOverdue(item.due_date, item.status, today);
          const nextStatus = nextWorkItemStatus(item.status);

          return (
            <li
              className={`work-item-card${overdue ? " work-item-overdue" : ""}`}
              key={item.id}
            >
              <div className="work-item-main">
                <div className="work-item-badges">
                  <span className={`status-badge status-${item.status}`}>
                    {statusLabels[item.status]}
                  </span>
                  <span className={`priority-badge priority-${item.priority}`}>
                    {copy.priority} {priorityLabels[item.priority].toLowerCase()}
                  </span>
                  {overdue ? <strong>{copy.overdue}</strong> : null}
                </div>
                <h3>{item.title}</h3>
                <p>{item.description || copy.noDescription}</p>
                <div className="work-item-date">
                  {item.due_date ? (
                    <span>
                      {overdue ? copy.wasDue : copy.due} ·{" "}
                      {formatDueDate(item.due_date)}
                    </span>
                  ) : (
                    <span>{copy.noDueDate}</span>
                  )}
                </div>
              </div>

              <div className="work-item-actions">
                {nextStatus ? (
                  <QuickStatusForm
                    action={changeStatusAction}
                    itemId={item.id}
                    nextStatus={nextStatus}
                    projectId={projectId}
                  />
                ) : (
                  <span className="ready-note">{copy.ready}</span>
                )}

                <details className="work-item-editor">
                  <summary>{copy.edit}</summary>
                  <div className="work-item-editor-panel">
                    <WorkItemForm
                      action={updateAction}
                      item={item}
                      projectId={projectId}
                      variant="edit"
                    />
                    <DeleteWorkItemForm
                      action={deleteAction}
                      itemId={item.id}
                      itemTitle={item.title}
                      projectId={projectId}
                    />
                  </div>
                </details>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
