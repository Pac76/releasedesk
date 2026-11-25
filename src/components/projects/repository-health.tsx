"use client";

import { useActionState } from "react";

import { useLocale } from "@/components/locale-provider";
import {
  INITIAL_REPOSITORY_SYNC_STATE,
  type RepositorySyncActionState,
} from "@/lib/github/action-state";
import {
  evaluateReadiness,
  type RepositorySnapshot,
  workflowStatusLabel,
} from "@/lib/github/readiness";
import { localize } from "@/lib/i18n/locale";

type SyncAction = (
  state: RepositorySyncActionState,
  formData: FormData,
) => Promise<RepositorySyncActionState>;

type RepositoryHealthProps = {
  action: SyncAction;
  currentRepository: string | null;
  projectId: string;
  snapshot: RepositorySnapshot | null;
};

export function RepositoryHealth({
  action,
  currentRepository,
  projectId,
  snapshot,
}: RepositoryHealthProps) {
  const locale = useLocale();
  const copy = localize(locale, {
    en: {
      branch: "Default branch",
      captured: "Snapshot",
      connect: "Connect and analyze",
      description: "Connect a public repository and save an immutable snapshot of its operational state.",
      empty: "There is no snapshot yet. Evaluation begins when you sync a public repository.",
      heading: "Verifiable GitHub signals",
      help: "Enter the name only, without a URL or .git suffix.",
      issues: "Open issues",
      kicker: "Repository intelligence",
      lastCommit: "Latest commit",
      observedCommit: "Observed commit",
      placeholder: "organization/project",
      pullRequests: "Open pull requests",
      rationale: "Why ReleaseDesk decides",
      repository: "Repository",
      repositoryLabel: "Public repository",
      syncing: "Checking GitHub…",
      update: "Update snapshot",
    },
    es: {
      branch: "Rama principal",
      captured: "Captura",
      connect: "Conectar y analizar",
      description: "Conectá un repositorio público y guardá una captura inmutable de su estado operativo.",
      empty: "Todavía no hay una captura. La evaluación comienza cuando sincronizás un repositorio público.",
      heading: "Señales verificables de GitHub",
      help: "Solo el nombre, sin URL ni sufijo .git.",
      issues: "Issues abiertos",
      kicker: "Inteligencia de repositorio",
      lastCommit: "Último commit",
      observedCommit: "Commit observado",
      placeholder: "organización/proyecto",
      pullRequests: "Pull requests abiertos",
      rationale: "Por qué ReleaseDesk decide",
      repository: "Repositorio",
      repositoryLabel: "Repositorio público",
      syncing: "Consultando GitHub…",
      update: "Actualizar captura",
    },
  });
  const timestampFormatter = new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: locale === "es" ? "America/Argentina/Buenos_Aires" : "UTC",
  });
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_REPOSITORY_SYNC_STATE,
  );
  const assessment = snapshot ? evaluateReadiness(snapshot, new Date(), locale) : null;

  return (
    <section className="repository-panel" aria-labelledby="repository-title">
      <div className="repository-heading">
        <div>
          <p className="eyebrow eyebrow-dark">{copy.kicker}</p>
          <h2 id="repository-title">{copy.heading}</h2>
          <p>{copy.description}</p>
        </div>
        {assessment ? (
          <span className={`readiness-verdict readiness-${assessment.verdict}`}>
            {assessment.label}
          </span>
        ) : null}
      </div>

      <form action={formAction} className="repository-form">
        <input name="project_id" type="hidden" value={projectId} />
        <div className="field-group">
          <label htmlFor="repository_full_name">{copy.repositoryLabel}</label>
          <input
            aria-describedby={state.fieldError ? "repository-help repository-error" : "repository-help"}
            aria-invalid={state.fieldError ? true : undefined}
            autoComplete="off"
            defaultValue={currentRepository ?? ""}
            id="repository_full_name"
            name="repository_full_name"
            placeholder={copy.placeholder}
            required
            spellCheck={false}
            type="text"
          />
          <span id="repository-help">{copy.help}</span>
          {state.fieldError ? (
            <span className="field-error" id="repository-error">
              {state.fieldError}
            </span>
          ) : null}
        </div>
        <button className="button button-ink" disabled={pending} type="submit">
          {pending ? copy.syncing : snapshot ? copy.update : copy.connect}
        </button>
      </form>
      {state.message ? (
        <p aria-live="polite" className={`form-message form-message-${state.status}`}>
          {state.message}
        </p>
      ) : null}

      {snapshot && assessment ? (
        <div className="repository-snapshot">
          <div className="snapshot-summary">
            <div>
              <span>{copy.repository}</span>
              <a
                href={`https://github.com/${snapshot.repository_full_name}`}
                rel="noreferrer"
                target="_blank"
              >
                {snapshot.repository_full_name}
              </a>
            </div>
            <div>
              <span>{copy.branch}</span>
              <strong>{snapshot.default_branch}</strong>
            </div>
            <div>
              <span>{copy.observedCommit}</span>
              <code title={snapshot.head_sha}>{snapshot.head_sha.slice(0, 7)}</code>
            </div>
            <div>
              <span>{copy.captured}</span>
              <strong>{timestampFormatter.format(new Date(snapshot.captured_at))}</strong>
            </div>
          </div>
          <dl className="repository-signals">
            <div>
              <dt>GitHub Actions</dt>
              <dd>{workflowStatusLabel(snapshot.workflow_status, locale)}</dd>
            </div>
            <div>
              <dt>{copy.pullRequests}</dt>
              <dd>{snapshot.open_pull_requests}</dd>
            </div>
            <div>
              <dt>{copy.issues}</dt>
              <dd>{snapshot.open_issues}</dd>
            </div>
            <div>
              <dt>{copy.lastCommit}</dt>
              <dd>{timestampFormatter.format(new Date(snapshot.head_committed_at))}</dd>
            </div>
          </dl>
          <div className="readiness-evidence">
            <h3>{copy.rationale} “{assessment.label}”</h3>
            <ul>
              {assessment.evidence.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      ) : (
        <p className="repository-empty">{copy.empty}</p>
      )}
    </section>
  );
}
