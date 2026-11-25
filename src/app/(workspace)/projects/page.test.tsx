import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createProjectAction: vi.fn(),
  deleteProjectAction: vi.fn(),
  getVerifiedAuth: vi.fn(),
  redirect: vi.fn(),
  updateProjectAction: vi.fn(),
}));

vi.mock("@/lib/auth/verified-user", () => ({
  getVerifiedAuth: mocks.getVerifiedAuth,
}));
vi.mock("@/app/projects/actions", () => ({
  createProjectAction: mocks.createProjectAction,
  deleteProjectAction: mocks.deleteProjectAction,
  updateProjectAction: mocks.updateProjectAction,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import ProjectsPage from "@/app/(workspace)/projects/page";

const ownerId = "11111111-1111-4111-8111-111111111111";

describe("ProjectsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries only the verified owner's projects and renders empty state", async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    mocks.getVerifiedAuth.mockResolvedValue({
      email: "owner@example.test",
      supabase: { from },
      userId: ownerId,
    });

    render(await ProjectsPage());

    expect(from).toHaveBeenCalledWith("projects");
    expect(select).toHaveBeenCalledWith(
      "id, name, description, target_date, created_at",
    );
    expect(eq).toHaveBeenCalledWith("owner_id", ownerId);
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(
      screen.getByRole("heading", { name: /no projects yet/i }),
    ).toBeInTheDocument();
  });

  it("renders rows returned by the owner-scoped query", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [
        {
          created_at: "2026-11-01T12:00:00.000Z",
          description: null,
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          name: "Production launch",
          target_date: null,
        },
      ],
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    mocks.getVerifiedAuth.mockResolvedValue({
      email: "owner@example.test",
      supabase: { from: vi.fn().mockReturnValue({ select }) },
      userId: ownerId,
    });

    render(await ProjectsPage());

    expect(
      screen.getByRole("heading", { name: "Production launch" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No description.")).toBeInTheDocument();
  });

  it("throws a safe error when the provider query fails", async () => {
    const order = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "private database detail" },
    });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    mocks.getVerifiedAuth.mockResolvedValue({
      email: "owner@example.test",
      supabase: { from: vi.fn().mockReturnValue({ select }) },
      userId: ownerId,
    });

    await expect(ProjectsPage()).rejects.toThrow(
      "Projects could not be loaded.",
    );
  });
});
