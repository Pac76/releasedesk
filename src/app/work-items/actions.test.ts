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
  changeWorkItemStatusAction,
  createWorkItemAction,
  deleteWorkItemAction,
  updateWorkItemAction,
} from "@/app/work-items/actions";
import { INITIAL_WORK_ITEM_ACTION_STATE } from "@/lib/work-items/action-state";

const ownerId = "11111111-1111-4111-8111-111111111111";
const projectId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const itemId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function workForm(overrides: Record<string, string> = {}): FormData {
  const data = new FormData();
  data.set("project_id", overrides.project_id ?? projectId);
  if (overrides.include_item !== "false") {
    data.set("work_item_id", overrides.work_item_id ?? itemId);
  }
  data.set("title", overrides.title ?? "  Confirm release notes  ");
  data.set("description", overrides.description ?? "  Final review  ");
  data.set("status", overrides.status ?? "review");
  data.set("priority", overrides.priority ?? "high");
  data.set("due_date", overrides.due_date ?? "2026-11-30");
  return data;
}

function verifiedAuth(from: ReturnType<typeof vi.fn>) {
  mocks.getVerifiedAuth.mockResolvedValue({
    email: "owner@example.test",
    supabase: { from },
    userId: ownerId,
  });
}

function projectLookup(result: { data: unknown[] | null; error: unknown }) {
  const limit = vi.fn().mockResolvedValue(result);
  const ownerEq = vi.fn().mockReturnValue({ limit });
  const idEq = vi.fn().mockReturnValue({ eq: ownerEq });
  const select = vi.fn().mockReturnValue({ eq: idEq });
  return { idEq, limit, ownerEq, select };
}

function mutationBuilder(result: { data: unknown[] | null; error: unknown }) {
  const select = vi.fn().mockResolvedValue(result);
  const ownerEq = vi.fn().mockReturnValue({ select });
  const projectEq = vi.fn().mockReturnValue({ eq: ownerEq });
  const idEq = vi.fn().mockReturnValue({ eq: projectEq });
  return { idEq, ownerEq, projectEq, select };
}

describe("work-item server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["create", createWorkItemAction],
    ["update", updateWorkItemAction],
    ["delete", deleteWorkItemAction],
    ["status", changeWorkItemStatusAction],
  ])("denies unauthenticated %s requests", async (_name, action) => {
    mocks.getVerifiedAuth.mockResolvedValue(null);

    const state = await action(
      INITIAL_WORK_ITEM_ACTION_STATE,
      workForm(),
    );

    expect(state.message).toMatch(/sesión ya no es válida/i);
    expect(state.status).toBe("error");
  });

  it("verifies project ownership and derives owner fields on create", async () => {
    const lookup = projectLookup({ data: [{ id: projectId }], error: null });
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn((table: string) =>
      table === "projects" ? { select: lookup.select } : { insert },
    );
    verifiedAuth(from);

    const state = await createWorkItemAction(
      INITIAL_WORK_ITEM_ACTION_STATE,
      workForm({ include_item: "false" }),
    );

    expect(lookup.idEq).toHaveBeenCalledWith("id", projectId);
    expect(lookup.ownerEq).toHaveBeenCalledWith("owner_id", ownerId);
    expect(insert).toHaveBeenCalledWith({
      description: "Final review",
      due_date: "2026-11-30",
      owner_id: ownerId,
      priority: "high",
      project_id: projectId,
      status: "review",
      title: "Confirm release notes",
    });
    expect(state.status).toBe("success");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      `/projects/${projectId}`,
    );
  });

  it("does not insert when the owner-scoped project lookup returns no row", async () => {
    const lookup = projectLookup({ data: [], error: null });
    const insert = vi.fn();
    const from = vi.fn((table: string) =>
      table === "projects" ? { select: lookup.select } : { insert },
    );
    verifiedAuth(from);

    const state = await createWorkItemAction(
      INITIAL_WORK_ITEM_ACTION_STATE,
      workForm(),
    );

    expect(state.message).toMatch(/proyecto.*disponible/i);
    expect(insert).not.toHaveBeenCalled();
  });

  it.each([
    ["update", updateWorkItemAction, "update"],
    ["delete", deleteWorkItemAction, "delete"],
    ["status", changeWorkItemStatusAction, "update"],
  ])(
    "triple-scopes %s by item, project, and owner",
    async (_name, action, method) => {
      const builder = mutationBuilder({ data: [{ id: itemId }], error: null });
      const mutation = vi.fn().mockReturnValue({ eq: builder.idEq });
      const from = vi.fn().mockReturnValue({ [method]: mutation });
      verifiedAuth(from);

      const state = await action(
        INITIAL_WORK_ITEM_ACTION_STATE,
        workForm({ status: "ready" }),
      );

      expect(builder.idEq).toHaveBeenCalledWith("id", itemId);
      expect(builder.projectEq).toHaveBeenCalledWith("project_id", projectId);
      expect(builder.ownerEq).toHaveBeenCalledWith("owner_id", ownerId);
      expect(builder.select).toHaveBeenCalledWith("id");
      expect(state.status).toBe("success");
    },
  );

  it("rejects malformed IDs and invalid enum input before querying", async () => {
    const from = vi.fn();
    verifiedAuth(from);

    const malformed = await deleteWorkItemAction(
      INITIAL_WORK_ITEM_ACTION_STATE,
      workForm({ work_item_id: "not-a-uuid" }),
    );
    const invalidStatus = await changeWorkItemStatusAction(
      INITIAL_WORK_ITEM_ACTION_STATE,
      workForm({ status: "shipping" }),
    );

    expect(malformed.message).toMatch(/trabajo.*disponible/i);
    expect(invalidStatus.fieldErrors?.status).toMatch(/estado válido/i);
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects invalid full input before mutating", async () => {
    const from = vi.fn();
    verifiedAuth(from);

    const state = await updateWorkItemAction(
      INITIAL_WORK_ITEM_ACTION_STATE,
      workForm({ title: " " }),
    );

    expect(state.fieldErrors?.title).toMatch(/1 y 120/i);
    expect(from).not.toHaveBeenCalled();
  });

  it("maps zero-row mutations to a generic unavailable result", async () => {
    const builder = mutationBuilder({ data: [], error: null });
    const update = vi.fn().mockReturnValue({ eq: builder.idEq });
    verifiedAuth(vi.fn().mockReturnValue({ update }));

    const state = await updateWorkItemAction(
      INITIAL_WORK_ITEM_ACTION_STATE,
      workForm(),
    );

    expect(state.message).toMatch(/trabajo.*disponible/i);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("maps provider errors to safe feedback", async () => {
    const lookup = projectLookup({ data: null, error: { message: "private" } });
    verifiedAuth(vi.fn().mockReturnValue({ select: lookup.select }));

    const state = await createWorkItemAction(
      INITIAL_WORK_ITEM_ACTION_STATE,
      workForm(),
    );

    expect(state.message).toBe(
      "No pudimos comprobar el proyecto. Intentá nuevamente.",
    );
    expect(state.message).not.toContain("private");
  });

  it("maps mutation provider errors without exposing database detail", async () => {
    const builder = mutationBuilder({
      data: null,
      error: { message: "private RLS detail" },
    });
    const update = vi.fn().mockReturnValue({ eq: builder.idEq });
    verifiedAuth(vi.fn().mockReturnValue({ update }));

    const state = await changeWorkItemStatusAction(
      INITIAL_WORK_ITEM_ACTION_STATE,
      workForm({ status: "ready" }),
    );

    expect(state.message).toBe(
      "No pudimos cambiar el estado. Intentá nuevamente.",
    );
    expect(state.message).not.toContain("private RLS detail");
  });
});
