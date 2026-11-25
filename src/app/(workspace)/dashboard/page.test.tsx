import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getVerifiedAuth: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/verified-user", () => ({
  getVerifiedAuth: mocks.getVerifiedAuth,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import DashboardPage from "@/app/(workspace)/dashboard/page";

const ownerId = "11111111-1111-4111-8111-111111111111";
const projectId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function baseCount(result: { count: number | null; error: unknown }) {
  const eq = vi.fn().mockResolvedValue({ ...result, data: null });
  const select = vi.fn().mockReturnValue({ eq });
  return { eq, select };
}

function statusCount(result: { count: number | null; error: unknown }) {
  const statusEq = vi.fn().mockResolvedValue({ ...result, data: null });
  const ownerEq = vi.fn().mockReturnValue({ eq: statusEq });
  const select = vi.fn().mockReturnValue({ eq: ownerEq });
  return { ownerEq, select, statusEq };
}

function overdueCount(result: { count: number | null; error: unknown }) {
  const neq = vi.fn().mockResolvedValue({ ...result, data: null });
  const lt = vi.fn().mockReturnValue({ neq });
  const ownerEq = vi.fn().mockReturnValue({ lt });
  const select = vi.fn().mockReturnValue({ eq: ownerEq });
  return { lt, neq, ownerEq, select };
}

function upcomingList(result: { data: unknown[]; error: unknown }) {
  const limit = vi.fn().mockResolvedValue(result);
  const secondOrder = vi.fn().mockReturnValue({ limit });
  const firstOrder = vi.fn().mockReturnValue({ order: secondOrder });
  const neq = vi.fn().mockReturnValue({ order: firstOrder });
  const ownerEq = vi.fn().mockReturnValue({ neq });
  const select = vi.fn().mockReturnValue({ eq: ownerEq });
  return { firstOrder, limit, neq, ownerEq, secondOrder, select };
}

function setupDashboard(error: unknown = null) {
  const project = baseCount({ count: 2, error });
  const total = baseCount({ count: 8, error: null });
  const inProgress = statusCount({ count: 3, error: null });
  const review = statusCount({ count: 2, error: null });
  const ready = statusCount({ count: 1, error: null });
  const overdue = overdueCount({ count: 1, error: null });
  const upcoming = upcomingList({
    data: [
      {
        due_date: "2026-11-30",
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        priority: "high",
        project: { name: "November release" },
        project_id: projectId,
        status: "review",
        title: "Confirm release notes",
        updated_at: "2026-11-24T10:00:00.000Z",
      },
    ],
    error: null,
  });
  const builders = [project, total, inProgress, review, ready, overdue, upcoming];
  const from = vi.fn();
  builders.forEach((builder) => {
    from.mockReturnValueOnce({ select: builder.select });
  });
  mocks.getVerifiedAuth.mockResolvedValue({
    email: "owner@example.test",
    supabase: { from },
    userId: ownerId,
  });
  return { from, inProgress, overdue, upcoming };
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-25T01:03:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders exact owner-scoped metrics and an upcoming work item", async () => {
    const queries = setupDashboard();

    render(await DashboardPage());

    const metrics = screen.getByRole("region", { name: /release metrics/i });
    expect(within(metrics).getByText("Projects").nextElementSibling).toHaveTextContent("2");
    expect(within(metrics).getByText("Total work").nextElementSibling).toHaveTextContent("8");
    expect(within(metrics).getByText("In progress").nextElementSibling).toHaveTextContent("3");
    expect(within(metrics).getByText("In review").nextElementSibling).toHaveTextContent("2");
    expect(within(metrics).getByText("Ready").nextElementSibling).toHaveTextContent("1");
    expect(within(metrics).getByText("Overdue").nextElementSibling).toHaveTextContent("1");
    expect(screen.getByRole("link", { name: "Confirm release notes" })).toHaveAttribute(
      "href",
      `/projects/${projectId}`,
    );
    expect(queries.from).toHaveBeenCalledTimes(7);
    expect(queries.inProgress.ownerEq).toHaveBeenCalledWith("owner_id", ownerId);
    expect(queries.inProgress.statusEq).toHaveBeenCalledWith(
      "status",
      "in_progress",
    );
    expect(queries.overdue.lt).toHaveBeenCalledWith(
      "due_date",
      "2026-11-24",
    );
    expect(queries.overdue.neq).toHaveBeenCalledWith("status", "ready");
    expect(queries.upcoming.limit).toHaveBeenCalledWith(5);
  });

  it("throws a safe error if an owner-scoped metric query fails", async () => {
    setupDashboard({ message: "private database detail" });

    await expect(DashboardPage()).rejects.toThrow(
      "Dashboard data could not be loaded.",
    );
  });
});
