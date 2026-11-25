"use client";

import Form from "next/form";
import Link from "next/link";

import { useLocale } from "@/components/locale-provider";
import { localize } from "@/lib/i18n/locale";
import { getWorkItemPriorityLabels, getWorkItemStatusLabels } from "@/lib/work-items/labels";
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
  const locale = useLocale();
  const statusLabels = getWorkItemStatusLabels(locale);
  const priorityLabels = getWorkItemPriorityLabels(locale);
  const copy = localize(locale, {
    en: { allPriorities: "All", allStatuses: "All", apply: "Apply filters", clear: "Clear filters", priority: "Priority", status: "Status" },
    es: { allPriorities: "Todas", allStatuses: "Todos", apply: "Aplicar filtros", clear: "Limpiar filtros", priority: "Prioridad", status: "Estado" },
  });
  const hasFilters = Boolean(filters.status || filters.priority);

  return (
    <Form
      action={`/projects/${projectId}`}
      className="work-filter-form"
      scroll={false}
    >
      <div className="work-filter-field">
        <label htmlFor="filter-status">{copy.status}</label>
        <select
          defaultValue={filters.status ?? ""}
          id="filter-status"
          name="status"
        >
          <option value="">{copy.allStatuses}</option>
          {WORK_ITEM_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </div>
      <div className="work-filter-field">
        <label htmlFor="filter-priority">{copy.priority}</label>
        <select
          defaultValue={filters.priority ?? ""}
          id="filter-priority"
          name="priority"
        >
          <option value="">{copy.allPriorities}</option>
          {WORK_ITEM_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priorityLabels[priority]}
            </option>
          ))}
        </select>
      </div>
      <button className="button button-ink" type="submit">
        {copy.apply}
      </button>
      {hasFilters ? (
        <Link className="text-link text-link-dark" href={`/projects/${projectId}`}>
          {copy.clear}
        </Link>
      ) : null}
    </Form>
  );
}
