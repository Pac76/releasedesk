"use server";

import { revalidatePath } from "next/cache";

import { getVerifiedAuth } from "@/lib/auth/verified-user";
import type { ProjectActionState } from "@/lib/projects/action-state";
import {
  isValidUuid,
  type ProjectFieldErrors,
  validateProjectInput,
} from "@/lib/projects/validation";

const SESSION_ERROR: ProjectActionState = {
  message: "Tu sesión ya no es válida. Volvé a ingresar.",
  status: "error",
};

const PROJECT_NOT_FOUND: ProjectActionState = {
  message: "No encontramos el proyecto o ya no está disponible.",
  status: "error",
};

function projectIdFrom(formData: FormData): string | null {
  const value = formData.get("project_id");
  return typeof value === "string" && isValidUuid(value) ? value : null;
}

function validationError(fieldErrors: ProjectFieldErrors): ProjectActionState {
  return {
    fieldErrors,
    message: "Revisá los campos marcados.",
    status: "error",
  };
}

function refreshProjectViews(): void {
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function createProjectAction(
  previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  void previousState;
  const auth = await getVerifiedAuth();
  if (!auth) {
    return SESSION_ERROR;
  }

  const validation = validateProjectInput(formData);
  if (!validation.success) {
    return validationError(validation.errors);
  }

  try {
    const { error } = await auth.supabase.from("projects").insert({
      ...validation.data,
      owner_id: auth.userId,
    });

    if (error) {
      return {
        message: "No pudimos crear el proyecto. Intentá nuevamente.",
        status: "error",
      };
    }
  } catch {
    return {
      message: "No pudimos crear el proyecto. Intentá nuevamente.",
      status: "error",
    };
  }

  refreshProjectViews();
  return { message: "Proyecto creado.", status: "success" };
}

export async function updateProjectAction(
  previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  void previousState;
  const auth = await getVerifiedAuth();
  if (!auth) {
    return SESSION_ERROR;
  }

  const projectId = projectIdFrom(formData);
  if (!projectId) {
    return PROJECT_NOT_FOUND;
  }

  const validation = validateProjectInput(formData);
  if (!validation.success) {
    return validationError(validation.errors);
  }

  try {
    const { data, error } = await auth.supabase
      .from("projects")
      .update(validation.data)
      .eq("id", projectId)
      .eq("owner_id", auth.userId)
      .select("id");

    if (error) {
      return {
        message: "No pudimos guardar los cambios. Intentá nuevamente.",
        status: "error",
      };
    }

    if (!data || data.length !== 1) {
      return PROJECT_NOT_FOUND;
    }
  } catch {
    return {
      message: "No pudimos guardar los cambios. Intentá nuevamente.",
      status: "error",
    };
  }

  refreshProjectViews();
  return { message: "Proyecto actualizado.", status: "success" };
}

export async function deleteProjectAction(
  previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  void previousState;
  const auth = await getVerifiedAuth();
  if (!auth) {
    return SESSION_ERROR;
  }

  const projectId = projectIdFrom(formData);
  if (!projectId) {
    return PROJECT_NOT_FOUND;
  }

  try {
    const { data, error } = await auth.supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("owner_id", auth.userId)
      .select("id");

    if (error) {
      return {
        message: "No pudimos eliminar el proyecto. Intentá nuevamente.",
        status: "error",
      };
    }

    if (!data || data.length !== 1) {
      return PROJECT_NOT_FOUND;
    }
  } catch {
    return {
      message: "No pudimos eliminar el proyecto. Intentá nuevamente.",
      status: "error",
    };
  }

  refreshProjectViews();
  return { message: "Proyecto eliminado.", status: "success" };
}
