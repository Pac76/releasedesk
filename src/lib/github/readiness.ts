import type { Database } from "@/types/database";

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

const WORKFLOW_LABELS: Record<RepositorySnapshot["workflow_status"], string> = {
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
};

export function evaluateReadiness(
  snapshot: RepositorySnapshot,
  now = new Date(),
): ReadinessAssessment {
  const evidence = [
    `El último workflow ${WORKFLOW_LABELS[snapshot.workflow_status]}.`,
    `${snapshot.open_pull_requests} pull request${snapshot.open_pull_requests === 1 ? "" : "s"} abierto${snapshot.open_pull_requests === 1 ? "" : "s"}.`,
    `${snapshot.open_issues} issue${snapshot.open_issues === 1 ? "" : "s"} abierto${snapshot.open_issues === 1 ? "" : "s"}.`,
  ];

  if (BLOCKING_WORKFLOWS.has(snapshot.workflow_status)) {
    return { evidence, label: "Bloqueado", verdict: "blocked" };
  }

  if (["unknown", "not_configured"].includes(snapshot.workflow_status)) {
    return { evidence, label: "Sin señal suficiente", verdict: "unknown" };
  }

  const headAgeMs = now.getTime() - new Date(snapshot.head_committed_at).getTime();
  const isStale = !Number.isFinite(headAgeMs) || headAgeMs > 14 * 24 * 60 * 60 * 1000;
  if (isStale) {
    evidence.push("El commit principal tiene más de 14 días.");
  }

  if (
    snapshot.workflow_status !== "success" ||
    snapshot.open_pull_requests > 0 ||
    snapshot.open_issues > 0 ||
    isStale
  ) {
    return { evidence, label: "En riesgo", verdict: "at_risk" };
  }

  evidence.push("El commit principal fue actualizado en los últimos 14 días.");
  return { evidence, label: "Listo", verdict: "ready" };
}

export function workflowStatusLabel(status: RepositorySnapshot["workflow_status"]): string {
  return WORKFLOW_LABELS[status];
}
