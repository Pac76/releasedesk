"use server";

import { revalidatePath } from "next/cache";

import { getVerifiedAuth } from "@/lib/auth/verified-user";
import { localize, type Locale } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import { isValidUuid } from "@/lib/projects/validation";
import type { WorkItemActionState } from "@/lib/work-items/action-state";
import {
  isWorkItemStatus,
  type WorkItemFieldErrors,
  validateWorkItemInput,
} from "@/lib/work-items/validation";

function getActionCopy(locale: Locale) {
  return localize(locale, {
    en: {
      created: "Work item created.",
      createError: "We couldn't create the work item. Try again.",
      deleted: "Work item deleted.",
      deleteError: "We couldn't delete the work item. Try again.",
      itemUnavailable: "We couldn't find this work item, or it is no longer available.",
      projectUnavailable: "We couldn't find this project, or it is no longer available.",
      projectVerifyError: "We couldn't verify the project. Try again.",
      saveError: "We couldn't save your changes. Try again.",
      sessionError: "Your session is no longer valid. Sign in again.",
      statusError: "We couldn't change the status. Try again.",
      statusInvalid: "Choose a valid status.",
      statusUpdated: "Status updated.",
      updated: "Work item updated.",
      validationError: "Review the highlighted fields.",
    },
    es: {
      created: "Elemento de trabajo creado.",
      createError: "No pudimos crear el elemento de trabajo. Intentá nuevamente.",
      deleted: "Elemento de trabajo eliminado.",
      deleteError: "No pudimos eliminar el elemento de trabajo. Intentá nuevamente.",
      itemUnavailable: "No encontramos el elemento de trabajo o ya no está disponible.",
      projectUnavailable: "No encontramos el proyecto o ya no está disponible.",
      projectVerifyError: "No pudimos verificar el proyecto. Intentá nuevamente.",
      saveError: "No pudimos guardar los cambios. Intentá nuevamente.",
      sessionError: "Tu sesión ya no es válida. Volvé a ingresar.",
      statusError: "No pudimos cambiar el estado. Intentá nuevamente.",
      statusInvalid: "Seleccioná un estado válido.",
      statusUpdated: "Estado actualizado.",
      updated: "Elemento de trabajo actualizado.",
      validationError: "Revisá los campos marcados.",
    },
  });
}

function sessionError(locale: Locale): WorkItemActionState {
  return { message: getActionCopy(locale).sessionError, status: "error" };
}

function projectUnavailable(locale: Locale): WorkItemActionState {
  return { message: getActionCopy(locale).projectUnavailable, status: "error" };
}

function itemUnavailable(locale: Locale): WorkItemActionState {
  return { message: getActionCopy(locale).itemUnavailable, status: "error" };
}

function uuidFrom(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && isValidUuid(value) ? value : null;
}

function validationError(
  fieldErrors: WorkItemFieldErrors,
  locale: Locale,
): WorkItemActionState {
  return {
    fieldErrors,
    message: getActionCopy(locale).validationError,
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
  const locale = await getLocale();
  const copy = getActionCopy(locale);
  const auth = await getVerifiedAuth();
  if (!auth) {
    return sessionError(locale);
  }

  const projectId = uuidFrom(formData, "project_id");
  if (!projectId) {
    return projectUnavailable(locale);
  }

  const validation = validateWorkItemInput(formData, locale);
  if (!validation.success) {
    return validationError(validation.errors, locale);
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
        message: copy.projectVerifyError,
        status: "error",
      };
    }

    if (!projectRows || projectRows.length !== 1) {
      return projectUnavailable(locale);
    }

    const { error } = await auth.supabase.from("work_items").insert({
      ...validation.data,
      owner_id: auth.userId,
      project_id: projectId,
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

  refreshWorkItemViews(projectId);
  return { message: copy.created, status: "success" };
}

export async function updateWorkItemAction(
  previousState: WorkItemActionState,
  formData: FormData,
): Promise<WorkItemActionState> {
  void previousState;
  const locale = await getLocale();
  const copy = getActionCopy(locale);
  const auth = await getVerifiedAuth();
  if (!auth) {
    return sessionError(locale);
  }

  const projectId = uuidFrom(formData, "project_id");
  const workItemId = uuidFrom(formData, "work_item_id");
  if (!projectId || !workItemId) {
    return itemUnavailable(locale);
  }

  const validation = validateWorkItemInput(formData, locale);
  if (!validation.success) {
    return validationError(validation.errors, locale);
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
        message: copy.saveError,
        status: "error",
      };
    }

    if (!data || data.length !== 1) {
      return itemUnavailable(locale);
    }
  } catch {
    return {
      message: copy.saveError,
      status: "error",
    };
  }

  refreshWorkItemViews(projectId);
  return { message: copy.updated, status: "success" };
}

export async function deleteWorkItemAction(
  previousState: WorkItemActionState,
  formData: FormData,
): Promise<WorkItemActionState> {
  void previousState;
  const locale = await getLocale();
  const copy = getActionCopy(locale);
  const auth = await getVerifiedAuth();
  if (!auth) {
    return sessionError(locale);
  }

  const projectId = uuidFrom(formData, "project_id");
  const workItemId = uuidFrom(formData, "work_item_id");
  if (!projectId || !workItemId) {
    return itemUnavailable(locale);
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
        message: copy.deleteError,
        status: "error",
      };
    }

    if (!data || data.length !== 1) {
      return itemUnavailable(locale);
    }
  } catch {
    return {
      message: copy.deleteError,
      status: "error",
    };
  }

  refreshWorkItemViews(projectId);
  return { message: copy.deleted, status: "success" };
}

export async function changeWorkItemStatusAction(
  previousState: WorkItemActionState,
  formData: FormData,
): Promise<WorkItemActionState> {
  void previousState;
  const locale = await getLocale();
  const copy = getActionCopy(locale);
  const auth = await getVerifiedAuth();
  if (!auth) {
    return sessionError(locale);
  }

  const projectId = uuidFrom(formData, "project_id");
  const workItemId = uuidFrom(formData, "work_item_id");
  const statusValue = formData.get("status");
  if (!projectId || !workItemId) {
    return itemUnavailable(locale);
  }

  if (typeof statusValue !== "string" || !isWorkItemStatus(statusValue)) {
    return validationError({ status: copy.statusInvalid }, locale);
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
        message: copy.statusError,
        status: "error",
      };
    }

    if (!data || data.length !== 1) {
      return itemUnavailable(locale);
    }
  } catch {
    return {
      message: copy.statusError,
      status: "error",
    };
  }

  refreshWorkItemViews(projectId);
  return { message: copy.statusUpdated, status: "success" };
}
