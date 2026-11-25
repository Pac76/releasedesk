import type { WorkItemFieldErrors } from "@/lib/work-items/validation";

export type WorkItemActionState = {
  fieldErrors?: WorkItemFieldErrors;
  message?: string;
  status: "idle" | "error" | "success";
};

export const INITIAL_WORK_ITEM_ACTION_STATE: WorkItemActionState = {
  status: "idle",
};
