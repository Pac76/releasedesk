import type {
  WorkItemPriority,
  WorkItemStatus,
} from "@/lib/work-items/validation";

export const WORK_ITEM_STATUS_LABELS: Record<WorkItemStatus, string> = {
  backlog: "Pendiente",
  in_progress: "En curso",
  ready: "Listo",
  review: "En revisión",
};

export const WORK_ITEM_PRIORITY_LABELS: Record<WorkItemPriority, string> = {
  high: "Alta",
  low: "Baja",
  medium: "Media",
};
