import "server-only";

import type { RepositorySnapshot } from "@/lib/github/readiness";

const GITHUB_API = "https://api.github.com";
const API_VERSION = "2026-03-10";

export type GitHubErrorCode = "not_found" | "rate_limited" | "unavailable";

export class GitHubClientError extends Error {
  constructor(public readonly code: GitHubErrorCode) {
    super(code);
    this.name = "GitHubClientError";
  }
}

export type GitHubSnapshotInput = Pick<
  RepositorySnapshot,
  | "repository_full_name"
  | "default_branch"
  | "head_sha"
  | "head_committed_at"
  | "workflow_status"
  | "open_pull_requests"
  | "open_issues"
>;

type FetchLike = typeof fetch;

function headers(): HeadersInit {
  const token = process.env.GITHUB_TOKEN?.trim();
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "User-Agent": "ReleaseDesk",
    "X-GitHub-Api-Version": API_VERSION,
  };
}

async function requestJson(fetcher: FetchLike, path: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetcher(`${GITHUB_API}${path}`, {
      cache: "no-store",
      headers: headers(),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new GitHubClientError("unavailable");
  }

  if (!response.ok) {
    if (response.status === 404) throw new GitHubClientError("not_found");
    if (response.status === 403 || response.status === 429) {
      throw new GitHubClientError("rate_limited");
    }
    throw new GitHubClientError("unavailable");
  }

  try {
    return await response.json();
  } catch {
    throw new GitHubClientError("unavailable");
  }
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

async function countPages(
  fetcher: FetchLike,
  path: string,
  include: (item: Record<string, unknown>) => boolean,
): Promise<number> {
  const pageSize = 100;
  const maximumPages = 100;
  let total = 0;
  for (let page = 1; page <= maximumPages + 1; page += 1) {
    const payload = await requestJson(fetcher, `${path}&page=${page}`);
    if (!Array.isArray(payload)) throw new GitHubClientError("unavailable");

    if (page === maximumPages + 1) {
      if (payload.length === 0) return total;
      throw new GitHubClientError("unavailable");
    }

    total += payload.filter((item) => {
      const parsed = record(item);
      return parsed ? include(parsed) : false;
    }).length;
    if (payload.length < pageSize) return total;
  }
  throw new GitHubClientError("unavailable");
}

function workflowStatus(payload: unknown): RepositorySnapshot["workflow_status"] {
  const root = record(payload);
  const runs = root?.workflow_runs;
  if (!Array.isArray(runs)) throw new GitHubClientError("unavailable");
  if (runs.length === 0) return "not_configured";
  const run = record(runs[0]);
  if (!run || typeof run.status !== "string") throw new GitHubClientError("unavailable");
  if (run.status !== "completed") return "pending";
  const allowed = new Set<RepositorySnapshot["workflow_status"]>([
    "success", "failure", "cancelled", "neutral", "skipped", "timed_out",
    "action_required", "stale", "startup_failure",
  ]);
  return typeof run.conclusion === "string" && allowed.has(run.conclusion as RepositorySnapshot["workflow_status"])
    ? (run.conclusion as RepositorySnapshot["workflow_status"])
    : "unknown";
}

export async function fetchPublicRepositorySnapshot(
  repositoryFullName: string,
  fetcher: FetchLike = fetch,
): Promise<GitHubSnapshotInput> {
  const repositoryPayload = record(
    await requestJson(fetcher, `/repos/${repositoryFullName}`),
  );
  const defaultBranch = repositoryPayload?.default_branch;
  if (
    !repositoryPayload ||
    repositoryPayload.private !== false ||
    typeof defaultBranch !== "string" ||
    defaultBranch.length === 0
  ) {
    throw new GitHubClientError(repositoryPayload?.private === true ? "not_found" : "unavailable");
  }

  const encodedBranch = encodeURIComponent(defaultBranch);
  const [commitPayload, workflowPayload, openPullRequests, openIssues] = await Promise.all([
    requestJson(fetcher, `/repos/${repositoryFullName}/commits/${encodedBranch}`),
    requestJson(fetcher, `/repos/${repositoryFullName}/actions/runs?branch=${encodedBranch}&per_page=1`),
    countPages(fetcher, `/repos/${repositoryFullName}/pulls?state=open&per_page=100`, () => true),
    countPages(fetcher, `/repos/${repositoryFullName}/issues?state=open&per_page=100`, (item) => !("pull_request" in item)),
  ]);

  const commit = record(commitPayload);
  const commitDetails = record(commit?.commit);
  const committer = record(commitDetails?.committer);
  const author = record(commitDetails?.author);
  const headSha = commit?.sha;
  const committedAt = committer?.date ?? author?.date;
  if (
    typeof headSha !== "string" ||
    !/^[0-9a-f]{40,64}$/i.test(headSha) ||
    typeof committedAt !== "string" ||
    Number.isNaN(Date.parse(committedAt))
  ) {
    throw new GitHubClientError("unavailable");
  }

  return {
    default_branch: defaultBranch,
    head_committed_at: committedAt,
    head_sha: headSha.toLowerCase(),
    open_issues: openIssues,
    open_pull_requests: openPullRequests,
    repository_full_name: repositoryFullName,
    workflow_status: workflowStatus(workflowPayload),
  };
}
