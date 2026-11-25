import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getVerifiedAuth: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/verified-user", () => ({
  getVerifiedAuth: mocks.getVerifiedAuth,
}));
vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  redirect: mocks.redirect,
}));

import ProjectDetailPage from "@/app/(workspace)/projects/[projectId]/page";

const ownerId = "11111111-1111-4111-8111-111111111111";
const projectId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function projectBuilder(result: { data: unknown[] | null; error: unknown }) {
  const limit = vi.fn().mockResolvedValue(result);
  const ownerEq = vi.fn().mockReturnValue({ limit });
  const idEq = vi.fn().mockReturnValue({ eq: ownerEq });
  const select = vi.fn().mockReturnValue({ eq: idEq });
  return { idEq, limit, ownerEq, select };
}

function itemsBuilder(result: { data: unknown[] | null; error: unknown }) {
  const secondOrder = vi.fn().mockResolvedValue(result);
  const firstOrder = vi.fn().mockReturnValue({ order: secondOrder });
  const builder: { eq: ReturnType<typeof vi.fn>; order: ReturnType<typeof vi.fn> } = {
    eq: vi.fn(),
    order: firstOrder,
  };
  builder.eq.mockReturnValue(builder);
  const select = vi.fn().mockReturnValue(builder);
  return { builder, firstOrder, secondOrder, select };
}

function snapshotBuilder(result: { data: unknown[] | null; error: unknown }) {
  const limit = vi.fn().mockResolvedValue(result);
  const order = vi.fn().mockReturnValue({ limit });
  const builder = { eq: vi.fn(), order };
  builder.eq.mockReturnValue(builder);
  const select = vi.fn().mockReturnValue(builder);
  return { builder, limit, order, select };
}

function setupQueries({
  items = [],
  project = [
    {
      description: "Release scope",
      id: projectId,
      name: "November release",
      repository_full_name: null,
      target_date: "2026-11-30",
    },
  ],
  snapshots = [],
}: {
  items?: unknown[];
  project?: unknown[];
  snapshots?: unknown[];
} = {}) {
  const projectQuery = projectBuilder({ data: project, error: null });
  const itemQuery = itemsBuilder({ data: items, error: null });
  const snapshotQuery = snapshotBuilder({ data: snapshots, error: null });
  const from = vi.fn((table: string) =>
    table === "projects"
      ? { select: projectQuery.select }
      : table === "work_items"
        ? { select: itemQuery.select }
        : { select: snapshotQuery.select },
  );
  mocks.getVerifiedAuth.mockResolvedValue({
    email: "owner@example.test",
    supabase: { from },
    userId: ownerId,
  });
  return { from, itemQuery, projectQuery, snapshotQuery };
}

describe("ProjectDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("owner-scopes the project and work list and applies allowlisted filters", async () => {
    const queries = setupQueries({
      items: [
        {
          created_at: "2026-11-20T10:00:00.000Z",
          description: null,
          due_date: "2026-11-30",
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          priority: "high",
          project_id: projectId,
          status: "review",
          title: "Confirm release notes",
          updated_at: "2026-11-21T10:00:00.000Z",
        },
      ],
    });

    render(
      await ProjectDetailPage({
        params: Promise.resolve({ projectId }),
        searchParams: Promise.resolve({ priority: "high", status: "review" }),
      }),
    );

    expect(queries.projectQuery.idEq).toHaveBeenCalledWith("id", projectId);
    expect(queries.projectQuery.ownerEq).toHaveBeenCalledWith(
      "owner_id",
      ownerId,
    );
    expect(queries.itemQuery.builder.eq).toHaveBeenCalledWith(
      "project_id",
      projectId,
    );
    expect(queries.snapshotQuery.builder.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(queries.snapshotQuery.builder.eq).toHaveBeenCalledWith("owner_id", ownerId);
    expect(queries.itemQuery.builder.eq).toHaveBeenCalledWith(
      "owner_id",
      ownerId,
    );
    expect(queries.itemQuery.builder.eq).toHaveBeenCalledWith(
      "status",
      "review",
    );
    expect(queries.itemQuery.builder.eq).toHaveBeenCalledWith(
      "priority",
      "high",
    );
    expect(
      screen.getByRole("heading", { name: "November release" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Confirm release notes")).toBeInTheDocument();
  });

  it("renders the latest repository evidence and deterministic verdict", async () => {
    setupQueries({
      project: [{
        description: "Release scope",
        id: projectId,
        name: "November release",
        repository_full_name: "owner/repo",
        target_date: "2026-11-30",
      }],
      snapshots: [{
        captured_at: "2026-11-25T12:00:00Z",
        default_branch: "main",
        head_committed_at: new Date().toISOString(),
        head_sha: "a".repeat(40),
        id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        open_issues: 0,
        open_pull_requests: 0,
        owner_id: ownerId,
        project_id: projectId,
        repository_full_name: "owner/repo",
        workflow_status: "success",
      }],
    });

    render(await ProjectDetailPage({
      params: Promise.resolve({ projectId }),
      searchParams: Promise.resolve({}),
    }));

    expect(screen.getByRole("link", { name: "owner/repo" })).toHaveAttribute("href", "https://github.com/owner/repo");
    expect(screen.getByText("Listo", { selector: ".readiness-verdict" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /por qué releasedesk decide/i })).toBeInTheDocument();
  });

  it("ignores invalid URL filters without changing authorization filters", async () => {
    const queries = setupQueries();

    render(
      await ProjectDetailPage({
        params: Promise.resolve({ projectId }),
        searchParams: Promise.resolve({
          priority: "urgent",
          status: ["ready", "review"],
        }),
      }),
    );

    expect(queries.itemQuery.builder.eq).toHaveBeenCalledTimes(2);
    expect(queries.itemQuery.builder.eq).toHaveBeenNthCalledWith(
      1,
      "project_id",
      projectId,
    );
    expect(queries.itemQuery.builder.eq).toHaveBeenNthCalledWith(
      2,
      "owner_id",
      ownerId,
    );
  });

  it("rejects malformed IDs before creating a data query", async () => {
    const from = vi.fn();
    mocks.getVerifiedAuth.mockResolvedValue({
      email: "owner@example.test",
      supabase: { from },
      userId: ownerId,
    });

    await expect(
      ProjectDetailPage({
        params: Promise.resolve({ projectId: "not-a-uuid" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(from).not.toHaveBeenCalled();
  });

  it("returns the same not-found boundary for an unavailable owner-scoped project", async () => {
    setupQueries({ project: [] });

    await expect(
      ProjectDetailPage({
        params: Promise.resolve({ projectId }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("throws a safe error when an owner-scoped query fails", async () => {
    const projectQuery = projectBuilder({
      data: null,
      error: { message: "private database detail" },
    });
    const itemQuery = itemsBuilder({ data: [], error: null });
    const snapshotQuery = snapshotBuilder({ data: [], error: null });
    const from = vi.fn((table: string) =>
      table === "projects"
        ? { select: projectQuery.select }
        : table === "work_items"
          ? { select: itemQuery.select }
          : { select: snapshotQuery.select },
    );
    mocks.getVerifiedAuth.mockResolvedValue({
      email: "owner@example.test",
      supabase: { from },
      userId: ownerId,
    });

    await expect(
      ProjectDetailPage({
        params: Promise.resolve({ projectId }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("Project work could not be loaded.");
  });

  it("uses Buenos Aires today for overdue rendering across the UTC rollover", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-25T01:03:00.000Z"));
    setupQueries({
      items: [
        {
          created_at: "2026-11-20T10:00:00.000Z",
          description: null,
          due_date: "2026-11-24",
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          priority: "high",
          project_id: projectId,
          status: "review",
          title: "Due at the operational boundary",
          updated_at: "2026-11-21T10:00:00.000Z",
        },
      ],
    });

    try {
      render(
        await ProjectDetailPage({
          params: Promise.resolve({ projectId }),
          searchParams: Promise.resolve({}),
        }),
      );

      expect(screen.queryByText("Vencido")).not.toBeInTheDocument();
      expect(screen.getByText(/^fecha límite ·/i)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
