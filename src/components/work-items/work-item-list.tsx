import { DeleteWorkItemForm } from "@/components/work-items/delete-work-item-form";
import { QuickStatusForm } from "@/components/work-items/quick-status-form";
import {
  WorkItemForm,
  type WorkItemServerAction,
} from "@/components/work-items/work-item-form";
import {
  WORK_ITEM_PRIORITY_LABELS,
  WORK_ITEM_STATUS_LABELS,
} from "@/lib/work-items/labels";
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

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

function formatDueDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export function WorkItemList({
  changeStatusAction,
  deleteAction,
  filters,
  items,
  projectId,
  today,
  updateAction,
}: WorkItemListProps) {
  if (items.length === 0) {
    const filtered = Boolean(filters.status || filters.priority);
    return (
      <section className="work-empty" aria-labelledby="work-empty-title">
        <span aria-hidden="true">00</span>
        <div>
          <h2 id="work-empty-title">
            {filtered
              ? "No hay trabajo con estos filtros."
              : "Todavía no hay trabajo cargado."}
          </h2>
          <p>
            {filtered
              ? "Probá otra combinación o limpiá los filtros para ver todo."
              : "Agregá el primer paso concreto para preparar esta entrega."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="work-list-title" className="work-list-section">
      <div className="project-list-heading">
        <h2 id="work-list-title">Trabajo de la entrega</h2>
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
                    {WORK_ITEM_STATUS_LABELS[item.status]}
                  </span>
                  <span className={`priority-badge priority-${item.priority}`}>
                    Prioridad {WORK_ITEM_PRIORITY_LABELS[item.priority].toLowerCase()}
                  </span>
                  {overdue ? <strong>Vencido</strong> : null}
                </div>
                <h3>{item.title}</h3>
                <p>{item.description || "Sin descripción."}</p>
                <div className="work-item-date">
                  {item.due_date ? (
                    <span>
                      {overdue ? "Venció" : "Fecha límite"} ·{" "}
                      {formatDueDate(item.due_date)}
                    </span>
                  ) : (
                    <span>Sin fecha límite</span>
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
                  <span className="ready-note">Listo para entregar</span>
                )}

                <details className="work-item-editor">
                  <summary>Editar trabajo</summary>
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
