import {
  inspectStateCandidate,
  type StateCandidateInspection,
  type TokenId,
} from "@scottlab/core";
import { editingPolicySystem } from "@scottlab/examples";
import {
  useEffect,
  useRef,
  type Ref,
} from "react";

import "./state-lesson.css";

export interface StateLessonTokenCopy {
  readonly label: string;
  readonly accessibleName: string;
  readonly description: string;
}

export interface StateLessonCopy {
  readonly pageTitle: string;
  readonly markerLabel: string;
  readonly markerName: string;
  readonly footerSystem: string;
  readonly footerStage: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly workspaceLabel: string;
  readonly tokens: Readonly<Record<string, StateLessonTokenCopy>>;
  readonly selection: {
    readonly heading: string;
    readonly introduction: string;
    readonly selectedLabel: string;
    readonly toggleLegend: string;
    readonly addToken: (token: string) => string;
    readonly removeToken: (token: string) => string;
    readonly emptySelection: string;
  };
  readonly analysis: {
    readonly heading: string;
    readonly introduction: string;
    readonly consistencyCriterion: string;
    readonly closureCriterion: string;
    readonly stateVerdict: string;
    readonly passes: string;
    readonly fails: string;
    readonly notChecked: string;
    readonly inconsistentHeading: string;
    readonly inconsistentExplanation: (witness: string) => string;
    readonly notClosedHeading: string;
    readonly notClosedExplanation: (missing: string) => string;
    readonly stateHeading: string;
    readonly stateExplanation: (state: string) => string;
    readonly witnessLabel: string;
    readonly missingLabel: string;
  };
  readonly definition: {
    readonly heading: string;
    readonly introduction: string;
    readonly tokensHeading: string;
    readonly conflictsHeading: string;
    readonly rulesHeading: string;
    readonly stateCriterionHeading: string;
    readonly stateCriterion: string;
  };
  readonly explanation: {
    readonly heading: string;
    readonly guide: string;
    readonly closedExample: string;
    readonly challenge: string;
    readonly complete: (token: string) => string;
    readonly structuredSummary: string;
    readonly structuredHeading: string;
    readonly selectedStep: (selection: string) => string;
    readonly consistencyPass: string;
    readonly consistencyFail: (witness: string) => string;
    readonly distinguishedStep: (token: string, state: string) => string;
    readonly closureStep: (
      premises: string,
      conclusion: string,
      state: string,
    ) => string;
    readonly closureComplete: (state: string) => string;
    readonly closureResultLabel: string;
  };
  readonly challenge: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly explanation: (selection: string) => string;
    readonly wrongState: string;
    readonly successHeading: string;
  };
  readonly actions: {
    readonly applyClosure: string;
    readonly beginChallenge: string;
    readonly continueMaps: string;
    readonly resetSelection: string;
    readonly replayGuide: string;
    readonly back: string;
  };
}

export type StateLessonStage =
  | "guide"
  | "closedExample"
  | "challenge"
  | "complete";

export interface StateLessonProgress {
  readonly stage: StateLessonStage;
  readonly selection: readonly TokenId[];
}

const guideRuleId = "administrator-entails-may-edit";
const guideRule = editingPolicySystem.entailmentRules.find(
  ({ id }) => id === guideRuleId,
);
if (guideRule === undefined) {
  throw new Error(
    `The states lesson requires the '${guideRuleId}' entailment rule.`,
  );
}

const guideSelection = [
  ...guideRule.premises,
  editingPolicySystem.delta,
] as const;
const guideInspection = inspectStateCandidate(
  editingPolicySystem,
  guideSelection,
);

if (guideInspection.kind !== "notClosed") {
  throw new Error("The states lesson guide selection must be unclosed.");
}

const challengeMissingTokens = guideInspection.missingTokens;
const challengeRequiredPremises = guideRule.premises;

export const initialStateLessonProgress: StateLessonProgress = {
  stage: "guide",
  selection: guideInspection.candidate,
};

export interface StateLessonProps {
  readonly copy: StateLessonCopy;
  readonly headingRef: Ref<HTMLHeadingElement>;
  readonly progress: StateLessonProgress;
  readonly onProgressChange: (progress: StateLessonProgress) => void;
  readonly onBack: () => void;
  readonly onContinueMaps: () => void;
}

function candidateIncludes(
  candidate: readonly TokenId[],
  tokenId: TokenId,
): boolean {
  return candidate.includes(tokenId);
}

export function StateLesson({
  copy,
  headingRef,
  progress,
  onProgressChange,
  onBack,
  onContinueMaps,
}: StateLessonProps) {
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);
  const inspection = inspectStateCandidate(
    editingPolicySystem,
    progress.selection,
  );
  const selection = inspection.candidate;

  // The challenge and complete stages flip on every qualifying token toggle;
  // treat them as one focus context so experimenting with the picker never
  // yanks the keyboard focus to the explanation heading mid-interaction.
  const stageFocusGroup =
    progress.stage === "complete" ? "challenge" : progress.stage;

  useEffect(() => {
    if (stageFocusGroup !== "guide") {
      stageHeadingRef.current?.focus();
    }
  }, [stageFocusGroup]);

  function requireTokenCopy(tokenId: TokenId): StateLessonTokenCopy {
    const tokenCopy = copy.tokens[tokenId];
    if (tokenCopy === undefined) {
      throw new Error(`Missing states lesson copy for token '${tokenId}'.`);
    }
    return tokenCopy;
  }

  function tokenLabel(tokenId: TokenId): string {
    const token = editingPolicySystem.tokens.find(({ id }) => id === tokenId);
    if (token === undefined) {
      throw new Error(`Editing Policy does not define token '${tokenId}'.`);
    }
    return token.symbol ?? requireTokenCopy(tokenId).label;
  }

  function formatSet(tokenIds: readonly TokenId[]): string {
    return tokenIds.length === 0
      ? "∅"
      : `{${tokenIds.map(tokenLabel).join(", ")}}`;
  }

  function setSelection(nextSelection: readonly TokenId[]): void {
    const nextInspection = inspectStateCandidate(
      editingPolicySystem,
      nextSelection,
    );
    const completesChallenge =
      (progress.stage === "challenge" || progress.stage === "complete") &&
      nextInspection.kind === "state" &&
      challengeRequiredPremises.every((tokenId) =>
        nextInspection.candidate.includes(tokenId),
      );
    const nextStage =
      progress.stage === "challenge" || progress.stage === "complete"
        ? completesChallenge
          ? "complete"
          : "challenge"
        : progress.stage;

    onProgressChange({
      stage: nextStage,
      selection: nextInspection.candidate,
    });
  }

  function toggleToken(tokenId: TokenId): void {
    setSelection(
      candidateIncludes(selection, tokenId)
        ? selection.filter((selectedId) => selectedId !== tokenId)
        : [...selection, tokenId],
    );
  }

  function applyClosure(): void {
    if (inspection.kind !== "notClosed") {
      return;
    }
    onProgressChange({
      stage: "closedExample",
      selection: inspection.closure.state,
    });
  }

  function beginChallenge(): void {
    onProgressChange({
      stage: "challenge",
      selection: guideInspection.candidate,
    });
  }

  function resetCurrentStage(): void {
    onProgressChange({
      stage: progress.stage === "guide" ? "guide" : "challenge",
      selection: guideInspection.candidate,
    });
  }

  function replayGuide(): void {
    onProgressChange(initialStateLessonProgress);
  }

  const selectionLabel = formatSet(selection);
  const witnessLabel =
    inspection.kind === "inconsistent" ? formatSet(inspection.witness) : "";
  const missingLabel =
    inspection.kind === "notClosed"
      ? formatSet(inspection.missingTokens)
      : "";
  const closureState =
    inspection.kind === "inconsistent"
      ? undefined
      : inspection.closure.state;
  const closureLabel = closureState === undefined ? "" : formatSet(closureState);
  const isConsistent = inspection.kind !== "inconsistent";
  const isClosed = inspection.kind === "state";
  const isChallenge =
    progress.stage === "challenge" || progress.stage === "complete";
  const challengeHasRequiredPremises = challengeRequiredPremises.every(
    (tokenId) => selection.includes(tokenId),
  );
  const isInitialGuideSelection =
    selection.length === guideInspection.candidate.length &&
    selection.every(
      (tokenId, index) => tokenId === guideInspection.candidate[index],
    );

  let analysisHeading = copy.analysis.stateHeading;
  let analysisExplanation = copy.analysis.stateExplanation(selectionLabel);
  if (inspection.kind === "inconsistent") {
    analysisHeading = copy.analysis.inconsistentHeading;
    analysisExplanation = copy.analysis.inconsistentExplanation(witnessLabel);
  } else if (inspection.kind === "notClosed") {
    analysisHeading = copy.analysis.notClosedHeading;
    analysisExplanation = copy.analysis.notClosedExplanation(missingLabel);
  }

  let stageHeading = copy.explanation.heading;
  let stageExplanation = copy.explanation.guide;
  if (progress.stage === "guide" && !isInitialGuideSelection) {
    stageHeading = analysisHeading;
    stageExplanation = analysisExplanation;
  } else if (progress.stage === "closedExample") {
    stageHeading = copy.analysis.stateHeading;
    stageExplanation = copy.explanation.closedExample;
  } else if (progress.stage === "challenge") {
    stageHeading = copy.challenge.heading;
    stageExplanation = copy.explanation.challenge;
  } else if (progress.stage === "complete") {
    stageHeading = copy.challenge.successHeading;
    stageExplanation = copy.explanation.complete(
      formatSet(challengeMissingTokens),
    );
  }

  function structuredTraceItems(
    result: StateCandidateInspection,
  ): readonly string[] {
    if (result.kind === "inconsistent") {
      return [
        copy.explanation.selectedStep(formatSet(result.candidate)),
        copy.explanation.consistencyFail(formatSet(result.witness)),
      ];
    }

    const candidateTokens = new Set(result.candidate);
    const explanatorySteps = result.closure.steps.filter(
      ({ conclusion, reason }) =>
        !candidateTokens.has(conclusion) &&
        (reason.kind === "distinguishedToken" ||
          reason.kind === "declaredRule"),
    );
    return [
      copy.explanation.selectedStep(formatSet(result.candidate)),
      copy.explanation.consistencyPass,
      ...explanatorySteps.map((step) =>
        step.reason.kind === "distinguishedToken"
          ? copy.explanation.distinguishedStep(
              tokenLabel(step.conclusion),
              formatSet(step.after),
            )
          : copy.explanation.closureStep(
              formatSet(step.premises),
              tokenLabel(step.conclusion),
              formatSet(step.after),
            ),
      ),
      copy.explanation.closureComplete(formatSet(result.closure.state)),
    ];
  }

  return (
    <main className="states-main">
      <section className="states-introduction">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h1 ref={headingRef} tabIndex={-1}>
            {copy.title}
          </h1>
        </div>
        <p>{copy.lead}</p>
      </section>

      <fieldset className="states-workspace" aria-label={copy.workspaceLabel}>
        <section
          className="states-area states-canvas"
          aria-labelledby="states-analysis-title"
        >
          <header className="states-area-heading">
            <span>01</span>
            <div>
              <h2 id="states-analysis-title">{copy.analysis.heading}</h2>
              <p>{copy.analysis.introduction}</p>
            </div>
          </header>

          <div className="states-analysis-flow">
            <article className="states-analysis-card is-selection">
              <span>{copy.selection.selectedLabel}</span>
              <code>{selectionLabel}</code>
              {selection.length === 0 ? (
                <small>{copy.selection.emptySelection}</small>
              ) : null}
            </article>
            <span className="states-analysis-arrow" aria-hidden="true">→</span>
            <article
              className={`states-analysis-card ${
                isConsistent ? "is-pass" : "is-fail"
              }`}
            >
              <span>{copy.analysis.consistencyCriterion}</span>
              <strong>
                {isConsistent ? copy.analysis.passes : copy.analysis.fails}
              </strong>
            </article>
            <span className="states-analysis-arrow" aria-hidden="true">→</span>
            <article
              className={`states-analysis-card ${
                !isConsistent ? "is-pending" : isClosed ? "is-pass" : "is-fail"
              }`}
            >
              <span>{copy.analysis.closureCriterion}</span>
              <strong>
                {!isConsistent
                  ? copy.analysis.notChecked
                  : isClosed
                    ? copy.analysis.passes
                    : copy.analysis.fails}
              </strong>
            </article>
            <span className="states-analysis-arrow" aria-hidden="true">→</span>
            <article
              className={`states-analysis-card is-verdict ${
                isClosed ? "is-pass" : "is-fail"
              }`}
            >
              <span>{copy.analysis.stateVerdict}</span>
              <strong>
                {isClosed ? copy.analysis.passes : copy.analysis.fails}
              </strong>
            </article>
          </div>

          <output
            className="states-analysis-output"
            aria-live="polite"
            aria-atomic="true"
          >
            <strong>{analysisHeading}</strong>
            <span>{analysisExplanation}</span>
            {inspection.kind === "inconsistent" ? (
              <code>
                {copy.analysis.witnessLabel}: {witnessLabel}
              </code>
            ) : inspection.kind === "notClosed" ? (
              <code>
                {copy.analysis.missingLabel}: {missingLabel}
              </code>
            ) : null}
            {isChallenge &&
            inspection.kind === "state" &&
            !challengeHasRequiredPremises ? (
              <span>{copy.challenge.wrongState}</span>
            ) : null}
          </output>
        </section>

        <section
          className="states-area states-tray"
          aria-labelledby="states-selection-title"
        >
          <header className="states-area-heading">
            <span>02</span>
            <div>
              <h2 id="states-selection-title">{copy.selection.heading}</h2>
              <p>{copy.selection.introduction}</p>
            </div>
          </header>

          <fieldset className="states-token-picker">
            <legend>{copy.selection.toggleLegend}</legend>
            <div>
              {editingPolicySystem.tokens.map(({ id }) => {
                const selected = candidateIncludes(selection, id);
                const tokenCopy = requireTokenCopy(id);
                return (
                  <button
                    key={id}
                    type="button"
                    aria-label={
                      selected
                        ? copy.selection.removeToken(tokenCopy.accessibleName)
                        : copy.selection.addToken(tokenCopy.accessibleName)
                    }
                    aria-pressed={selected}
                    disabled={progress.stage === "closedExample"}
                    onClick={() => toggleToken(id)}
                  >
                    <span>{selected ? "✓" : "+"}</span>
                    <strong>{tokenLabel(id)}</strong>
                    <small>{tokenCopy.description}</small>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="states-tray-actions">
            {progress.stage === "guide" && inspection.kind === "notClosed" ? (
              <button
                className="primary-action"
                type="button"
                onClick={applyClosure}
              >
                {copy.actions.applyClosure}
              </button>
            ) : null}
            {progress.stage === "closedExample" ? (
              <button
                className="primary-action"
                type="button"
                onClick={beginChallenge}
              >
                {copy.actions.beginChallenge}
              </button>
            ) : null}
            {progress.stage === "guide" && inspection.kind === "state" ? (
              <button
                className="primary-action"
                type="button"
                onClick={beginChallenge}
              >
                {copy.actions.beginChallenge}
              </button>
            ) : null}
            {progress.stage === "guide" || progress.stage === "challenge" ? (
              <button
                className="secondary-action"
                type="button"
                onClick={resetCurrentStage}
              >
                {copy.actions.resetSelection}
              </button>
            ) : null}
            {progress.stage === "complete" ? (
              <>
                <button
                  className="primary-action"
                  type="button"
                  onClick={onContinueMaps}
                >
                  {copy.actions.continueMaps}
                </button>
                <button
                  className="secondary-action"
                  type="button"
                  onClick={replayGuide}
                >
                  {copy.actions.replayGuide}
                </button>
              </>
            ) : null}
          </div>
        </section>

        <section
          className="states-area states-definition"
          aria-labelledby="states-definition-title"
        >
          <header className="states-area-heading">
            <span>03</span>
            <div>
              <h2 id="states-definition-title">{copy.definition.heading}</h2>
              <p>{copy.definition.introduction}</p>
            </div>
          </header>
          <dl>
            <div>
              <dt>{copy.definition.tokensHeading}</dt>
              <dd>
                <code>
                  T = {formatSet(editingPolicySystem.tokens.map(({ id }) => id))}
                </code>
              </dd>
            </div>
            <div>
              <dt>{copy.definition.conflictsHeading}</dt>
              <dd>
                <ul>
                  {editingPolicySystem.minimalInconsistentSets.map((conflict) => (
                    <li key={conflict.join("-")}>
                      <code>{formatSet(conflict)}</code>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt>{copy.definition.rulesHeading}</dt>
              <dd>
                <ul>
                  {editingPolicySystem.entailmentRules.map((rule) => (
                    <li key={rule.id}>
                      <code>
                        {formatSet(rule.premises)} ⊢ {tokenLabel(rule.conclusion)}
                      </code>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt>{copy.definition.stateCriterionHeading}</dt>
              <dd>{copy.definition.stateCriterion}</dd>
            </div>
          </dl>
        </section>

        <section
          className="states-area states-explanation"
          aria-labelledby="states-explanation-title"
        >
          <header className="states-area-heading">
            <span>04</span>
            <div>
              <h2
                id="states-explanation-title"
                ref={stageHeadingRef}
                tabIndex={-1}
              >
                {stageHeading}
              </h2>
              <p>{stageExplanation}</p>
            </div>
          </header>

          {isChallenge ? (
            <aside className="states-challenge-note">
              <span>{copy.challenge.eyebrow}</span>
              <strong>
                {copy.challenge.explanation(
                  formatSet(guideInspection.candidate),
                )}
              </strong>
            </aside>
          ) : null}

          <details className="states-structured-analysis">
            <summary>{copy.explanation.structuredSummary}</summary>
            <h3>{copy.explanation.structuredHeading}</h3>
            <ol>
              {structuredTraceItems(inspection).map((item, index) => (
                <li key={`${index}-${item}`}>{item}</li>
              ))}
            </ol>
            {closureState === undefined ? null : (
              <code>
                {copy.explanation.closureResultLabel} = {closureLabel}
              </code>
            )}
          </details>
        </section>
      </fieldset>

      <div className="states-actions">
        <button className="secondary-action" type="button" onClick={onBack}>
          {copy.actions.back}
        </button>
      </div>
    </main>
  );
}
