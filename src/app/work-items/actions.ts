"use server";

import { revalidatePath } from "next/cache";

import { getVerifiedAuth } from "@/lib/auth/verified-user";
import { isValidUuid } from "@/lib/projects/validation";
import type { WorkItemActionState } from "@/lib/work-items/action-state";
import {
  isWorkItemStatus,
  type WorkItemFieldErrors,
  validateWorkItemInput,
} from "@/lib/work-items/validation";

const SESSION_ERROR: WorkItemActionState = {
  message: "Tu sesión ya no es válida. Volvé a ingresar.",
  status: "error",
};

const PROJECT_UNAVAILABLE: WorkItemActionState = {
  message: "No encontramos el proyecto o ya no está disponible.",
  status: "error",
};

const ITEM_UNAVAILABLE: WorkItemActionState = {
  message: "No encontramos el trabajo o ya no está disponible.",
  status: "error",
};

function uuidFrom(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && isValidUuid(value) ? value : null;
}

function validationError(
  fieldErrors: WorkItemFieldErrors,
): WorkItemActionState {
  return {
    fieldErrors,
    message: "Revisá los campos marcados.",
    status: "error",
  };
}

function refreshWorkItemViews(projectId: string): void {
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
}

export async function createWorkItemAction(
  previousState: WorkItemActionState,
  formData: FormData,
): Promise<WorkItemActionState> {
  void previousState;
  const auth = await getVerifiedAuth();
  if (!auth) {
    return SESSION_ERROR;
  }

  const projectId = uuidFrom(formData, "project_id");
  if (!projectId) {
    return PROJECT_UNAVAILABLE;
  }

  const validation = validateWorkItemInput(formData);
  if (!validation.success) {
    return validationError(validation.errors);
  }

  try {
    const { data: projectRows, error: projectError } = await auth.supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("owner_id", auth.userId)
      .limit(1);

    if (projectError) {
      return {
        message: "No pudimos comprobar el proyecto. Intentá nuevamente.",
        status: "error",
      };
    }

    if (!projectRows || projectRows.length !== 1) {
      return PROJECT_UNAVAILABLE;
    }

    const { error } = await auth.supabase.from("work_items").insert({
      ...validation.data,
      owner_id: auth.userId,
      project_id: projectId,
    });

    if (error) {
      return {
        message: "No pudimos crear el trabajo. Intentá nuevamente.",
        status: "error",
      };
    }
  } catch {
    return {
      message: "No pudimos crear el trabajo. Intentá nuevamente.",
      status: "error",
    };
  }

  refreshWorkItemViews(projectId);
  return { message: "Trabajo creado.", status: "success" };
}

export async function updateWorkItemAction(
  previousState: WorkItemActionState,
  formData: FormData,
): Promise<WorkItemActionState> {
  void previousState;
  const auth = await getVerifiedAuth();
  if (!auth) {
    return SESSION_ERROR;
  }

  const projectId = uuidFrom(formData, "project_id");
  const workItemId = uuidFrom(formData, "work_item_id");
  if (!projectId || !workItemId) {
    return ITEM_UNAVAILABLE;
  }

  const validation = validateWorkItemInput(formData);
  if (!validation.success) {
    return validationError(validation.errors);
  }

  try {
    const { data, error } = await auth.supabase
      .from("work_items")
      .update(validation.data)
      .eq("id", workItemId)
      .eq("project_id", projectId)
      .eq("owner_id", auth.userId)
      .select("id");

    if (error) {
      return {
        message: "No pudimos guardar los cambios. Intentá nuevamente.",
        status: "error",
      };
    }

    if (!data || data.length !== 1) {
      return ITEM_UNAVAILABLE;
    }
  } catch {
    return {
      message: "No pudimos guardar los cambios. Intentá nuevamente.",
      status: "error",
    };
  }

  refreshWorkItemViews(projectId);
  return { message: "Trabajo actualizado.", status: "success" };
}

export async function deleteWorkItemAction(
  previousState: WorkItemActionState,
  formData: FormData,
): Promise<WorkItemActionState> {
  void previousState;
  const auth = await getVerifiedAuth();
  if (!auth) {
    return SESSION_ERROR;
  }

  const projectId = uuidFrom(formData, "project_id");
  const workItemId = uuidFrom(formData, "work_item_id");
  if (!projectId || !workItemId) {
    return ITEM_UNAVAILABLE;
  }

  try {
    const { data, error } = await auth.supabase
      .from("work_items")
      .delete()
      .eq("id", workItemId)
      .eq("project_id", projectId)
      .eq("owner_id", auth.userId)
      .select("id");

    if (error) {
      return {
        message: "No pudimos eliminar el trabajo. Intentá nuevamente.",
        status: "error",
      };
    }

    if (!data || data.length !== 1) {
      return ITEM_UNAVAILABLE;
    }
  } catch {
    return {
      message: "No pudimos eliminar el trabajo. Intentá nuevamente.",
      status: "error",
    };
  }

  refreshWorkItemViews(projectId);
  return { message: "Trabajo eliminado.", status: "success" };
}

export async function changeWorkItemStatusAction(
  previousState: WorkItemActionState,
  formData: FormData,
): Promise<WorkItemActionState> {
  void previousState;
  const auth = await getVerifiedAuth();
  if (!auth) {
    return SESSION_ERROR;
  }

  const projectId = uuidFrom(formData, "project_id");
  const workItemId = uuidFrom(formData, "work_item_id");
  const statusValue = formData.get("status");
  if (!projectId || !workItemId) {
    return ITEM_UNAVAILABLE;
  }

  if (typeof statusValue !== "string" || !isWorkItemStatus(statusValue)) {
    return validationError({ status: "Elegí un estado válido." });
  }

  try {
    const { data, error } = await auth.supabase
      .from("work_items")
      .update({ status: statusValue })
      .eq("id", workItemId)
      .eq("project_id", projectId)
      .eq("owner_id", auth.userId)
      .select("id");

    if (error) {
      return {
        message: "No pudimos cambiar el estado. Intentá nuevamente.",
        status: "error",
      };
    }

    if (!data || data.length !== 1) {
      return ITEM_UNAVAILABLE;
    }
  } catch {
    return {
      message: "No pudimos cambiar el estado. Intentá nuevamente.",
      status: "error",
    };
  }

  refreshWorkItemViews(projectId);
  return { message: "Estado actualizado.", status: "success" };
}
