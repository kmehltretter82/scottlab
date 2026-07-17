import {
  closureSteps,
  enumerateStates,
  type ClosureStep,
  type TokenId,
} from "@scottlab/core";
import { accessPermissionsSystem, coquandSystem } from "@scottlab/examples";
import { useEffect, useRef, type Ref } from "react";

import "./entailment-lesson.css";

export interface EntailmentLessonTokenCopy {
  readonly label: string;
  readonly accessibleName: string;
  readonly description: string;
}

export interface EntailmentLessonRuleCopy {
  readonly label: string;
  readonly explanation: string;
}

export interface EntailmentLessonCopy {
  readonly pageTitle: string;
  readonly markerLabel: string;
  readonly markerName: string;
  readonly footerSystem: string;
  readonly footerStage: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly workspaceLabel: string;
  readonly tokens: Readonly<Record<string, EntailmentLessonTokenCopy>>;
  readonly rules: Readonly<Record<string, EntailmentLessonRuleCopy>>;
  readonly bottom: {
    readonly heading: string;
    readonly explanation: string;
    readonly stateLabel: string;
    readonly specificObservations: string;
  };
  readonly state: {
    readonly currentStateLabel: string;
    readonly alwaysPresentRole: string;
    readonly chosenPremiseRole: string;
    readonly presentConclusionRole: string;
    readonly pendingConclusionRole: string;
  };
  readonly trace: {
    readonly heading: string;
    readonly navigationLabel: string;
    readonly progress: (current: number, total: number) => string;
    readonly premiseLabel: string;
    readonly pendingRuleLabel: string;
    readonly activeRuleLabel: string;
    readonly appliedRuleLabel: string;
    readonly premiseHeading: (premises: string) => string;
    readonly premiseExplanation: (premises: string) => string;
    readonly activeRuleHeading: (rule: string) => string;
    readonly activeRuleExplanation: (
      premises: string,
      conclusion: string,
    ) => string;
    readonly conclusionHeading: (conclusion: string) => string;
    readonly conclusionExplanation: (
      conclusion: string,
      state: string,
    ) => string;
    readonly completeHeading: string;
    readonly completeExplanation: (state: string) => string;
    readonly closureFunctionName: string;
    readonly structuredHeading: string;
    readonly structuredInitialState: (state: string) => string;
    readonly structuredInputStep: (
      step: number,
      input: string,
      state: string,
    ) => string;
    readonly structuredStep: (
      step: number,
      premises: string,
      rule: string,
      conclusion: string,
    ) => string;
    readonly structuredFinalState: (state: string) => string;
  };
  readonly definition: {
    readonly summary: string;
    readonly heading: string;
    readonly introduction: string;
    readonly tokensHeading: string;
    readonly consistencyHeading: string;
    readonly consistencyValue: string;
    readonly rulesHeading: string;
  };
  readonly nonFlat: {
    readonly heading: string;
    readonly introduction: string;
    readonly ruleLabel: string;
    readonly statesLabel: string;
    readonly conclusion: string;
  };
  readonly datalog: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly explanation: string;
    readonly limits: string;
  };
  readonly challenge: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly explanation: string;
    readonly choiceLegend: string;
    readonly chooseToken: (token: string) => string;
    readonly correctHeading: string;
    readonly correctExplanation: (token: string) => string;
    readonly incorrectHeading: string;
    readonly incorrectExplanation: (
      chosenToken: string,
      targetToken: string,
    ) => string;
  };
  readonly actions: {
    readonly startLesson: string;
    readonly addAdministrator: string;
    readonly previous: string;
    readonly next: string;
    readonly showCompleteClosure: string;
    readonly replay: string;
    readonly continueStates: string;
    readonly back: string;
    readonly openSandbox: string;
  };
}

export interface EntailmentLessonProps {
  readonly copy: EntailmentLessonCopy;
  readonly headingRef: Ref<HTMLHeadingElement>;
  readonly progress: EntailmentLessonProgress;
  readonly onProgressChange: (progress: EntailmentLessonProgress) => void;
  readonly statesUnlocked: boolean;
  readonly onBack: () => void;
  readonly onContinueStates: () => void;
  readonly onOpenSandbox: () => void;
}

type TraceFrameKind = "premise" | "activeRule" | "conclusion";

interface TraceFrame {
  readonly kind: TraceFrameKind;
  readonly step: ClosureStep;
}

export type EntailmentLessonStage =
  | { readonly kind: "bottom" }
  | { readonly kind: "trace"; readonly frameIndex: number }
  | { readonly kind: "complete" };

export interface EntailmentLessonProgress {
  readonly stage: EntailmentLessonStage;
  readonly challengeAttempt?: TokenId;
}

export const initialEntailmentLessonProgress: EntailmentLessonProgress = {
  stage: { kind: "bottom" },
};

const administratorTokenId = "administrator";
const bottomComputation = closureSteps(accessPermissionsSystem, []);
const administratorComputation = closureSteps(accessPermissionsSystem, [
  administratorTokenId,
]);
const administratorInputStep = (() => {
  const step = administratorComputation.steps.find(
    (candidate) =>
      candidate.reason.kind === "reflexivity" &&
      candidate.conclusion === administratorTokenId,
  );
  if (step === undefined) {
    throw new Error(
      "The access-permissions lesson requires its administrator input step.",
    );
  }
  return step;
})();
const declaredRuleSteps = administratorComputation.steps.filter(
  (step) => step.reason.kind === "declaredRule",
);
const traceFrames: readonly TraceFrame[] = declaredRuleSteps.flatMap((step) => [
  { kind: "premise", step },
  { kind: "activeRule", step },
  { kind: "conclusion", step },
]);
const finalDeclaredStep = declaredRuleSteps.at(-1);

if (traceFrames.length === 0 || finalDeclaredStep === undefined) {
  throw new Error("The access-permissions lesson requires declared rules.");
}

const challengeTargetId = finalDeclaredStep.conclusion;

/** The number of manual trace frames, for progress validation. */
export const entailmentTraceFrameCount = traceFrames.length;

const coquandStates = enumerateStates(coquandSystem).states;
const declaredCoquandRule = coquandSystem.entailmentRules[0];

if (coquandStates.length !== 7 || declaredCoquandRule === undefined) {
  throw new Error(
    "The entailment lesson requires the seven-state Coquand system.",
  );
}

const coquandRule = declaredCoquandRule;

function coquandTokenSymbol(tokenId: TokenId): string {
  const token = coquandSystem.tokens.find(({ id }) => id === tokenId);
  if (token === undefined) {
    throw new Error(`The Coquand system does not define token '${tokenId}'.`);
  }
  return token.symbol ?? token.label;
}

function formatCoquandSet(tokenIds: readonly TokenId[]): string {
  const tokenSet = new Set(tokenIds);
  return `{${coquandSystem.tokens
    .filter(({ id }) => tokenSet.has(id))
    .map(({ id }) => coquandTokenSymbol(id))
    .join(", ")}}`;
}

function requireRuleId(step: ClosureStep): string {
  if (step.reason.kind !== "declaredRule") {
    throw new Error("The entailment lesson can display only declared rules.");
  }
  return step.reason.ruleId;
}

export function EntailmentLesson({
  copy,
  headingRef,
  progress,
  onProgressChange,
  statesUnlocked,
  onBack,
  onContinueStates,
  onOpenSandbox,
}: EntailmentLessonProps) {
  const nextFrameRef = useRef<HTMLButtonElement>(null);
  const challengeHeadingRef = useRef<HTMLHeadingElement>(null);
  const { stage, challengeAttempt } = progress;
  const currentFrame =
    stage.kind === "trace" ? traceFrames[stage.frameIndex] : undefined;
  const currentState =
    stage.kind === "bottom"
      ? bottomComputation.state
      : stage.kind === "complete"
        ? administratorComputation.state
        : currentFrame?.kind === "conclusion"
          ? currentFrame.step.after
          : currentFrame?.step.before ?? administratorComputation.state;
  const challengeIsCorrect = challengeAttempt === challengeTargetId;

  useEffect(() => {
    if (stage.kind === "trace") {
      nextFrameRef.current?.focus();
    } else if (stage.kind === "complete") {
      challengeHeadingRef.current?.focus();
    }
  }, [stage.kind]);

  function requireTokenCopy(tokenId: TokenId): EntailmentLessonTokenCopy {
    const tokenCopy = copy.tokens[tokenId];
    if (tokenCopy === undefined) {
      throw new Error(`Missing entailment lesson copy for token '${tokenId}'.`);
    }
    return tokenCopy;
  }

  function tokenLabel(tokenId: TokenId): string {
    const token = accessPermissionsSystem.tokens.find(({ id }) => id === tokenId);
    if (token === undefined) {
      throw new Error(`Access Permissions does not define token '${tokenId}'.`);
    }
    return token.symbol ?? requireTokenCopy(tokenId).label;
  }

  function formatSet(tokenIds: readonly TokenId[]): string {
    return tokenIds.length === 0
      ? "∅"
      : `{${tokenIds.map(tokenLabel).join(", ")}}`;
  }

  function premiseLabel(step: ClosureStep): string {
    return formatSet(step.premises);
  }

  function requireRuleCopy(step: ClosureStep): EntailmentLessonRuleCopy {
    const ruleId = requireRuleId(step);
    const ruleCopy = copy.rules[ruleId];
    if (ruleCopy === undefined) {
      throw new Error(`Missing entailment lesson copy for rule '${ruleId}'.`);
    }
    return ruleCopy;
  }

  function stateTokenRole(tokenId: TokenId): string {
    if (tokenId === accessPermissionsSystem.delta) {
      return copy.state.alwaysPresentRole;
    }
    if (tokenId === administratorTokenId) {
      return copy.state.chosenPremiseRole;
    }
    return copy.state.presentConclusionRole;
  }

  function tokenIsFocused(tokenId: TokenId): boolean {
    if (currentFrame?.kind === "premise") {
      return currentFrame.step.premises.includes(tokenId);
    }
    return (
      currentFrame?.kind === "conclusion" &&
      currentFrame.step.conclusion === tokenId
    );
  }

  function ruleState(step: ClosureStep): "active" | "complete" | "pending" {
    if (currentFrame?.kind === "activeRule" && currentFrame.step === step) {
      return "active";
    }
    return currentState.includes(step.conclusion) ? "complete" : "pending";
  }

  function beginTrace(): void {
    onProgressChange({ ...progress, stage: { kind: "trace", frameIndex: 0 } });
  }

  function showPreviousFrame(): void {
    if (stage.kind !== "trace" || stage.frameIndex === 0) {
      return;
    }
    onProgressChange({
      ...progress,
      stage: { kind: "trace", frameIndex: stage.frameIndex - 1 },
    });
  }

  function showNextFrame(): void {
    if (stage.kind !== "trace") {
      return;
    }
    if (stage.frameIndex === traceFrames.length - 1) {
      onProgressChange({ ...progress, stage: { kind: "complete" } });
      return;
    }
    onProgressChange({
      ...progress,
      stage: { kind: "trace", frameIndex: stage.frameIndex + 1 },
    });
  }

  function showCompleteClosure(): void {
    onProgressChange({ ...progress, stage: { kind: "complete" } });
  }

  function chooseChallengeToken(tokenId: TokenId): void {
    onProgressChange({ ...progress, challengeAttempt: tokenId });
  }

  let explanationHeading = copy.bottom.heading;
  let explanationText = copy.bottom.explanation;
  let formalStep = `${copy.trace.closureFunctionName}(∅) = ${formatSet(
    bottomComputation.state,
  )} = ⊥`;

  if (stage.kind === "complete") {
    const state = formatSet(administratorComputation.state);
    explanationHeading = copy.trace.completeHeading;
    explanationText = copy.trace.completeExplanation(state);
    formalStep = `${copy.trace.closureFunctionName}({${tokenLabel(
      administratorTokenId,
    )}}) = ${state}`;
  } else if (currentFrame !== undefined) {
    const premises = premiseLabel(currentFrame.step);
    const conclusion = tokenLabel(currentFrame.step.conclusion);
    const rule = requireRuleCopy(currentFrame.step).label;

    if (currentFrame.kind === "premise") {
      explanationHeading = copy.trace.premiseHeading(premises);
      explanationText = copy.trace.premiseExplanation(premises);
      formalStep = `${premises} ⊆ ${formatSet(currentFrame.step.before)}`;
    } else if (currentFrame.kind === "activeRule") {
      explanationHeading = copy.trace.activeRuleHeading(rule);
      explanationText = copy.trace.activeRuleExplanation(
        premises,
        conclusion,
      );
      formalStep = `${premises} ⊢ ${conclusion}`;
    } else {
      explanationHeading = copy.trace.conclusionHeading(conclusion);
      explanationText = copy.trace.conclusionExplanation(
        conclusion,
        formatSet(currentFrame.step.after),
      );
      formalStep = `${premises} ⊢ ${conclusion} ⇒ ${formatSet(
        currentFrame.step.after,
      )}`;
    }
  }

  return (
    <main className="entailment-main">
      <section className="entailment-introduction">
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

      <fieldset
        className="entailment-workspace"
        aria-label={copy.workspaceLabel}
      >
        <section
          className={`entailment-stage is-${stage.kind}`}
          aria-labelledby="entailment-stage-title"
        >
          <header className="entailment-stage-heading">
            <p>
              {stage.kind === "bottom"
                ? copy.bottom.stateLabel
                : copy.trace.heading}
            </p>
            <div aria-live="polite" aria-atomic="true">
              <h2 id="entailment-stage-title">{explanationHeading}</h2>
              <p>{explanationText}</p>
            </div>
          </header>

          {stage.kind === "bottom" ? (
            <output className="entailment-bottom-state" aria-live="polite">
              <span>{copy.state.currentStateLabel}</span>
              <code>{formatSet(currentState)} = ⊥</code>
              <p>{copy.bottom.specificObservations}</p>
            </output>
          ) : currentFrame === undefined ? (
            null
          ) : (
            <ol
              className="entailment-focus-chain"
              aria-label={copy.trace.heading}
            >
              <li>
                <article
                  className={`entailment-token is-present${
                    currentFrame.kind === "premise" ? " is-focused" : ""
                  }`}
                >
                  <span>{copy.trace.premiseLabel}</span>
                  <strong>{premiseLabel(currentFrame.step)}</strong>
                  <small>
                    {currentFrame.step.premises
                      .map((tokenId) => requireTokenCopy(tokenId).description)
                      .join(" ")}
                  </small>
                </article>
              </li>
              <li className="entailment-focus-connector" aria-hidden="true">
                →
              </li>
              <li>
                <article
                  className={`entailment-rule is-${ruleState(
                    currentFrame.step,
                  )}`}
                >
                  <span>
                    {currentFrame.kind === "premise"
                      ? copy.trace.pendingRuleLabel
                      : currentFrame.kind === "activeRule"
                        ? copy.trace.activeRuleLabel
                        : copy.trace.appliedRuleLabel}
                  </span>
                  <code>
                    {premiseLabel(currentFrame.step)} ⊢{" "}
                    {tokenLabel(currentFrame.step.conclusion)}
                  </code>
                  <small>{requireRuleCopy(currentFrame.step).explanation}</small>
                </article>
              </li>
              <li className="entailment-focus-connector" aria-hidden="true">
                →
              </li>
              <li>
                <article
                  className={`entailment-token is-derived${
                    currentState.includes(currentFrame.step.conclusion)
                      ? " is-present"
                      : ""
                  }${
                    tokenIsFocused(currentFrame.step.conclusion)
                      ? " is-focused"
                      : ""
                  }`}
                >
                  <span>
                    {currentState.includes(currentFrame.step.conclusion)
                      ? copy.state.presentConclusionRole
                      : copy.state.pendingConclusionRole}
                  </span>
                  <strong>{tokenLabel(currentFrame.step.conclusion)}</strong>
                  <small>
                    {requireTokenCopy(currentFrame.step.conclusion).description}
                  </small>
                </article>
              </li>
            </ol>
          )}

          {stage.kind === "bottom" ? null : (
            <output className="entailment-current-state" aria-live="polite">
              <span>{copy.state.currentStateLabel}</span>
              <code>{formatSet(currentState)}</code>
            </output>
          )}

          <code className="entailment-formal-step">{formalStep}</code>

          <div className="entailment-stage-controls">
            {stage.kind === "bottom" ? (
              <button
                className="primary-action"
                type="button"
                onClick={beginTrace}
              >
                <span>{copy.actions.addAdministrator}</span>
                <span className="button-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ) : stage.kind === "trace" ? (
              <>
                <span className="entailment-progress">
                  {copy.trace.progress(
                    stage.frameIndex + 1,
                    traceFrames.length,
                  )}
                </span>
                <fieldset aria-label={copy.trace.navigationLabel}>
                  <button
                    type="button"
                    disabled={stage.frameIndex === 0}
                    onClick={showPreviousFrame}
                  >
                    ← {copy.actions.previous}
                  </button>
                  <button
                    ref={nextFrameRef}
                    type="button"
                    onClick={showNextFrame}
                  >
                    {copy.actions.next} →
                  </button>
                </fieldset>
                <button
                  className="secondary-action"
                  type="button"
                  onClick={showCompleteClosure}
                >
                  {copy.actions.showCompleteClosure}
                </button>
              </>
            ) : (
              <button
                className="secondary-action"
                type="button"
                onClick={beginTrace}
              >
                {copy.actions.replay}
              </button>
            )}
          </div>
        </section>
      </fieldset>

      {stage.kind === "complete" ? (
        <details className="entailment-formal-details">
          <summary>{copy.definition.summary}</summary>
          <section
            className="entailment-definition"
            aria-labelledby="entailment-definition-title"
          >
            <h2 id="entailment-definition-title">
              {copy.definition.heading}
            </h2>
            <p>{copy.definition.introduction}</p>
            <dl>
              <div>
                <dt>{copy.definition.tokensHeading}</dt>
                <dd>
                  <code>
                    T ={" "}
                    {formatSet(
                      accessPermissionsSystem.tokens.map(({ id }) => id),
                    )}
                  </code>
                </dd>
              </div>
              <div>
                <dt>{copy.definition.consistencyHeading}</dt>
                <dd>{copy.definition.consistencyValue}</dd>
              </div>
              <div>
                <dt>{copy.definition.rulesHeading}</dt>
                <dd>
                  <ul>
                    {accessPermissionsSystem.entailmentRules.map((rule) => (
                      <li key={rule.id}>
                        <code>
                          {formatSet(rule.premises)} ⊢{" "}
                          {tokenLabel(rule.conclusion)}
                        </code>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </section>

          <section
            className="entailment-nonflat"
            aria-labelledby="entailment-nonflat-title"
          >
            <h2 id="entailment-nonflat-title">{copy.nonFlat.heading}</h2>
            <p>{copy.nonFlat.introduction}</p>
            <dl>
              <div>
                <dt>{copy.nonFlat.ruleLabel}</dt>
                <dd>
                  <code>
                    {formatCoquandSet(coquandRule.premises)} ⊢{" "}
                    {coquandTokenSymbol(coquandRule.conclusion)}
                  </code>
                </dd>
              </div>
              <div>
                <dt>{copy.nonFlat.statesLabel}</dt>
                <dd>
                  <code>
                    {coquandStates
                      .map((state) => formatCoquandSet(state))
                      .join("  ")}
                  </code>
                </dd>
              </div>
            </dl>
            <p>{copy.nonFlat.conclusion}</p>
          </section>

          <section className="entailment-structured-trace">
            <h2>{copy.trace.structuredHeading}</h2>
            <ol>
              <li>
                {copy.trace.structuredInitialState(
                  formatSet(bottomComputation.state),
                )}
              </li>
              <li>
                {copy.trace.structuredInputStep(
                  1,
                  tokenLabel(administratorInputStep.conclusion),
                  formatSet(administratorInputStep.after),
                )}
              </li>
              {declaredRuleSteps.map((step, index) => (
                <li key={requireRuleId(step)}>
                  {copy.trace.structuredStep(
                    index + 2,
                    premiseLabel(step),
                    requireRuleCopy(step).label,
                    tokenLabel(step.conclusion),
                  )}
                </li>
              ))}
              <li>
                {copy.trace.structuredFinalState(
                  formatSet(administratorComputation.state),
                )}
              </li>
            </ol>
          </section>
        </details>
      ) : null}

      {stage.kind === "complete" ? (
        <aside
          className="entailment-datalog"
          aria-labelledby="entailment-datalog-title"
        >
          <p className="entailment-datalog-eyebrow">{copy.datalog.eyebrow}</p>
          <h2 id="entailment-datalog-title">{copy.datalog.heading}</h2>
          <p>{copy.datalog.explanation}</p>
          <p className="entailment-datalog-limits">{copy.datalog.limits}</p>
        </aside>
      ) : null}

      {stage.kind === "complete" ? (
        <section
          className="entailment-challenge"
          aria-labelledby="challenge-title"
        >
          <div>
            <p>{copy.challenge.eyebrow}</p>
            <h2
              id="challenge-title"
              ref={challengeHeadingRef}
              tabIndex={-1}
            >
              {copy.challenge.heading}
            </h2>
            <p>{copy.challenge.explanation}</p>
          </div>
          <fieldset>
            <legend>{copy.challenge.choiceLegend}</legend>
            <div>
              {accessPermissionsSystem.tokens
                .filter(({ id }) => id !== accessPermissionsSystem.delta)
                .map(({ id }) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={copy.challenge.chooseToken(tokenLabel(id))}
                    aria-pressed={challengeAttempt === id}
                    onClick={() => chooseChallengeToken(id)}
                  >
                    <span>{stateTokenRole(id)}</span>
                    <strong>{tokenLabel(id)}</strong>
                  </button>
                ))}
            </div>
          </fieldset>
          {challengeAttempt === undefined ? null : (
            <output
              className={`entailment-challenge-feedback${
                challengeIsCorrect ? " is-correct" : " is-incorrect"
              }`}
              aria-live="polite"
            >
              <span aria-hidden="true">{challengeIsCorrect ? "✓" : "×"}</span>
              <span className="entailment-challenge-feedback-copy">
                <strong>
                  {challengeIsCorrect
                    ? copy.challenge.correctHeading
                    : copy.challenge.incorrectHeading}
                </strong>
                <span className="entailment-challenge-feedback-text">
                  {challengeIsCorrect
                    ? copy.challenge.correctExplanation(
                        tokenLabel(challengeTargetId),
                      )
                    : copy.challenge.incorrectExplanation(
                        tokenLabel(challengeAttempt),
                        tokenLabel(challengeTargetId),
                      )}
                </span>
              </span>
            </output>
          )}
        </section>
      ) : null}

      <div className="entailment-actions">
        {challengeIsCorrect || statesUnlocked ? (
          <button
            className="primary-action"
            type="button"
            onClick={onContinueStates}
          >
            {copy.actions.continueStates}
          </button>
        ) : null}
        <button className="secondary-action" type="button" onClick={onBack}>
          {copy.actions.back}
        </button>
        <button
          className="secondary-action"
          type="button"
          onClick={onOpenSandbox}
        >
          {copy.actions.openSandbox}
        </button>
      </div>
    </main>
  );
}
