import type { ProjectFieldErrors } from "@/lib/projects/validation";

export type ProjectActionState = {
  fieldErrors?: ProjectFieldErrors;
  message?: string;
  status: "idle" | "error" | "success";
};

export const INITIAL_PROJECT_ACTION_STATE: ProjectActionState = {
  status: "idle",
};
