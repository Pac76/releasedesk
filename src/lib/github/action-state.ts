export type RepositorySyncActionState = {
  fieldError?: string;
  message: string;
  status: "idle" | "error" | "success";
};

export const INITIAL_REPOSITORY_SYNC_STATE: RepositorySyncActionState = {
  message: "",
  status: "idle",
};
