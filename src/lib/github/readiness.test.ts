import { describe, expect, it } from "vitest";

import { evaluateReadiness, type RepositorySnapshot } from "@/lib/github/readiness";

const base: RepositorySnapshot = {
  captured_at: "2026-11-25T12:00:00Z",
  default_branch: "main",
  head_committed_at: "2026-11-24T12:00:00Z",
  head_sha: "a".repeat(40),
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  open_issues: 0,
  open_pull_requests: 0,
  owner_id: "11111111-1111-4111-8111-111111111111",
  project_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  repository_full_name: "openai/openai-node",
  workflow_status: "success",
};
const now = new Date("2026-11-25T12:00:00Z");

describe("repository readiness policy", () => {
  it("returns ready only for a fresh, successful, clear repository", () => {
    expect(evaluateReadiness(base, now).verdict).toBe("ready");
  });

  it.each([
    [{ ...base, open_pull_requests: 1 }, "at_risk"],
    [{ ...base, open_issues: 2 }, "at_risk"],
    [{ ...base, head_committed_at: "2026-10-01T12:00:00Z" }, "at_risk"],
    [{ ...base, workflow_status: "failure" as const }, "blocked"],
    [{ ...base, workflow_status: "not_configured" as const }, "unknown"],
  ])("classifies every policy outcome deterministically", (snapshot, verdict) => {
    expect(evaluateReadiness(snapshot, now).verdict).toBe(verdict);
  });
});
