import { describe, expect, it } from "vitest";

import { validateRepositoryFullName } from "@/lib/github/validation";

describe("repository full-name validation", () => {
  it("normalizes a valid public repository identifier", () => {
    expect(validateRepositoryFullName("  OpenAI/OPENAI-NODE  ")).toEqual({
      success: true,
      value: "openai/openai-node",
    });
  });

  it.each(["https://github.com/openai/openai-node", "openai", "-owner/repo", "owner/repo.git", "owner/.."])(
    "rejects unsafe or non-canonical input: %s",
    (value) => expect(validateRepositoryFullName(value).success).toBe(false),
  );
});
