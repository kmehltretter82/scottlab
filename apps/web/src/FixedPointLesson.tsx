import {
  iterateFromBottom,
  type FixedPointComputation,
  type TokenId,
} from "@scottlab/core";
import {
  booleanNegationMapping,
  boundedLazyNaturalsSystem,
  consOneMapping,
  flatBooleanSystem,
  oneMoreStepMapping,
  streamPrefixesSystem,
} from "@scottlab/examples";
import { useEffect, useRef, type Ref } from "react";

import "./fixed-point-lesson.css";

export interface FixedPointLessonTokenCopy {
  readonly label: string;
  readonly accessibleName: string;
  readonly description: string;
}

export interface FixedPointLessonRuleCopy {
  readonly label: string;
  readonly explanation: string;
}

export interface FixedPointLessonPhaseCopy {
  readonly heading: string;
  readonly introduction: string;
  readonly systemName: string;
  readonly mapName: string;
}

export interface FixedPointLessonCopy {
  readonly pageTitle: string;
  readonly pageDescription: string;
  readonly markerLabel: string;
  readonly markerName: string;
  readonly footerSystem: string;
  readonly footerStage: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly workspaceLabel: string;
  readonly tokens: Readonly<Record<string, FixedPointLessonTokenCopy>>;
  readonly rules: Readonly<Record<string, FixedPointLessonRuleCopy>>;
  readonly intro: {
    readonly heading: string;
    readonly explanation: string;
    readonly mapExplanation: string;
    readonly startAction: string;
  };
  readonly naturalsPhase: FixedPointLessonPhaseCopy;
  readonly streamsPhase: FixedPointLessonPhaseCopy;
  readonly iteration: {
    readonly chainLabel: string;
    readonly iterateName: (index: number) => string;
    readonly bottomIterateName: string;
    readonly currentStateLabel: string;
    readonly progress: (applied: number, total: number) => string;
    readonly applyAction: string;
    readonly stepBackAction: string;
    readonly startHeading: string;
    readonly startExplanation: (state: string) => string;
    readonly appliedHeading: (newTokens: string) => string;
    readonly appliedExplanation: (
      before: string,
      after: string,
    ) => string;
    readonly stabilizedHeading: string;
    readonly stabilizedExplanation: (
      state: string,
      applications: number,
    ) => string;
    readonly boundNote: (bound: string) => string;
    readonly activationsLabel: string;
    readonly newTokensLabel: string;
    readonly nothingNew: string;
    readonly continueStreamsAction: string;
    readonly continueChallengeAction: string;
  };
  readonly challenge: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly explanation: string;
    readonly choiceLegend: string;
    readonly chooseToken: (token: string) => string;
    readonly correctHeading: string;
    readonly correctExplanation: string;
    readonly incorrectHeading: string;
    readonly incorrectExplanation: (token: string) => string;
    readonly finishAction: string;
  };
  readonly counterpoint: {
    readonly heading: string;
    readonly explanation: string;
    readonly formal: string;
  };
  readonly complete: {
    readonly heading: string;
    readonly explanation: string;
  };
  readonly actions: {
    readonly back: string;
    readonly openSandbox: string;
    readonly replay: string;
  };
}

export type FixedPointLessonStage =
  | { readonly kind: "intro" }
  | { readonly kind: "naturals"; readonly applied: number }
  | { readonly kind: "streams"; readonly applied: number }
  | { readonly kind: "challenge"; readonly answer?: TokenId }
  | { readonly kind: "complete" };

export interface FixedPointLessonProgress {
  readonly stage: FixedPointLessonStage;
}

export const initialFixedPointLessonProgress: FixedPointLessonProgress = {
  stage: { kind: "intro" },
};

const naturalsComputation = iterateFromBottom(
  boundedLazyNaturalsSystem,
  oneMoreStepMapping,
);
const streamsComputation = iterateFromBottom(
  streamPrefixesSystem,
  consOneMapping,
);
const negationComputation = iterateFromBottom(
  flatBooleanSystem,
  booleanNegationMapping,
);

if (
  naturalsComputation.stabilizedAfter !== 3 ||
  streamsComputation.stabilizedAfter !== 3 ||
  negationComputation.stabilizedAfter !== 0
) {
  throw new Error(
    "The fixed-point lesson requires its bounded fixtures to stabilize as documented.",
  );
}

const challengeTargetId: TokenId = "starts-111";
const challengeChoiceIds: readonly TokenId[] = [
  "starts-0",
  "starts-1",
  "starts-11",
  "starts-111",
];

/** The number of applications each phase can show, for progress validation. */
export const fixedPointApplicationCounts = {
  naturals: naturalsComputation.steps.length,
  streams: streamsComputation.steps.length,
} as const;

interface PhaseModel {
  readonly computation: FixedPointComputation;
  readonly system:
    | typeof boundedLazyNaturalsSystem
    | typeof streamPrefixesSystem;
  readonly copyKey: "naturalsPhase" | "streamsPhase";
}

const phases: Readonly<Record<"naturals" | "streams", PhaseModel>> = {
  naturals: {
    computation: naturalsComputation,
    system: boundedLazyNaturalsSystem,
    copyKey: "naturalsPhase",
  },
  streams: {
    computation: streamsComputation,
    system: streamPrefixesSystem,
    copyKey: "streamsPhase",
  },
};

export interface FixedPointLessonProps {
  readonly copy: FixedPointLessonCopy;
  readonly headingRef: Ref<HTMLHeadingElement>;
  readonly progress: FixedPointLessonProgress;
  readonly onProgressChange: (progress: FixedPointLessonProgress) => void;
  readonly onBack: () => void;
  readonly onOpenSandbox: () => void;
}

export function FixedPointLesson({
  copy,
  headingRef,
  progress,
  onProgressChange,
  onBack,
  onOpenSandbox,
}: FixedPointLessonProps) {
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);
  const { stage } = progress;

  const focusTarget =
    stage.kind === "naturals" || stage.kind === "streams"
      ? "apply"
      : stage.kind === "challenge" || stage.kind === "complete"
        ? "stage"
        : "none";

  useEffect(() => {
    if (focusTarget === "apply") {
      applyButtonRef.current?.focus();
    } else if (focusTarget === "stage") {
      stageHeadingRef.current?.focus();
    }
  }, [focusTarget]);

  function requireTokenCopy(tokenId: TokenId): FixedPointLessonTokenCopy {
    const tokenCopy = copy.tokens[tokenId];
    if (tokenCopy === undefined) {
      throw new Error(
        `Missing fixed-point lesson copy for token '${tokenId}'.`,
      );
    }
    return tokenCopy;
  }

  function requireRuleCopy(ruleId: string): FixedPointLessonRuleCopy {
    const ruleCopy = copy.rules[ruleId];
    if (ruleCopy === undefined) {
      throw new Error(`Missing fixed-point lesson copy for rule '${ruleId}'.`);
    }
    return ruleCopy;
  }

  function tokenLabel(
    system: PhaseModel["system"],
    tokenId: TokenId,
  ): string {
    const token = system.tokens.find(({ id }) => id === tokenId);
    if (token === undefined) {
      throw new Error(`The lesson system does not define token '${tokenId}'.`);
    }
    return token.symbol ?? requireTokenCopy(tokenId).label;
  }

  function formatSet(
    system: PhaseModel["system"],
    tokenIds: readonly TokenId[],
  ): string {
    const tokenSet = new Set(tokenIds);
    return `{${system.tokens
      .filter(({ id }) => tokenSet.has(id))
      .map(({ id }) => tokenLabel(system, id))
      .join(", ")}}`;
  }

  const phase =
    stage.kind === "naturals" || stage.kind === "streams"
      ? phases[stage.kind]
      : undefined;
  const applied =
    stage.kind === "naturals" || stage.kind === "streams"
      ? stage.applied
      : 0;
  const phaseCopy = phase === undefined ? undefined : copy[phase.copyKey];
  const computation = phase?.computation;
  const stabilizedAfter = computation?.stabilizedAfter ?? 0;
  const isStabilized =
    computation !== undefined && applied > stabilizedAfter;
  const reachedIterateIndex = Math.min(applied, stabilizedAfter);
  const currentState =
    computation === undefined
      ? undefined
      : computation.iterates[reachedIterateIndex];
  const currentStep =
    computation === undefined || applied === 0
      ? undefined
      : computation.steps[applied - 1];
  const totalApplications = computation?.steps.length ?? 0;

  const challengeStage = stage.kind === "challenge" ? stage : undefined;
  const challengeIsCorrect = challengeStage?.answer === challengeTargetId;

  let stageHeading = copy.intro.heading;
  let stageExplanation = copy.intro.explanation;
  let formalStep = "F(⊥) ⊒ ⊥";

  if (phase !== undefined && computation !== undefined && phaseCopy !== undefined) {
    const stateLabel = formatSet(phase.system, currentState ?? []);
    if (applied === 0) {
      stageHeading = copy.iteration.startHeading;
      stageExplanation = copy.iteration.startExplanation(stateLabel);
      formalStep = `x₀ = ⊥ = ${stateLabel}`;
    } else if (isStabilized) {
      stageHeading = copy.iteration.stabilizedHeading;
      stageExplanation = copy.iteration.stabilizedExplanation(
        stateLabel,
        stabilizedAfter,
      );
      formalStep = `${phaseCopy.mapName}(${stateLabel}) = ${stateLabel}`;
    } else if (currentStep !== undefined) {
      const newTokensLabel = formatSet(phase.system, currentStep.newTokens);
      stageHeading = copy.iteration.appliedHeading(newTokensLabel);
      stageExplanation = copy.iteration.appliedExplanation(
        formatSet(phase.system, currentStep.before),
        formatSet(phase.system, currentStep.after),
      );
      formalStep = `x${subscript(applied)} = ${phaseCopy.mapName}(x${subscript(
        applied - 1,
      )}) = ${formatSet(phase.system, currentStep.after)}`;
    }
  } else if (stage.kind === "challenge") {
    stageHeading = copy.challenge.heading;
    stageExplanation = copy.challenge.explanation;
    formalStep = "take 3 (1 : 1 : 1 : …) = [1, 1, 1]";
  } else if (stage.kind === "complete") {
    stageHeading = copy.complete.heading;
    stageExplanation = copy.complete.explanation;
    formalStep = `fix F = ⋃ₙ Fⁿ(⊥)`;
  }

  function subscript(value: number): string {
    const digits = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
    return String(value)
      .split("")
      .map((digit) => digits[Number(digit)] ?? digit)
      .join("");
  }

  function startIteration(): void {
    onProgressChange({ stage: { kind: "naturals", applied: 0 } });
  }

  function applyMap(): void {
    if (stage.kind !== "naturals" && stage.kind !== "streams") {
      return;
    }
    if (stage.applied < phases[stage.kind].computation.steps.length) {
      onProgressChange({
        stage: { kind: stage.kind, applied: stage.applied + 1 },
      });
    }
  }

  function stepBack(): void {
    if (
      (stage.kind !== "naturals" && stage.kind !== "streams") ||
      stage.applied === 0
    ) {
      return;
    }
    onProgressChange({
      stage: { kind: stage.kind, applied: stage.applied - 1 },
    });
  }

  function continueToStreams(): void {
    onProgressChange({ stage: { kind: "streams", applied: 0 } });
  }

  function continueToChallenge(): void {
    onProgressChange({ stage: { kind: "challenge" } });
  }

  function chooseChallengeToken(tokenId: TokenId): void {
    onProgressChange({ stage: { kind: "challenge", answer: tokenId } });
  }

  function finishChallenge(): void {
    if (challengeIsCorrect) {
      onProgressChange({ stage: { kind: "complete" } });
    }
  }

  function replay(): void {
    onProgressChange(initialFixedPointLessonProgress);
  }

  return (
    <main className="fixed-point-main">
      <section className="fixed-point-introduction">
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
        className="fixed-point-workspace"
        aria-label={copy.workspaceLabel}
      >
        <section
          className="fixed-point-stage"
          aria-labelledby="fixed-point-stage-title"
        >
          <header className="fixed-point-stage-heading">
            <p>
              {phase !== undefined && phaseCopy !== undefined
                ? phaseCopy.heading
                : stage.kind === "challenge"
                  ? copy.challenge.eyebrow
                  : copy.intro.heading}
            </p>
            <div aria-live="polite" aria-atomic="true">
              <h2
                id="fixed-point-stage-title"
                ref={stageHeadingRef}
                tabIndex={-1}
              >
                {stageHeading}
              </h2>
              <p>{stageExplanation}</p>
            </div>
          </header>

          {stage.kind === "intro" ? (
            <div className="fixed-point-intro-panels">
              <p>{copy.intro.mapExplanation}</p>
              <div className="fixed-point-map-rules">
                {oneMoreStepMapping.rules.map((rule) => (
                  <code key={rule.id}>
                    {rule.premises.length === 0
                      ? "∅"
                      : formatSet(boundedLazyNaturalsSystem, rule.premises)}
                    {" ⇒ "}
                    {tokenLabel(boundedLazyNaturalsSystem, rule.conclusion)}
                  </code>
                ))}
              </div>
              <button
                className="primary-action"
                type="button"
                onClick={startIteration}
              >
                <span>{copy.intro.startAction}</span>
                <span className="button-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          ) : null}

          {phase !== undefined &&
          computation !== undefined &&
          phaseCopy !== undefined ? (
            <>
              <p className="fixed-point-phase-introduction">
                {phaseCopy.introduction}
              </p>

              <ol
                className="fixed-point-chain"
                aria-label={copy.iteration.chainLabel}
              >
                {computation.iterates.map((iterate, index) => (
                  <li
                    key={index}
                    className={`fixed-point-iterate${
                      index <= reachedIterateIndex ? " is-reached" : ""
                    }${index === reachedIterateIndex ? " is-current" : ""}${
                      index === stabilizedAfter && isStabilized
                        ? " is-fixed"
                        : ""
                    }`}
                  >
                    <span>
                      {index === 0
                        ? copy.iteration.bottomIterateName
                        : copy.iteration.iterateName(index)}
                    </span>
                    <code>{formatSet(phase.system, iterate)}</code>
                  </li>
                ))}
              </ol>

              <output className="fixed-point-current" aria-live="polite">
                <span>{copy.iteration.currentStateLabel}</span>
                <code>
                  {formatSet(phase.system, currentState ?? [])}
                </code>
              </output>

              {currentStep === undefined ? null : (
                <div className="fixed-point-step-detail">
                  <span>{copy.iteration.activationsLabel}</span>
                  <ul>
                    {currentStep.activations.map((activation) => (
                      <li key={activation.ruleId}>
                        <code>
                          {activation.premises.length === 0
                            ? "∅"
                            : formatSet(phase.system, activation.premises)}
                          {" ⇒ "}
                          {tokenLabel(phase.system, activation.conclusion)}
                        </code>
                        <small>
                          {requireRuleCopy(activation.ruleId).label}
                        </small>
                      </li>
                    ))}
                  </ul>
                  <span>{copy.iteration.newTokensLabel}</span>
                  <code>
                    {currentStep.newTokens.length === 0
                      ? copy.iteration.nothingNew
                      : formatSet(phase.system, currentStep.newTokens)}
                  </code>
                </div>
              )}

              <p className="fixed-point-bound-note">
                {copy.iteration.boundNote(
                  phase.system.approximation.kind === "bounded"
                    ? phase.system.approximation.bound
                    : "∞",
                )}
              </p>

              <div className="fixed-point-controls">
                <span className="fixed-point-progress">
                  {copy.iteration.progress(applied, totalApplications)}
                </span>
                <fieldset aria-label={copy.iteration.chainLabel}>
                  <button
                    type="button"
                    disabled={applied === 0}
                    onClick={stepBack}
                  >
                    ← {copy.iteration.stepBackAction}
                  </button>
                  <button
                    ref={applyButtonRef}
                    type="button"
                    disabled={applied >= totalApplications}
                    onClick={applyMap}
                  >
                    {copy.iteration.applyAction} →
                  </button>
                </fieldset>
                {isStabilized && stage.kind === "naturals" ? (
                  <button
                    className="primary-action"
                    type="button"
                    onClick={continueToStreams}
                  >
                    {copy.iteration.continueStreamsAction}
                  </button>
                ) : null}
                {isStabilized && stage.kind === "streams" ? (
                  <button
                    className="primary-action"
                    type="button"
                    onClick={continueToChallenge}
                  >
                    {copy.iteration.continueChallengeAction}
                  </button>
                ) : null}
              </div>
            </>
          ) : null}

          {stage.kind === "challenge" ? (
            <div className="fixed-point-challenge">
              <fieldset>
                <legend>{copy.challenge.choiceLegend}</legend>
                <div>
                  {challengeChoiceIds.map((tokenId) => (
                    <button
                      key={tokenId}
                      type="button"
                      aria-label={copy.challenge.chooseToken(
                        requireTokenCopy(tokenId).accessibleName,
                      )}
                      aria-pressed={challengeStage?.answer === tokenId}
                      onClick={() => chooseChallengeToken(tokenId)}
                    >
                      <strong>
                        {tokenLabel(streamPrefixesSystem, tokenId)}
                      </strong>
                      <small>{requireTokenCopy(tokenId).description}</small>
                    </button>
                  ))}
                </div>
              </fieldset>
              {challengeStage?.answer === undefined ? null : (
                <output
                  className={`fixed-point-challenge-feedback${
                    challengeIsCorrect ? " is-correct" : " is-incorrect"
                  }`}
                  aria-live="polite"
                >
                  <span aria-hidden="true">
                    {challengeIsCorrect ? "✓" : "×"}
                  </span>
                  <span>
                    <strong>
                      {challengeIsCorrect
                        ? copy.challenge.correctHeading
                        : copy.challenge.incorrectHeading}
                    </strong>
                    <span>
                      {challengeIsCorrect
                        ? copy.challenge.correctExplanation
                        : copy.challenge.incorrectExplanation(
                            tokenLabel(
                              streamPrefixesSystem,
                              challengeStage.answer,
                            ),
                          )}
                    </span>
                  </span>
                </output>
              )}
              {challengeIsCorrect ? (
                <button
                  className="primary-action"
                  type="button"
                  onClick={finishChallenge}
                >
                  {copy.challenge.finishAction}
                </button>
              ) : null}
            </div>
          ) : null}

          {stage.kind === "complete" ? (
            <div className="fixed-point-counterpoint">
              <h3>{copy.counterpoint.heading}</h3>
              <p>{copy.counterpoint.explanation}</p>
              <code>{copy.counterpoint.formal}</code>
              <button
                className="secondary-action"
                type="button"
                onClick={replay}
              >
                {copy.actions.replay}
              </button>
            </div>
          ) : null}

          <code className="fixed-point-formal-step">{formalStep}</code>
        </section>
      </fieldset>

      <div className="fixed-point-actions">
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
