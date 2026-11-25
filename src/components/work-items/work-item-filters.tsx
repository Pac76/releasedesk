import Form from "next/form";
import Link from "next/link";

import {
  WORK_ITEM_PRIORITY_LABELS,
  WORK_ITEM_STATUS_LABELS,
} from "@/lib/work-items/labels";
import type { WorkItemFilters } from "@/lib/work-items/validation";
import {
  WORK_ITEM_PRIORITIES,
  WORK_ITEM_STATUSES,
} from "@/lib/work-items/validation";

type WorkItemFiltersProps = {
  filters: WorkItemFilters;
  projectId: string;
};

export function WorkItemFilterForm({
  filters,
  projectId,
}: WorkItemFiltersProps) {
  const hasFilters = Boolean(filters.status || filters.priority);

  return (
    <Form
      action={`/projects/${projectId}`}
      className="work-filter-form"
      scroll={false}
    >
      <div className="work-filter-field">
        <label htmlFor="filter-status">Estado</label>
        <select
          defaultValue={filters.status ?? ""}
          id="filter-status"
          name="status"
        >
          <option value="">Todos</option>
          {WORK_ITEM_STATUSES.map((status) => (
            <option key={status} value={status}>
              {WORK_ITEM_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
      <div className="work-filter-field">
        <label htmlFor="filter-priority">Prioridad</label>
        <select
          defaultValue={filters.priority ?? ""}
          id="filter-priority"
          name="priority"
        >
          <option value="">Todas</option>
          {WORK_ITEM_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {WORK_ITEM_PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
      </div>
      <button className="button button-ink" type="submit">
        Aplicar filtros
      </button>
      {hasFilters ? (
        <Link className="text-link text-link-dark" href={`/projects/${projectId}`}>
          Limpiar filtros
        </Link>
      ) : null}
    </Form>
  );
}
