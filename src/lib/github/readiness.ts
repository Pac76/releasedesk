import type { Database } from "@/types/database";
import { localize, type Locale } from "@/lib/i18n/locale";

export type RepositorySnapshot = Database["public"]["Tables"]["repository_snapshots"]["Row"];
export type ReadinessVerdict = "ready" | "at_risk" | "blocked" | "unknown";

export type ReadinessAssessment = {
  evidence: string[];
  label: string;
  verdict: ReadinessVerdict;
};

const BLOCKING_WORKFLOWS = new Set([
  "failure",
  "cancelled",
  "timed_out",
  "action_required",
  "startup_failure",
]);

function getWorkflowLabels(
  locale: Locale,
): Record<RepositorySnapshot["workflow_status"], string> {
  return localize(locale, {
    en: {
      action_required: "requires manual action",
      cancelled: "was canceled",
      failure: "failed",
      neutral: "finished without a conclusive signal",
      not_configured: "has no recorded runs",
      pending: "is still running",
      skipped: "was skipped",
      stale: "is stale",
      startup_failure: "could not start",
      success: "completed successfully",
      timed_out: "timed out",
      unknown: "returned an unrecognized status",
    },
    es: {
      action_required: "requiere una acción manual",
      cancelled: "fue cancelado",
      failure: "falló",
      neutral: "terminó sin una señal concluyente",
      not_configured: "no tiene ejecuciones registradas",
      pending: "todavía está en ejecución",
      skipped: "fue omitido",
      stale: "quedó desactualizado",
      startup_failure: "no pudo iniciarse",
      success: "terminó correctamente",
      timed_out: "agotó el tiempo disponible",
      unknown: "no entregó un estado reconocible",
    },
  });
}

export function evaluateReadiness(
  snapshot: RepositorySnapshot,
  now = new Date(),
  locale: Locale = "en",
): ReadinessAssessment {
  const workflowLabels = getWorkflowLabels(locale);
  const copy = localize(locale, {
    en: {
      atRisk: "At risk",
      blocked: "Blocked",
      fresh: "The default-branch commit was updated within the last 14 days.",
      latestWorkflow: `The latest workflow ${workflowLabels[snapshot.workflow_status]}.`,
      notEnoughData: "Not enough data",
      openIssue: `${snapshot.open_issues} open issue${snapshot.open_issues === 1 ? "" : "s"}.`,
      openPullRequest: `${snapshot.open_pull_requests} open pull request${snapshot.open_pull_requests === 1 ? "" : "s"}.`,
      ready: "Ready",
      stale: "The default-branch commit is more than 14 days old.",
    },
    es: {
      atRisk: "En riesgo",
      blocked: "Bloqueado",
      fresh: "El commit principal fue actualizado en los últimos 14 días.",
      latestWorkflow: `El último workflow ${workflowLabels[snapshot.workflow_status]}.`,
      notEnoughData: "Sin señal suficiente",
      openIssue: `${snapshot.open_issues} issue${snapshot.open_issues === 1 ? "" : "s"} abierto${snapshot.open_issues === 1 ? "" : "s"}.`,
      openPullRequest: `${snapshot.open_pull_requests} pull request${snapshot.open_pull_requests === 1 ? "" : "s"} abierto${snapshot.open_pull_requests === 1 ? "" : "s"}.`,
      ready: "Listo",
      stale: "El commit principal tiene más de 14 días.",
    },
  });
  const evidence = [
    copy.latestWorkflow,
    copy.openPullRequest,
    copy.openIssue,
  ];

  if (BLOCKING_WORKFLOWS.has(snapshot.workflow_status)) {
    return { evidence, label: copy.blocked, verdict: "blocked" };
  }

  if (["unknown", "not_configured"].includes(snapshot.workflow_status)) {
    return { evidence, label: copy.notEnoughData, verdict: "unknown" };
  }

  const headAgeMs = now.getTime() - new Date(snapshot.head_committed_at).getTime();
  const isStale = !Number.isFinite(headAgeMs) || headAgeMs > 14 * 24 * 60 * 60 * 1000;
  if (isStale) {
    evidence.push(copy.stale);
  }

  if (
    snapshot.workflow_status !== "success" ||
    snapshot.open_pull_requests > 0 ||
    snapshot.open_issues > 0 ||
    isStale
  ) {
    return { evidence, label: copy.atRisk, verdict: "at_risk" };
  }

  evidence.push(copy.fresh);
  return { evidence, label: copy.ready, verdict: "ready" };
}

export function workflowStatusLabel(
  status: RepositorySnapshot["workflow_status"],
  locale: Locale = "en",
): string {
  return getWorkflowLabels(locale)[status];
}
