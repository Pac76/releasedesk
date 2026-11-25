import { describe, expect, it } from "vitest";

import {
  currentIsoDate,
  isWorkItemOverdue,
  nextWorkItemStatus,
  parseWorkItemFilters,
  validateWorkItemInput,
} from "@/lib/work-items/validation";

function itemForm(overrides: Record<string, string> = {}): FormData {
  const data = new FormData();
  data.set("title", overrides.title ?? "  Confirm release notes  ");
  data.set("description", overrides.description ?? "  Final review  ");
  data.set("status", overrides.status ?? "in_progress");
  data.set("priority", overrides.priority ?? "high");
  data.set("due_date", overrides.due_date ?? "2026-11-30");
  return data;
}

describe("work-item validation", () => {
  it("normalizes a valid work item", () => {
    expect(validateWorkItemInput(itemForm())).toEqual({
      data: {
        description: "Final review",
        due_date: "2026-11-30",
        priority: "high",
        status: "in_progress",
        title: "Confirm release notes",
      },
      success: true,
    });
  });

  it("rejects invalid lengths, enum values, and calendar dates", () => {
    const result = validateWorkItemInput(
      itemForm({
        description: "x".repeat(2001),
        due_date: "2026-02-30",
        priority: "urgent",
        status: "shipping",
        title: " ",
      }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toEqual({
        description: expect.stringMatching(/2000/),
        dueDate: expect.stringMatching(/fecha válida/i),
        priority: expect.stringMatching(/prioridad válida/i),
        status: expect.stringMatching(/estado válido/i),
        title: expect.stringMatching(/1 y 120/i),
      });
    }
  });

  it("strictly allowlists scalar URL filters", () => {
    expect(
      parseWorkItemFilters({ priority: "high", status: "review" }),
    ).toEqual({ priority: "high", status: "review" });
    expect(
      parseWorkItemFilters({ priority: "urgent", status: ["ready"] }),
    ).toEqual({ priority: undefined, status: undefined });
  });

  it("derives operational today independently of the host timezone", () => {
    expect(currentIsoDate(new Date("2026-11-24T15:00:00.000Z"))).toBe(
      "2026-11-24",
    );
    expect(currentIsoDate(new Date("2026-11-25T01:03:00.000Z"))).toBe(
      "2026-11-24",
    );
    expect(currentIsoDate(new Date("2026-11-25T02:59:59.999Z"))).toBe(
      "2026-11-24",
    );
    expect(currentIsoDate(new Date("2026-11-25T03:00:00.000Z"))).toBe(
      "2026-11-25",
    );
  });

  it("compares canonical dates and excludes ready work from overdue", () => {
    expect(isWorkItemOverdue("2026-11-23", "review", "2026-11-24")).toBe(
      true,
    );
    expect(isWorkItemOverdue("2026-11-24", "review", "2026-11-24")).toBe(
      false,
    );
    expect(isWorkItemOverdue("2026-11-23", "ready", "2026-11-24")).toBe(
      false,
    );
  });

  it("advances statuses in the release flow and stops at ready", () => {
    expect(nextWorkItemStatus("backlog")).toBe("in_progress");
    expect(nextWorkItemStatus("in_progress")).toBe("review");
    expect(nextWorkItemStatus("review")).toBe("ready");
    expect(nextWorkItemStatus("ready")).toBeNull();
  });
});
