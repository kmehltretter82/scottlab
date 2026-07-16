import {
  closureSteps,
  type ClosureStep,
  type TokenId,
} from "@scottlab/core";
import { accessPermissionsSystem } from "@scottlab/examples";
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
    readonly heading: string;
    readonly introduction: string;
    readonly currentStateLabel: string;
    readonly alwaysPresentRole: string;
    readonly chosenPremiseRole: string;
    readonly presentConclusionRole: string;
    readonly pendingConclusionRole: string;
  };
  readonly trace: {
    readonly heading: string;
    readonly introduction: string;
    readonly navigationLabel: string;
    readonly progress: (current: number, total: number) => string;
    readonly premiseLabel: string;
    readonly pendingRuleLabel: string;
    readonly activeRuleLabel: string;
    readonly appliedRuleLabel: string;
    readonly conclusionLabel: string;
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
    readonly structuredSummary: string;
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
    readonly heading: string;
    readonly introduction: string;
    readonly tokensHeading: string;
    readonly consistencyHeading: string;
    readonly consistencyValue: string;
    readonly rulesHeading: string;
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
    onProgressChange({ stage: { kind: "trace", frameIndex: 0 } });
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
    onProgressChange({ stage: { kind: "complete" } });
  }

  function chooseChallengeToken(tokenId: TokenId): void {
    onProgressChange({ ...progress, challengeAttempt: tokenId });
  }

  let explanationHeading = copy.bottom.heading;
  let explanationText = copy.bottom.explanation;
  let formalStep = `closure(∅) = ${formatSet(bottomComputation.state)} = ⊥`;

  if (stage.kind === "complete") {
    const state = formatSet(administratorComputation.state);
    explanationHeading = copy.trace.completeHeading;
    explanationText = copy.trace.completeExplanation(state);
    formalStep = `closure({${tokenLabel(administratorTokenId)}}) = ${state}`;
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
          className="entailment-area entailment-canvas"
          aria-labelledby="entailment-canvas-title"
        >
          <header className="entailment-area-heading">
            <span>01</span>
            <div>
              <h2 id="entailment-canvas-title">{copy.state.heading}</h2>
              <p>{copy.state.introduction}</p>
            </div>
          </header>

          <ol className="entailment-chain" aria-label={copy.trace.heading}>
            <li>
              <article
                className={`entailment-token${
                  currentState.includes(administratorTokenId)
                    ? " is-present"
                    : ""
                }${tokenIsFocused(administratorTokenId) ? " is-focused" : ""}`}
              >
                <span>{copy.state.chosenPremiseRole}</span>
                <strong>{tokenLabel(administratorTokenId)}</strong>
                <small>{requireTokenCopy(administratorTokenId).description}</small>
              </article>
            </li>
            {declaredRuleSteps.flatMap((step, index) => {
              const ruleCopy = requireRuleCopy(step);
              const conclusion = step.conclusion;
              const state = ruleState(step);
              return [
                <li className="entailment-rule-item" key={requireRuleId(step)}>
                  <span className="entailment-connector" aria-hidden="true">
                    →
                  </span>
                  <article className={`entailment-rule is-${state}`}>
                    <span>
                      {state === "pending"
                        ? copy.trace.pendingRuleLabel
                        : state === "active"
                          ? copy.trace.activeRuleLabel
                          : copy.trace.appliedRuleLabel}
                    </span>
                    <code>
                      {premiseLabel(step)} ⊢ {tokenLabel(conclusion)}
                    </code>
                    <small>{ruleCopy.explanation}</small>
                  </article>
                  <span className="entailment-connector" aria-hidden="true">
                    →
                  </span>
                </li>,
                <li key={`${requireRuleId(step)}-conclusion`}>
                  <article
                    className={`entailment-token is-derived${
                      currentState.includes(conclusion) ? " is-present" : ""
                    }${tokenIsFocused(conclusion) ? " is-focused" : ""}`}
                  >
                    <span>
                      {currentState.includes(conclusion)
                        ? copy.state.presentConclusionRole
                        : copy.state.pendingConclusionRole}
                    </span>
                    <strong>{tokenLabel(conclusion)}</strong>
                    <small>{requireTokenCopy(conclusion).description}</small>
                    {index === declaredRuleSteps.length - 1 ? (
                      <span className="entailment-chain-depth">
                        {declaredRuleSteps.length}
                      </span>
                    ) : null}
                  </article>
                </li>,
              ];
            })}
          </ol>

          <output className="entailment-current-state" aria-live="polite">
            <span>{copy.state.currentStateLabel}</span>
            <code>{formatSet(currentState)}</code>
          </output>
        </section>

        <section
          className="entailment-area entailment-tray"
          aria-labelledby="entailment-tray-title"
        >
          <header className="entailment-area-heading">
            <span>02</span>
            <div>
              <h2 id="entailment-tray-title">{copy.trace.heading}</h2>
              <p>{copy.trace.introduction}</p>
            </div>
          </header>

          <ul className="entailment-state-tokens">
            {currentState.map((tokenId) => (
              <li key={tokenId} className={tokenId === "delta" ? "is-delta" : ""}>
                <span>{stateTokenRole(tokenId)}</span>
                <strong>{tokenLabel(tokenId)}</strong>
              </li>
            ))}
          </ul>

          {stage.kind === "bottom" ? (
            <button
              className="primary-action"
              type="button"
              onClick={beginTrace}
            >
              <span>{copy.actions.addAdministrator}</span>
              <span className="button-arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          ) : (
            <div className="entailment-trace-controls">
              {stage.kind === "trace" ? (
                <span className="entailment-progress">
                  {copy.trace.progress(
                    stage.frameIndex + 1,
                    traceFrames.length,
                  )}
                </span>
              ) : null}
              <fieldset aria-label={copy.trace.navigationLabel}>
                <button
                  type="button"
                  disabled={stage.kind !== "trace" || stage.frameIndex === 0}
                  onClick={showPreviousFrame}
                >
                  ← {copy.actions.previous}
                </button>
                <button
                  ref={nextFrameRef}
                  type="button"
                  disabled={stage.kind !== "trace"}
                  onClick={showNextFrame}
                >
                  {copy.actions.next} →
                </button>
              </fieldset>
              {stage.kind === "trace" ? (
                <button
                  className="secondary-action"
                  type="button"
                  onClick={showCompleteClosure}
                >
                  {copy.actions.showCompleteClosure}
                </button>
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
          )}
        </section>

        <section
          className="entailment-area entailment-definition"
          aria-labelledby="entailment-definition-title"
        >
          <header className="entailment-area-heading">
            <span>03</span>
            <div>
              <h2 id="entailment-definition-title">{copy.definition.heading}</h2>
              <p>{copy.definition.introduction}</p>
            </div>
          </header>
          <dl>
            <div>
              <dt>{copy.definition.tokensHeading}</dt>
              <dd>
                <code>
                  T = {formatSet(accessPermissionsSystem.tokens.map(({ id }) => id))}
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
                        {formatSet(rule.premises)} ⊢ {tokenLabel(rule.conclusion)}
                      </code>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </section>

        <section
          className="entailment-area entailment-explanation"
          aria-labelledby="entailment-explanation-title"
        >
          <header className="entailment-area-heading">
            <span>04</span>
            <div aria-live="polite" aria-atomic="true">
              <h2 id="entailment-explanation-title">{explanationHeading}</h2>
              <p>{explanationText}</p>
            </div>
          </header>
          <code className="entailment-formal-step">{formalStep}</code>

          <details className="entailment-structured-trace">
            <summary>{copy.trace.structuredSummary}</summary>
            <h3>{copy.trace.structuredHeading}</h3>
            <ol>
              <li>{copy.trace.structuredInitialState(formatSet(bottomComputation.state))}</li>
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
          </details>
        </section>
      </fieldset>

      {stage.kind === "complete" ? (
        <section className="entailment-challenge" aria-labelledby="challenge-title">
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
