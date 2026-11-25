"use server";

import { revalidatePath } from "next/cache";

import { getVerifiedAuth } from "@/lib/auth/verified-user";
import {
  fetchPublicRepositorySnapshot,
  GitHubClientError,
} from "@/lib/github/client";
import type { RepositorySyncActionState } from "@/lib/github/action-state";
import { validateRepositoryFullName } from "@/lib/github/validation";
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

export async function syncRepositoryAction(
  previousState: RepositorySyncActionState,
  formData: FormData,
): Promise<RepositorySyncActionState> {
  void previousState;
  const auth = await getVerifiedAuth();
  if (!auth) {
    return { message: "Tu sesión ya no es válida. Volvé a ingresar.", status: "error" };
  }

  const projectId = projectIdFrom(formData);
  if (!projectId) {
    return { message: "No encontramos el proyecto o ya no está disponible.", status: "error" };
  }

  const repository = validateRepositoryFullName(formData.get("repository_full_name"));
  if (!repository.success) {
    return {
      fieldError: repository.error,
      message: "Revisá el repositorio indicado.",
      status: "error",
    };
  }

  try {
    const { data: projects, error: projectError } = await auth.supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("owner_id", auth.userId)
      .limit(1);

    if (projectError || !projects || projects.length !== 1) {
      return { message: "No encontramos el proyecto o ya no está disponible.", status: "error" };
    }

    const snapshot = await fetchPublicRepositorySnapshot(repository.value);
    const { error } = await auth.supabase.rpc("capture_repository_snapshot", {
      p_default_branch: snapshot.default_branch,
      p_head_committed_at: snapshot.head_committed_at,
      p_head_sha: snapshot.head_sha,
      p_open_issues: snapshot.open_issues,
      p_open_pull_requests: snapshot.open_pull_requests,
      p_project_id: projectId,
      p_repository_full_name: snapshot.repository_full_name,
      p_workflow_status: snapshot.workflow_status,
    });

    if (error) {
      return {
        message: "Leímos GitHub, pero no pudimos guardar la captura. Intentá nuevamente.",
        status: "error",
      };
    }
  } catch (error) {
    if (error instanceof GitHubClientError) {
      const messages = {
        not_found: "No encontramos ese repositorio público en GitHub.",
        rate_limited: "GitHub alcanzó el límite de consultas. Intentá nuevamente más tarde.",
        unavailable: "No pudimos consultar GitHub en este momento. Intentá nuevamente.",
      } as const;
      return { message: messages[error.code], status: "error" };
    }
    return {
      message: "No pudimos sincronizar el repositorio. Intentá nuevamente.",
      status: "error",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { message: "Repositorio sincronizado con una nueva captura.", status: "success" };
}
