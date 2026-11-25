"use server";

import { revalidatePath } from "next/cache";

import { getVerifiedAuth } from "@/lib/auth/verified-user";
import {
  fetchPublicRepositorySnapshot,
  GitHubClientError,
} from "@/lib/github/client";
import type { RepositorySyncActionState } from "@/lib/github/action-state";
import { validateRepositoryFullName } from "@/lib/github/validation";
import { localize, type Locale } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import type { ProjectActionState } from "@/lib/projects/action-state";
import {
  isValidUuid,
  type ProjectFieldErrors,
  validateProjectInput,
} from "@/lib/projects/validation";

function getActionCopy(locale: Locale) {
  return localize(locale, {
    en: {
      createError: "We couldn't create the project. Try again.",
      created: "Project created.",
      deleteError: "We couldn't delete the project. Try again.",
      deleted: "Project deleted.",
      githubNotFound: "We couldn't find that public repository on GitHub.",
      githubRateLimited: "GitHub's request limit has been reached. Try again later.",
      githubUnavailable: "We couldn't reach GitHub right now. Try again.",
      projectNotFound: "We couldn't find this project, or it is no longer available.",
      repositoryReview: "Review the repository name.",
      saveError: "We couldn't save your changes. Try again.",
      sessionError: "Your session is no longer valid. Sign in again.",
      snapshotError: "We read GitHub successfully, but couldn't save the snapshot. Try again.",
      syncError: "We couldn't sync the repository. Try again.",
      synced: "Repository synced and a new snapshot was saved.",
      updated: "Project updated.",
      validationError: "Review the highlighted fields.",
    },
    es: {
      createError: "No pudimos crear el proyecto. Intentá nuevamente.",
      created: "Proyecto creado.",
      deleteError: "No pudimos eliminar el proyecto. Intentá nuevamente.",
      deleted: "Proyecto eliminado.",
      githubNotFound: "No encontramos ese repositorio público en GitHub.",
      githubRateLimited: "GitHub alcanzó el límite de consultas. Intentá nuevamente más tarde.",
      githubUnavailable: "No pudimos consultar GitHub en este momento. Intentá nuevamente.",
      projectNotFound: "No encontramos el proyecto o ya no está disponible.",
      repositoryReview: "Revisá el repositorio indicado.",
      saveError: "No pudimos guardar los cambios. Intentá nuevamente.",
      sessionError: "Tu sesión ya no es válida. Volvé a ingresar.",
      snapshotError: "Leímos GitHub, pero no pudimos guardar la captura. Intentá nuevamente.",
      syncError: "No pudimos sincronizar el repositorio. Intentá nuevamente.",
      synced: "Repositorio sincronizado con una nueva captura.",
      updated: "Proyecto actualizado.",
      validationError: "Revisá los campos marcados.",
    },
  });
}

function sessionError(locale: Locale): { message: string; status: "error" } {
  return { message: getActionCopy(locale).sessionError, status: "error" };
}

function projectNotFound(locale: Locale): { message: string; status: "error" } {
  return { message: getActionCopy(locale).projectNotFound, status: "error" };
}

function projectIdFrom(formData: FormData): string | null {
  const value = formData.get("project_id");
  return typeof value === "string" && isValidUuid(value) ? value : null;
}

function validationError(
  fieldErrors: ProjectFieldErrors,
  locale: Locale,
): ProjectActionState {
  return {
    fieldErrors,
    message: getActionCopy(locale).validationError,
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
  const locale = await getLocale();
  const copy = getActionCopy(locale);
  const auth = await getVerifiedAuth();
  if (!auth) {
    return sessionError(locale);
  }

  const validation = validateProjectInput(formData, locale);
  if (!validation.success) {
    return validationError(validation.errors, locale);
  }

  try {
    const { error } = await auth.supabase.from("projects").insert({
      ...validation.data,
      owner_id: auth.userId,
    });

    if (error) {
      return {
        message: copy.createError,
        status: "error",
      };
    }
  } catch {
    return {
      message: copy.createError,
      status: "error",
    };
  }

  refreshProjectViews();
  return { message: copy.created, status: "success" };
}

export async function updateProjectAction(
  previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  void previousState;
  const locale = await getLocale();
  const copy = getActionCopy(locale);
  const auth = await getVerifiedAuth();
  if (!auth) {
    return sessionError(locale);
  }

  const projectId = projectIdFrom(formData);
  if (!projectId) {
    return projectNotFound(locale);
  }

  const validation = validateProjectInput(formData, locale);
  if (!validation.success) {
    return validationError(validation.errors, locale);
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
        message: copy.saveError,
        status: "error",
      };
    }

    if (!data || data.length !== 1) {
      return projectNotFound(locale);
    }
  } catch {
    return {
      message: copy.saveError,
      status: "error",
    };
  }

  refreshProjectViews();
  return { message: copy.updated, status: "success" };
}

export async function deleteProjectAction(
  previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  void previousState;
  const locale = await getLocale();
  const copy = getActionCopy(locale);
  const auth = await getVerifiedAuth();
  if (!auth) {
    return sessionError(locale);
  }

  const projectId = projectIdFrom(formData);
  if (!projectId) {
    return projectNotFound(locale);
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
        message: copy.deleteError,
        status: "error",
      };
    }

    if (!data || data.length !== 1) {
      return projectNotFound(locale);
    }
  } catch {
    return {
      message: copy.deleteError,
      status: "error",
    };
  }

  refreshProjectViews();
  return { message: copy.deleted, status: "success" };
}

export async function syncRepositoryAction(
  previousState: RepositorySyncActionState,
  formData: FormData,
): Promise<RepositorySyncActionState> {
  void previousState;
  const locale = await getLocale();
  const copy = getActionCopy(locale);
  const auth = await getVerifiedAuth();
  if (!auth) {
    return sessionError(locale);
  }

  const projectId = projectIdFrom(formData);
  if (!projectId) {
    return projectNotFound(locale);
  }

  const repository = validateRepositoryFullName(
    formData.get("repository_full_name"),
    locale,
  );
  if (!repository.success) {
    return {
      fieldError: repository.error,
      message: copy.repositoryReview,
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
      return projectNotFound(locale);
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
        message: copy.snapshotError,
        status: "error",
      };
    }
  } catch (error) {
    if (error instanceof GitHubClientError) {
      const messages = {
        not_found: copy.githubNotFound,
        rate_limited: copy.githubRateLimited,
        unavailable: copy.githubUnavailable,
      } as const;
      return { message: messages[error.code], status: "error" };
    }
    return {
      message: copy.syncError,
      status: "error",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { message: copy.synced, status: "success" };
}
