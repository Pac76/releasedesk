// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getVerifiedAuth: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/verified-user", () => ({
  getVerifiedAuth: mocks.getVerifiedAuth,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/app/projects/actions";
import { INITIAL_PROJECT_ACTION_STATE } from "@/lib/projects/action-state";

const ownerId = "11111111-1111-4111-8111-111111111111";
const projectId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function projectForm(overrides: Record<string, string> = {}): FormData {
  const data = new FormData();
  data.set("name", overrides.name ?? "  November release  ");
  data.set("description", overrides.description ?? "  Stable scope  ");
  data.set("target_date", overrides.target_date ?? "2026-11-30");
  if (overrides.project_id) {
    data.set("project_id", overrides.project_id);
  }
  return data;
}

function verifiedAuth(from: ReturnType<typeof vi.fn>) {
  mocks.getVerifiedAuth.mockResolvedValue({
    email: "owner@example.test",
    supabase: { from },
    userId: ownerId,
  });
}

function mutationBuilder(result: { data: unknown[] | null; error: unknown }) {
  const select = vi.fn().mockResolvedValue(result);
  const ownerEq = vi.fn().mockReturnValue({ select });
  const idEq = vi.fn().mockReturnValue({ eq: ownerEq });
  return { idEq, ownerEq, select };
}

describe("project server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["create", createProjectAction, projectForm()],
    ["update", updateProjectAction, projectForm({ project_id: projectId })],
    ["delete", deleteProjectAction, projectForm({ project_id: projectId })],
  ])("denies unauthenticated %s requests", async (_name, action, data) => {
    mocks.getVerifiedAuth.mockResolvedValue(null);

    const state = await action(INITIAL_PROJECT_ACTION_STATE, data);

    expect(state).toEqual({
      message: "Tu sesión ya no es válida. Volvé a ingresar.",
      status: "error",
    });
  });

  it("normalizes inserts and derives owner_id from verified claims", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });
    verifiedAuth(from);

    const state = await createProjectAction(
      INITIAL_PROJECT_ACTION_STATE,
      projectForm(),
    );

    expect(from).toHaveBeenCalledWith("projects");
    expect(insert).toHaveBeenCalledWith({
      description: "Stable scope",
      name: "November release",
      owner_id: ownerId,
      target_date: "2026-11-30",
    });
    expect(state.status).toBe("success");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/projects");
  });

  it("rejects invalid input without touching the table", async () => {
    const from = vi.fn();
    verifiedAuth(from);

    const state = await createProjectAction(
      INITIAL_PROJECT_ACTION_STATE,
      projectForm({ name: " " }),
    );

    expect(state.fieldErrors?.name).toMatch(/1 y 80/i);
    expect(from).not.toHaveBeenCalled();
  });

  it("owner-scopes updates by both project ID and verified user", async () => {
    const builder = mutationBuilder({ data: [{ id: projectId }], error: null });
    const update = vi.fn().mockReturnValue({ eq: builder.idEq });
    const from = vi.fn().mockReturnValue({ update });
    verifiedAuth(from);

    const state = await updateProjectAction(
      INITIAL_PROJECT_ACTION_STATE,
      projectForm({ project_id: projectId }),
    );

    expect(update).toHaveBeenCalledWith({
      description: "Stable scope",
      name: "November release",
      target_date: "2026-11-30",
    });
    expect(builder.idEq).toHaveBeenCalledWith("id", projectId);
    expect(builder.ownerEq).toHaveBeenCalledWith("owner_id", ownerId);
    expect(builder.select).toHaveBeenCalledWith("id");
    expect(state.status).toBe("success");
  });

  it("owner-scopes deletes and confirms exactly one affected row", async () => {
    const builder = mutationBuilder({ data: [{ id: projectId }], error: null });
    const deleteMutation = vi.fn().mockReturnValue({ eq: builder.idEq });
    const from = vi.fn().mockReturnValue({ delete: deleteMutation });
    verifiedAuth(from);

    const state = await deleteProjectAction(
      INITIAL_PROJECT_ACTION_STATE,
      projectForm({ project_id: projectId }),
    );

    expect(builder.idEq).toHaveBeenCalledWith("id", projectId);
    expect(builder.ownerEq).toHaveBeenCalledWith("owner_id", ownerId);
    expect(builder.select).toHaveBeenCalledWith("id");
    expect(state.status).toBe("success");
  });

  it("rejects malformed project IDs before creating a query", async () => {
    const from = vi.fn();
    verifiedAuth(from);

    const state = await deleteProjectAction(
      INITIAL_PROJECT_ACTION_STATE,
      projectForm({ project_id: "not-a-uuid" }),
    );

    expect(state.message).toMatch(/no encontramos el proyecto/i);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns the same generic result for a zero-row owner-scoped mutation", async () => {
    const builder = mutationBuilder({ data: [], error: null });
    const update = vi.fn().mockReturnValue({ eq: builder.idEq });
    const from = vi.fn().mockReturnValue({ update });
    verifiedAuth(from);

    const state = await updateProjectAction(
      INITIAL_PROJECT_ACTION_STATE,
      projectForm({ project_id: projectId }),
    );

    expect(state).toEqual({
      message: "No encontramos el proyecto o ya no está disponible.",
      status: "error",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("maps provider errors to safe Spanish feedback", async () => {
    const insert = vi.fn().mockResolvedValue({
      error: { message: "private database policy detail" },
    });
    const from = vi.fn().mockReturnValue({ insert });
    verifiedAuth(from);

    const state = await createProjectAction(
      INITIAL_PROJECT_ACTION_STATE,
      projectForm(),
    );

    expect(state.message).toBe(
      "No pudimos crear el proyecto. Intentá nuevamente.",
    );
    expect(state.message).not.toContain("private database policy detail");
  });
});
