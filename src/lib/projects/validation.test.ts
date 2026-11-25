import { describe, expect, it } from "vitest";

import {
  isValidIsoDate,
  isValidUuid,
  validateProjectInput,
} from "@/lib/projects/validation";

function projectData(
  name: string,
  description = "",
  targetDate = "",
): FormData {
  const data = new FormData();
  data.set("name", name);
  data.set("description", description);
  data.set("target_date", targetDate);
  return data;
}

describe("project input validation", () => {
  it("normalizes required and optional fields", () => {
    expect(
      validateProjectInput(
        projectData("  Release November  ", "  Stable delivery  ", "2026-11-30"),
      ),
    ).toEqual({
      data: {
        description: "Stable delivery",
        name: "Release November",
        target_date: "2026-11-30",
      },
      success: true,
    });

    expect(validateProjectInput(projectData("Project"))).toEqual({
      data: { description: null, name: "Project", target_date: null },
      success: true,
    });
  });

  it("rejects blank or oversized text", () => {
    const result = validateProjectInput(
      projectData(" ", "x".repeat(501)),
    );

    expect(result).toEqual({
      errors: {
        description: "La descripción puede tener hasta 500 caracteres.",
        name: "El nombre debe tener entre 1 y 80 caracteres.",
      },
      success: false,
    });
  });

  it("validates real ISO calendar dates", () => {
    expect(isValidIsoDate("2026-02-28")).toBe(true);
    expect(isValidIsoDate("2026-02-30")).toBe(false);
    expect(isValidIsoDate("30/11/2026")).toBe(false);
  });

  it("accepts only canonical versioned UUIDs", () => {
    expect(isValidUuid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")).toBe(true);
    expect(isValidUuid("not-a-project-id")).toBe(false);
    expect(isValidUuid("aaaaaaaa-aaaa-0aaa-0aaa-aaaaaaaaaaaa")).toBe(false);
  });
});
