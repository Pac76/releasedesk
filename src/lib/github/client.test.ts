// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import {
  fetchPublicRepositorySnapshot,
  GitHubClientError,
} from "@/lib/github/client";

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

function pageFrom(url: string): number {
  return Number(new URL(url).searchParams.get("page") ?? "1");
}

function baseResponse(url: string): Response | null {
  if (url.endsWith("/repos/openai/openai-node")) {
    return response({ default_branch: "main", private: false });
  }
  if (url.includes("/commits/main")) {
    return response({
      commit: { committer: { date: "2026-11-24T10:00:00Z" } },
      sha: "a".repeat(40),
    });
  }
  if (url.includes("/actions/runs")) {
    return response({
      workflow_runs: [{ conclusion: "success", status: "completed" }],
    });
  }
  return null;
}

function expectCode(code: GitHubClientError["code"]): Partial<GitHubClientError> {
  return { code };
}

describe("GitHub public repository client", () => {
  it("reads every signal and excludes pull requests from the issue count", async () => {
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      const common = baseResponse(url);
      if (common) return common;
      if (url.includes("/pulls?")) return response([{ id: 1 }]);
      if (url.includes("/issues?")) {
        return response([{ id: 2 }, { id: 3, pull_request: {} }]);
      }
      return response({}, 500);
    }) as typeof fetch;

    const snapshot = await fetchPublicRepositorySnapshot(
      "openai/openai-node",
      fetcher,
    );

    expect(snapshot).toMatchObject({
      default_branch: "main",
      open_issues: 1,
      open_pull_requests: 1,
      workflow_status: "success",
    });
    expect(fetcher).toHaveBeenCalledTimes(5);
  });

  it("counts realistic multi-page pull request and issue responses", async () => {
    const pullPage = Array.from({ length: 100 }, (_, id) => ({ id }));
    const issuePage = Array.from({ length: 100 }, (_, id) =>
      id % 2 === 0 ? { id } : { id, pull_request: {} },
    );
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      const common = baseResponse(url);
      if (common) return common;
      const page = pageFrom(url);
      if (url.includes("/pulls?")) {
        return response(page === 1 ? pullPage : [{ id: 101 }, { id: 102 }]);
      }
      if (url.includes("/issues?")) {
        return response(page === 1 ? issuePage : [{ id: 101 }]);
      }
      return response({}, 500);
    }) as typeof fetch;

    const snapshot = await fetchPublicRepositorySnapshot(
      "openai/openai-node",
      fetcher,
    );

    expect(snapshot.open_pull_requests).toBe(102);
    expect(snapshot.open_issues).toBe(51);
    expect(fetcher).toHaveBeenCalledTimes(7);
  });

  it("accepts exactly 10,000 items when an empty next page proves termination", async () => {
    const fullPage = Array.from({ length: 100 }, (_, id) => ({ id }));
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      const common = baseResponse(url);
      if (common) return common;
      if (url.includes("/issues?")) return response([]);
      if (url.includes("/pulls?")) {
        return response(pageFrom(url) <= 100 ? fullPage : []);
      }
      return response({}, 500);
    }) as typeof fetch;

    const snapshot = await fetchPublicRepositorySnapshot(
      "openai/openai-node",
      fetcher,
    );

    expect(snapshot.open_pull_requests).toBe(10_000);
    expect(fetcher).toHaveBeenCalledTimes(105);
  });

  it("fails safely when pagination remains unbounded after 10,000 items", async () => {
    const fullPage = Array.from({ length: 100 }, (_, id) => ({ id }));
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      const common = baseResponse(url);
      if (common) return common;
      if (url.includes("/issues?")) return response([]);
      if (url.includes("/pulls?")) return response(fullPage);
      return response({}, 500);
    }) as typeof fetch;

    await expect(
      fetchPublicRepositorySnapshot("openai/openai-node", fetcher),
    ).rejects.toMatchObject(expectCode("unavailable"));
  });

  it("maps private/not-found and rate-limited responses without response details", async () => {
    const privateFetcher = vi
      .fn()
      .mockResolvedValue(response({ default_branch: "main", private: true })) as typeof fetch;
    await expect(
      fetchPublicRepositorySnapshot("owner/repo", privateFetcher),
    ).rejects.toMatchObject(expectCode("not_found"));

    const rateFetcher = vi
      .fn()
      .mockResolvedValue(response({ message: "secret provider detail" }, 403)) as typeof fetch;
    await expect(
      fetchPublicRepositorySnapshot("owner/repo", rateFetcher),
    ).rejects.toMatchObject(expectCode("rate_limited"));
  });

  it("maps malformed JSON, malformed shapes, and upstream 500 responses safely", async () => {
    const malformedJson = vi
      .fn()
      .mockResolvedValue(new Response("{not-json", { status: 200 })) as typeof fetch;
    await expect(
      fetchPublicRepositorySnapshot("owner/repo", malformedJson),
    ).rejects.toMatchObject(expectCode("unavailable"));

    const malformedShape = vi.fn().mockResolvedValue(response([])) as typeof fetch;
    await expect(
      fetchPublicRepositorySnapshot("owner/repo", malformedShape),
    ).rejects.toMatchObject(expectCode("unavailable"));

    const upstreamFailure = vi
      .fn()
      .mockResolvedValue(response({ message: "provider internals" }, 500)) as typeof fetch;
    await expect(
      fetchPublicRepositorySnapshot("owner/repo", upstreamFailure),
    ).rejects.toMatchObject(expectCode("unavailable"));
  });
});
