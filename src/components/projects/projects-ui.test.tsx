import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DeleteProjectForm } from "@/components/projects/delete-project-form";
import { ProjectForm } from "@/components/projects/project-form";
import { ProjectList, type ProjectSummary } from "@/components/projects/project-list";
import type { ProjectActionState } from "@/lib/projects/action-state";

const idleAction = vi.fn(
  async (): Promise<ProjectActionState> => ({ status: "idle" }),
);

const project: ProjectSummary = {
  created_at: "2026-11-01T12:00:00.000Z",
  description: "Scope ready for release.",
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  name: "November release",
  target_date: "2026-11-30",
};

describe("project CRUD UI", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    idleAction.mockClear();
  });

  it("renders an honest empty state", () => {
    render(
      <ProjectList
        deleteAction={idleAction}
        projects={[]}
        updateAction={idleAction}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /todavía no hay proyectos/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/solo vos vas a poder leerlo/i)).toBeInTheDocument();
  });

  it("renders project data and accessible edit controls", () => {
    render(
      <ProjectList
        deleteAction={idleAction}
        projects={[project]}
        updateAction={idleAction}
      />,
    );

    const card = screen.getByRole("listitem");
    expect(within(card).getByRole("heading", { name: project.name })).toBeInTheDocument();
    expect(
      within(card).getAllByText(project.description ?? "")[0],
    ).toBeInTheDocument();
    expect(within(card).getByText(/30.*nov.*2026/i)).toBeInTheDocument();
    expect(within(card).getByText(/editar proyecto/i)).toBeInTheDocument();
    expect(within(card).getByRole("button", { name: /eliminar proyecto/i })).toBeInTheDocument();
  });

  it("provides labeled create fields with native constraints", () => {
    render(<ProjectForm action={idleAction} variant="create" />);

    expect(screen.getByLabelText("Nombre")).toHaveAttribute("maxlength", "80");
    expect(screen.getByLabelText("Nombre")).toBeRequired();
    expect(screen.getByLabelText("Descripción")).toHaveAttribute(
      "maxlength",
      "500",
    );
    expect(screen.getByLabelText("Fecha objetivo")).toHaveAttribute(
      "type",
      "date",
    );
    expect(
      screen.getByRole("button", { name: "Crear proyecto" }),
    ).toBeEnabled();
  });

  it("requires explicit confirmation before deletion", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(
      <DeleteProjectForm
        action={idleAction}
        projectId={project.id}
        projectName={project.name}
      />,
    );

    fireEvent.submit(screen.getByRole("button", { name: /eliminar proyecto/i }).closest("form")!);

    expect(confirm).toHaveBeenCalledWith(
      expect.stringContaining(project.name),
    );
    expect(idleAction).not.toHaveBeenCalled();
  });
});
