"use client";

import { useActionState } from "react";

import {
  INITIAL_REPOSITORY_SYNC_STATE,
  type RepositorySyncActionState,
} from "@/lib/github/action-state";
import {
  evaluateReadiness,
  type RepositorySnapshot,
  workflowStatusLabel,
} from "@/lib/github/readiness";

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

const timestampFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function RepositoryHealth({
  action,
  currentRepository,
  projectId,
  snapshot,
}: RepositoryHealthProps) {
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_REPOSITORY_SYNC_STATE,
  );
  const assessment = snapshot ? evaluateReadiness(snapshot) : null;

  return (
    <section className="repository-panel" aria-labelledby="repository-title">
      <div className="repository-heading">
        <div>
          <p className="eyebrow eyebrow-dark">Inteligencia de repositorio</p>
          <h2 id="repository-title">Señales verificables de GitHub</h2>
          <p>
            Conectá un repositorio público y guardá una captura inmutable de su
            estado operativo.
          </p>
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
          <label htmlFor="repository_full_name">Repositorio público</label>
          <input
            aria-describedby={state.fieldError ? "repository-help repository-error" : "repository-help"}
            aria-invalid={state.fieldError ? true : undefined}
            autoComplete="off"
            defaultValue={currentRepository ?? ""}
            id="repository_full_name"
            name="repository_full_name"
            placeholder="organización/proyecto"
            required
            spellCheck={false}
            type="text"
          />
          <span id="repository-help">Solo el nombre, sin URL ni sufijo .git.</span>
          {state.fieldError ? (
            <span className="field-error" id="repository-error">
              {state.fieldError}
            </span>
          ) : null}
        </div>
        <button className="button button-ink" disabled={pending} type="submit">
          {pending ? "Consultando GitHub…" : snapshot ? "Actualizar captura" : "Conectar y analizar"}
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
              <span>Repositorio</span>
              <a
                href={`https://github.com/${snapshot.repository_full_name}`}
                rel="noreferrer"
                target="_blank"
              >
                {snapshot.repository_full_name}
              </a>
            </div>
            <div>
              <span>Rama principal</span>
              <strong>{snapshot.default_branch}</strong>
            </div>
            <div>
              <span>Commit observado</span>
              <code title={snapshot.head_sha}>{snapshot.head_sha.slice(0, 7)}</code>
            </div>
            <div>
              <span>Captura</span>
              <strong>{timestampFormatter.format(new Date(snapshot.captured_at))}</strong>
            </div>
          </div>
          <dl className="repository-signals">
            <div>
              <dt>GitHub Actions</dt>
              <dd>{workflowStatusLabel(snapshot.workflow_status)}</dd>
            </div>
            <div>
              <dt>Pull requests abiertos</dt>
              <dd>{snapshot.open_pull_requests}</dd>
            </div>
            <div>
              <dt>Issues abiertos</dt>
              <dd>{snapshot.open_issues}</dd>
            </div>
            <div>
              <dt>Último commit</dt>
              <dd>{timestampFormatter.format(new Date(snapshot.head_committed_at))}</dd>
            </div>
          </dl>
          <div className="readiness-evidence">
            <h3>Por qué ReleaseDesk decide “{assessment.label}”</h3>
            <ul>
              {assessment.evidence.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      ) : (
        <p className="repository-empty">
          Todavía no hay una captura. La evaluación comienza cuando sincronizás
          un repositorio público.
        </p>
      )}
    </section>
  );
}
