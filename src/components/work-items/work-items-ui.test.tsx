import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DeleteWorkItemForm } from "@/components/work-items/delete-work-item-form";
import { WorkItemFilterForm } from "@/components/work-items/work-item-filters";
import { WorkItemForm } from "@/components/work-items/work-item-form";
import {
  WorkItemList,
  type WorkItemSummary,
} from "@/components/work-items/work-item-list";
import type { WorkItemActionState } from "@/lib/work-items/action-state";

const projectId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const item: WorkItemSummary = {
  created_at: "2026-11-20T10:00:00.000Z",
  description: "Confirm every public path.",
  due_date: "2026-11-23",
  id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  priority: "high",
  project_id: projectId,
  status: "review",
  title: "Verify production release",
  updated_at: "2026-11-21T10:00:00.000Z",
};

const idleAction = vi.fn(
  async (): Promise<WorkItemActionState> => ({ status: "idle" }),
);

describe("work-item UI", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    idleAction.mockClear();
  });

  it("provides labeled create fields and native length constraints", () => {
    render(
      <WorkItemForm
        action={idleAction}
        projectId={projectId}
        variant="create"
      />,
    );

    expect(screen.getByLabelText("Title")).toBeRequired();
    expect(screen.getByLabelText("Title")).toHaveAttribute(
      "maxlength",
      "120",
    );
    expect(screen.getByLabelText("Description")).toHaveAttribute(
      "maxlength",
      "2000",
    );
    expect(screen.getByLabelText("Status")).toHaveValue("backlog");
    expect(screen.getByLabelText("Priority")).toHaveValue("medium");
    expect(screen.getByLabelText("Due date")).toHaveAttribute(
      "type",
      "date",
    );
  });

  it("renders an overdue marker and a quick next-status control", () => {
    render(
      <WorkItemList
        changeStatusAction={idleAction}
        deleteAction={idleAction}
        filters={{}}
        items={[item]}
        projectId={projectId}
        today="2026-11-24"
        updateAction={idleAction}
      />,
    );

    const card = screen.getByRole("listitem");
    expect(within(card).getByText("Overdue")).toBeInTheDocument();
    expect(within(card).getByText(/was due/i)).toBeInTheDocument();
    expect(
      within(card).getByRole("button", { name: /move to ready/i }),
    ).toBeEnabled();
    expect(within(card).getByText("Priority high")).toBeInTheDocument();
    expect(within(card).getByText("Edit work item")).toBeInTheDocument();
    expect(
      within(card).getByRole("button", { name: /delete work item/i }),
    ).toBeInTheDocument();
  });

  it("does not mark ready work overdue", () => {
    render(
      <WorkItemList
        changeStatusAction={idleAction}
        deleteAction={idleAction}
        filters={{}}
        items={[{ ...item, status: "ready" }]}
        projectId={projectId}
        today="2026-11-24"
        updateAction={idleAction}
      />,
    );

    expect(screen.queryByText("Overdue")).not.toBeInTheDocument();
    expect(screen.getByText("Ready to release")).toBeInTheDocument();
  });

  it("renders a filtered empty state and a clear-filter link", () => {
    const { rerender } = render(
      <WorkItemList
        changeStatusAction={idleAction}
        deleteAction={idleAction}
        filters={{ status: "review" }}
        items={[]}
        projectId={projectId}
        updateAction={idleAction}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /no work items match these filters/i }),
    ).toBeInTheDocument();

    rerender(
      <WorkItemFilterForm
        filters={{ priority: "high", status: "review" }}
        projectId={projectId}
      />,
    );

    expect(screen.getByLabelText("Status")).toHaveValue("review");
    expect(screen.getByLabelText("Priority")).toHaveValue("high");
    expect(screen.getByRole("link", { name: /clear filters/i })).toHaveAttribute(
      "href",
      `/projects/${projectId}`,
    );
  });

  it("requires explicit confirmation before deletion", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(
      <DeleteWorkItemForm
        action={idleAction}
        itemId={item.id}
        itemTitle={item.title}
        projectId={projectId}
      />,
    );

    fireEvent.submit(
      screen
        .getByRole("button", { name: /delete work item/i })
        .closest("form")!,
    );

    expect(confirm).toHaveBeenCalledWith(expect.stringContaining(item.title));
    expect(idleAction).not.toHaveBeenCalled();
  });
});
