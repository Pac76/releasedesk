import { isValidIsoDate } from "@/lib/projects/validation";
import { localize, type Locale } from "@/lib/i18n/locale";

export const WORK_ITEM_STATUSES = [
  "backlog",
  "in_progress",
  "review",
  "ready",
] as const;

export const WORK_ITEM_PRIORITIES = ["low", "medium", "high"] as const;

export const OPERATIONAL_TIME_ZONE = "America/Argentina/Buenos_Aires";

const operationalDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  timeZone: OPERATIONAL_TIME_ZONE,
  year: "numeric",
});

export type WorkItemStatus = (typeof WORK_ITEM_STATUSES)[number];
export type WorkItemPriority = (typeof WORK_ITEM_PRIORITIES)[number];

export type WorkItemFieldErrors = {
  description?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  title?: string;
};

export type WorkItemInput = {
  description: string | null;
  due_date: string | null;
  priority: WorkItemPriority;
  status: WorkItemStatus;
  title: string;
};

export type WorkItemValidationResult =
  | { data: WorkItemInput; success: true }
  | { errors: WorkItemFieldErrors; success: false };

export type WorkItemFilters = {
  priority?: WorkItemPriority;
  status?: WorkItemStatus;
};

type SearchValue = string | string[] | undefined;

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function characterLength(value: string): number {
  return Array.from(value).length;
}

export function isWorkItemStatus(value: string): value is WorkItemStatus {
  return WORK_ITEM_STATUSES.some((status) => status === value);
}

export function isWorkItemPriority(value: string): value is WorkItemPriority {
  return WORK_ITEM_PRIORITIES.some((priority) => priority === value);
}

export function parseWorkItemFilters(values: {
  priority?: SearchValue;
  status?: SearchValue;
}): WorkItemFilters {
  const status =
    typeof values.status === "string" && isWorkItemStatus(values.status)
      ? values.status
      : undefined;
  const priority =
    typeof values.priority === "string" &&
    isWorkItemPriority(values.priority)
      ? values.priority
      : undefined;

  return { priority, status };
}

export function currentIsoDate(date = new Date()): string {
  const dateParts = operationalDateFormatter.formatToParts(date);
  const year = dateParts.find((part) => part.type === "year")?.value;
  const month = dateParts.find((part) => part.type === "month")?.value;
  const day = dateParts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Operational date could not be derived.");
  }

  return `${year}-${month}-${day}`;
}

export function isWorkItemOverdue(
  dueDate: string | null,
  status: WorkItemStatus,
  today = currentIsoDate(),
): boolean {
  return Boolean(dueDate && dueDate < today && status !== "ready");
}

export function nextWorkItemStatus(
  status: WorkItemStatus,
): WorkItemStatus | null {
  const index = WORK_ITEM_STATUSES.indexOf(status);
  return WORK_ITEM_STATUSES[index + 1] ?? null;
}

export function validateWorkItemInput(
  formData: FormData,
  locale: Locale = "en",
): WorkItemValidationResult {
  const title = readText(formData, "title").trim();
  const rawDescription = readText(formData, "description").trim();
  const rawStatus = readText(formData, "status").trim();
  const rawPriority = readText(formData, "priority").trim();
  const rawDueDate = readText(formData, "due_date").trim();
  const errors: WorkItemFieldErrors = {};

  if (characterLength(title) < 1 || characterLength(title) > 120) {
    errors.title = localize(locale, {
      en: "Title must be between 1 and 120 characters.",
      es: "El título debe tener entre 1 y 120 caracteres.",
    });
  }

  if (characterLength(rawDescription) > 2000) {
    errors.description = localize(locale, {
      en: "Description can be up to 2,000 characters.",
      es: "La descripción puede tener hasta 2000 caracteres.",
    });
  }

  if (!isWorkItemStatus(rawStatus)) {
    errors.status = localize(locale, {
      en: "Choose a valid status.",
      es: "Elegí un estado válido.",
    });
  }

  if (!isWorkItemPriority(rawPriority)) {
    errors.priority = localize(locale, {
      en: "Choose a valid priority.",
      es: "Elegí una prioridad válida.",
    });
  }

  if (rawDueDate && !isValidIsoDate(rawDueDate)) {
    errors.dueDate = localize(locale, {
      en: "Enter a valid date in YYYY-MM-DD format.",
      es: "Ingresá una fecha válida con formato AAAA-MM-DD.",
    });
  }

  if (Object.keys(errors).length > 0) {
    return { errors, success: false };
  }

  return {
    data: {
      description: rawDescription || null,
      due_date: rawDueDate || null,
      priority: rawPriority as WorkItemPriority,
      status: rawStatus as WorkItemStatus,
      title,
    },
    success: true,
  };
}
