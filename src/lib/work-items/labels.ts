import type {
  WorkItemPriority,
  WorkItemStatus,
} from "@/lib/work-items/validation";
import { localize, type Locale } from "@/lib/i18n/locale";

export function getWorkItemStatusLabels(
  locale: Locale = "en",
): Record<WorkItemStatus, string> {
  return localize(locale, {
    en: { backlog: "Backlog", in_progress: "In progress", ready: "Ready", review: "In review" },
    es: { backlog: "Pendiente", in_progress: "En curso", ready: "Listo", review: "En revisión" },
  });
}

export function getWorkItemPriorityLabels(
  locale: Locale = "en",
): Record<WorkItemPriority, string> {
  return localize(locale, {
    en: { high: "High", low: "Low", medium: "Medium" },
    es: { high: "Alta", low: "Baja", medium: "Media" },
  });
}

export const WORK_ITEM_STATUS_LABELS = getWorkItemStatusLabels();
export const WORK_ITEM_PRIORITY_LABELS = getWorkItemPriorityLabels();
