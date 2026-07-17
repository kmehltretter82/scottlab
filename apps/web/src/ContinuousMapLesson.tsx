import {
  applyCompiledMappingSteps,
  compileMapping,
  type MappingStepsComputation,
  type TokenId,
} from "@scottlab/core";
import {
  booleanNegationMapping,
  flatBooleanSystem,
} from "@scottlab/examples";
import { useEffect, useRef, type Ref } from "react";

import "./continuous-map-lesson.css";

export interface ContinuousMapLessonTokenCopy {
  readonly label: string;
  readonly accessibleName: string;
  readonly description: string;
}

export interface ContinuousMapLessonRuleCopy {
  readonly label: string;
  readonly explanation: string;
}

export interface ContinuousMapLessonCopy {
  readonly pageTitle: string;
  readonly markerLabel: string;
  readonly markerName: string;
  readonly footerSystem: string;
  readonly footerStage: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly workspaceLabel: string;
  readonly tokens: Readonly<Record<string, ContinuousMapLessonTokenCopy>>;
  readonly rules: Readonly<Record<string, ContinuousMapLessonRuleCopy>>;
  readonly canvas: {
    readonly heading: string;
    readonly introduction: string;
    readonly inputCopyLabel: string;
    readonly outputCopyLabel: string;
    readonly systemName: string;
    readonly mappingName: string;
    readonly stateLabel: string;
    readonly bottomBadge: string;
    readonly informativeBadge: string;
    readonly dormantRule: string;
    readonly pendingRule: string;
    readonly activeRule: string;
    readonly appliedRule: string;
    readonly diagramLabel: (
      inputState: string,
      outputState: string,
      ruleStatus: string,
    ) => string;
  };
  readonly experiment: {
    readonly heading: string;
    readonly introduction: string;
    readonly inputStateLabel: string;
    readonly outputStateLabel: string;
    readonly navigationLabel: string;
    readonly guideProgress: (current: number, total: number) => string;
    readonly challengeProgress: (current: number, total: number) => string;
  };
  readonly challenge: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly introduction: string;
    readonly choiceLegend: string;
    readonly chooseInput: (token: string) => string;
    readonly correctBadge: string;
    readonly incorrectBadge: string;
  };
  readonly definition: {
    readonly heading: string;
    readonly introduction: string;
    readonly sourceStatesHeading: string;
    readonly targetStatesHeading: string;
    readonly generatorsHeading: string;
    readonly orderHeading: string;
    readonly orderExplanation: string;
    readonly incomparabilityHeading: string;
    readonly incomparabilityExplanation: string;
    readonly continuityHeading: string;
    readonly continuityExplanation: string;
  };
  readonly explanation: {
    readonly heading: string;
    readonly introduction: string;
    readonly bottomHeading: string;
    readonly bottomExplanation: (state: string) => string;
    readonly challengeReadyHeading: string;
    readonly challengeReadyExplanation: string;
    readonly premiseHeading: (token: string) => string;
    readonly premiseExplanation: (token: string, state: string) => string;
    readonly ruleHeading: (rule: string) => string;
    readonly ruleExplanation: (
      rule: string,
      inputState: string,
      conclusion: string,
    ) => string;
    readonly outputHeading: (state: string) => string;
    readonly outputExplanation: (token: string, state: string) => string;
    readonly incorrectHeading: string;
    readonly incorrectExplanation: (
      input: string,
      output: string,
      expectedInput: string,
    ) => string;
    readonly completeHeading: string;
    readonly completeExplanation: (
      inputState: string,
      outputState: string,
    ) => string;
    readonly structuredSummary: string;
    readonly structuredHeading: string;
    readonly structuredInput: (state: string) => string;
    readonly structuredDeltaStep: (
      step: number,
      token: string,
      state: string,
    ) => string;
    readonly structuredMappingStep: (
      step: number,
      sourceSupport: string,
      rule: string,
      conclusion: string,
      state: string,
    ) => string;
    readonly structuredEntailmentStep: (
      step: number,
      premises: string,
      conclusion: string,
      state: string,
    ) => string;
    readonly structuredResult: (state: string) => string;
  };
  readonly actions: {
    readonly startGuide: string;
    readonly previous: string;
    readonly next: string;
    readonly skipGuide: string;
    readonly showResult: string;
    readonly beginChallenge: string;
    readonly finishChallenge: string;
    readonly replay: string;
    readonly back: string;
    readonly openSandbox: string;
  };
}

export type ContinuousMapLessonInput = "false" | "true";

export type ContinuousMapLessonStage =
  | { readonly kind: "bottom" }
  | { readonly kind: "guide"; readonly frameIndex: number }
  | {
      readonly kind: "challenge";
      readonly frameIndex: number;
      readonly input?: ContinuousMapLessonInput;
    }
  | { readonly kind: "complete" };

export interface ContinuousMapLessonProgress {
  readonly stage: ContinuousMapLessonStage;
}

export const initialContinuousMapLessonProgress: ContinuousMapLessonProgress = {
  stage: { kind: "bottom" },
};

export interface ContinuousMapLessonProps {
  readonly copy: ContinuousMapLessonCopy;
  readonly headingRef: Ref<HTMLHeadingElement>;
  readonly progress: ContinuousMapLessonProgress;
  readonly onProgressChange: (progress: ContinuousMapLessonProgress) => void;
  readonly onBack: () => void;
  readonly onOpenSandbox: () => void;
}

type NarrativeFrameKind = "premise" | "mappingRule" | "output";

const narrativeFrames: readonly NarrativeFrameKind[] = [
  "premise",
  "mappingRule",
  "output",
];

/** The number of narrative frames, for progress validation. */
export const continuousMapFrameCount = narrativeFrames.length;
const guideInput: ContinuousMapLessonInput = "true";
const challengeInput: ContinuousMapLessonInput = "false";
const informativeInputs: readonly ContinuousMapLessonInput[] = [
  "false",
  "true",
];
const compiledBooleanNegation = compileMapping(
  flatBooleanSystem,
  flatBooleanSystem,
  booleanNegationMapping,
);

function compute(input?: ContinuousMapLessonInput): MappingStepsComputation {
  return applyCompiledMappingSteps(
    compiledBooleanNegation,
    input === undefined
      ? [flatBooleanSystem.delta]
      : [flatBooleanSystem.delta, input],
  );
}

const bottomComputation = compute();
const guideComputation = compute(guideInput);
const challengeComputation = compute(challengeInput);
const alternateComputation = compute("true");

function hasExactly(
  values: readonly TokenId[],
  expected: readonly TokenId[],
): boolean {
  return (
    values.length === expected.length &&
    expected.every((value) => values.includes(value))
  );
}

if (
  booleanNegationMapping.approximation.kind !== "exact" ||
  !hasExactly(bottomComputation.targetState, [flatBooleanSystem.delta]) ||
  !hasExactly(guideComputation.targetState, [flatBooleanSystem.delta, "false"]) ||
  !hasExactly(challengeComputation.targetState, [
    flatBooleanSystem.delta,
    "true",
  ])
) {
  throw new Error(
    "The continuous-maps lesson requires the exact flat-Boolean negation fixture.",
  );
}

function computationForInput(
  input?: ContinuousMapLessonInput,
): MappingStepsComputation {
  if (input === "false") {
    return challengeComputation;
  }
  if (input === "true") {
    return alternateComputation;
  }
  return bottomComputation;
}

function stageFrameIndex(stage: ContinuousMapLessonStage): number | undefined {
  if (stage.kind === "guide") {
    return stage.frameIndex;
  }
  if (stage.kind === "challenge") {
    return stage.input === undefined ? undefined : stage.frameIndex;
  }
  return stage.kind === "complete" ? narrativeFrames.length - 1 : undefined;
}

export function ContinuousMapLesson({
  copy,
  headingRef,
  progress,
  onProgressChange,
  onBack,
  onOpenSandbox,
}: ContinuousMapLessonProps) {
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const challengeHeadingRef = useRef<HTMLHeadingElement>(null);
  const narrationHeadingRef = useRef<HTMLHeadingElement>(null);
  const { stage } = progress;
  const stageInput =
    stage.kind === "guide"
      ? guideInput
      : stage.kind === "challenge"
        ? stage.input
        : stage.kind === "complete"
          ? challengeInput
          : undefined;
  const computation =
    stage.kind === "guide"
      ? guideComputation
      : computationForInput(stageInput);
  const frameIndex = stageFrameIndex(stage);
  const frame = frameIndex === undefined ? undefined : narrativeFrames[frameIndex];
  const outputIsRevealed = frame === "output";
  const displayedTargetState = outputIsRevealed
    ? computation.targetState
    : bottomComputation.targetState;
  const activation = computation.activations[0];
  const challengeIsCorrect = stageInput === challengeInput;
  const challengeShowsIncorrectResult =
    stage.kind === "challenge" &&
    stage.input !== undefined &&
    frame === "output" &&
    !challengeIsCorrect;

  // Refocus only when the interaction context changes, never on plain
  // frame navigation: stepping with "Previous"/"Next" must keep the focus
  // on the button the learner is operating.
  const focusTarget =
    stage.kind === "challenge" && stage.input === undefined
      ? "challenge"
      : stage.kind === "complete" || challengeShowsIncorrectResult
        ? "narration"
        : stage.kind === "guide" ||
            (stage.kind === "challenge" && stage.input !== undefined)
          ? "next"
          : "none";

  useEffect(() => {
    if (focusTarget === "challenge") {
      challengeHeadingRef.current?.focus();
    } else if (focusTarget === "narration") {
      narrationHeadingRef.current?.focus();
    } else if (focusTarget === "next") {
      nextButtonRef.current?.focus();
    }
  }, [focusTarget]);

  function requireTokenCopy(tokenId: TokenId): ContinuousMapLessonTokenCopy {
    const tokenCopy = copy.tokens[tokenId];
    if (tokenCopy === undefined) {
      throw new Error(
        `Missing continuous-maps lesson copy for token '${tokenId}'.`,
      );
    }
    return tokenCopy;
  }

  function tokenLabel(tokenId: TokenId): string {
    const token = flatBooleanSystem.tokens.find(({ id }) => id === tokenId);
    if (token === undefined) {
      throw new Error(`Flat Booleans does not define token '${tokenId}'.`);
    }
    return token.symbol ?? requireTokenCopy(tokenId).label;
  }

  function formatSet(tokenIds: readonly TokenId[]): string {
    const tokenSet = new Set(tokenIds);
    return `{${flatBooleanSystem.tokens
      .filter(({ id }) => tokenSet.has(id))
      .map(({ id }) => tokenLabel(id))
      .join(", ")}}`;
  }

  function requireRuleCopy(ruleId: string): ContinuousMapLessonRuleCopy {
    const ruleCopy = copy.rules[ruleId];
    if (ruleCopy === undefined) {
      throw new Error(
        `Missing continuous-maps lesson copy for rule '${ruleId}'.`,
      );
    }
    return ruleCopy;
  }

  const inputStateLabel = formatSet(computation.sourceState);
  const outputStateLabel = formatSet(displayedTargetState);
  const finalTargetStateLabel = formatSet(computation.targetState);
  const activeRuleCopy =
    activation === undefined ? undefined : requireRuleCopy(activation.ruleId);
  const activeConclusionLabel =
    activation === undefined ? undefined : tokenLabel(activation.conclusion);
  const ruleStatus =
    activation === undefined
      ? copy.canvas.dormantRule
      : frame === "mappingRule"
        ? copy.canvas.activeRule
        : outputIsRevealed
          ? copy.canvas.appliedRule
          : copy.canvas.pendingRule;
  const inputIsBottom = stageInput === undefined;
  const outputIsBottom = hasExactly(
    displayedTargetState,
    bottomComputation.targetState,
  );

  let narrativeHeading = copy.explanation.bottomHeading;
  let narrativeExplanation = copy.explanation.bottomExplanation(
    formatSet(bottomComputation.targetState),
  );
  let formalStep = `${copy.canvas.mappingName}(${formatSet(
    bottomComputation.sourceState,
  )}) = ${formatSet(bottomComputation.targetState)}`;

  if (stage.kind === "challenge" && stage.input === undefined) {
    narrativeHeading = copy.explanation.challengeReadyHeading;
    narrativeExplanation = copy.explanation.challengeReadyExplanation;
  } else if (stage.kind === "complete") {
    narrativeHeading = copy.explanation.completeHeading;
    narrativeExplanation = copy.explanation.completeExplanation(
      inputStateLabel,
      finalTargetStateLabel,
    );
    formalStep = `${copy.canvas.mappingName}(${inputStateLabel}) = ${finalTargetStateLabel}`;
  } else if (
    frame !== undefined &&
    stageInput !== undefined &&
    activation !== undefined &&
    activeRuleCopy !== undefined &&
    activeConclusionLabel !== undefined
  ) {
    const inputTokenLabel = tokenLabel(stageInput);
    const sourceSupport = formatSet(activation.premises);
    if (frame === "premise") {
      narrativeHeading = copy.explanation.premiseHeading(inputTokenLabel);
      narrativeExplanation = copy.explanation.premiseExplanation(
        inputTokenLabel,
        inputStateLabel,
      );
      formalStep = `${inputTokenLabel} ∈ ${inputStateLabel}`;
    } else if (frame === "mappingRule") {
      narrativeHeading = copy.explanation.ruleHeading(activeRuleCopy.label);
      narrativeExplanation = copy.explanation.ruleExplanation(
        activeRuleCopy.label,
        sourceSupport,
        activeConclusionLabel,
      );
      formalStep = `(${sourceSupport}, ${activeConclusionLabel}) ∈ ${copy.canvas.mappingName}`;
    } else {
      narrativeHeading = challengeShowsIncorrectResult
        ? copy.explanation.incorrectHeading
        : copy.explanation.outputHeading(finalTargetStateLabel);
      narrativeExplanation = challengeShowsIncorrectResult
        ? copy.explanation.incorrectExplanation(
            inputTokenLabel,
            activeConclusionLabel,
            tokenLabel(challengeInput),
          )
        : copy.explanation.outputExplanation(
            activeConclusionLabel,
            finalTargetStateLabel,
          );
      formalStep = `${copy.canvas.mappingName}(${inputStateLabel}) = ${finalTargetStateLabel}`;
    }
  }

  function startGuide(): void {
    onProgressChange({ stage: { kind: "guide", frameIndex: 0 } });
  }

  function showPrevious(): void {
    if (
      (stage.kind !== "guide" && stage.kind !== "challenge") ||
      stage.frameIndex === 0
    ) {
      return;
    }
    onProgressChange({
      stage: { ...stage, frameIndex: stage.frameIndex - 1 },
    });
  }

  function showNext(): void {
    if (stage.kind === "guide") {
      if (stage.frameIndex === narrativeFrames.length - 1) {
        onProgressChange({
          stage: { kind: "challenge", frameIndex: 0 },
        });
      } else {
        onProgressChange({
          stage: { kind: "guide", frameIndex: stage.frameIndex + 1 },
        });
      }
      return;
    }

    if (stage.kind !== "challenge" || stage.input === undefined) {
      return;
    }
    if (stage.frameIndex < narrativeFrames.length - 1) {
      onProgressChange({
        stage: { ...stage, frameIndex: stage.frameIndex + 1 },
      });
    } else if (stage.input === challengeInput) {
      onProgressChange({ stage: { kind: "complete" } });
    }
  }

  function skipGuide(): void {
    onProgressChange({ stage: { kind: "challenge", frameIndex: 0 } });
  }

  function chooseChallengeInput(input: ContinuousMapLessonInput): void {
    onProgressChange({
      stage: { kind: "challenge", frameIndex: 0, input },
    });
  }

  function showResult(): void {
    if (stage.kind !== "challenge" || stage.input === undefined) {
      return;
    }
    // This control unmounts on the final frame, so hand the focus to the
    // persistent "Next frame" button instead of letting it fall to the body.
    nextButtonRef.current?.focus();
    onProgressChange({
      stage: {
        ...stage,
        frameIndex: narrativeFrames.length - 1,
      },
    });
  }

  function replay(): void {
    onProgressChange(initialContinuousMapLessonProgress);
  }

  function structuredTraceItems(
    result: MappingStepsComputation,
  ): readonly string[] {
    return [
      copy.explanation.structuredInput(formatSet(result.sourceState)),
      ...result.steps.map((step) => {
        if (step.reason.kind === "targetDistinguishedToken") {
          return copy.explanation.structuredDeltaStep(
            step.index + 1,
            tokenLabel(step.conclusion),
            formatSet(step.after),
          );
        }
        if (step.reason.kind === "mappingRule") {
          return copy.explanation.structuredMappingStep(
            step.index + 1,
            formatSet(step.premises),
            requireRuleCopy(step.reason.ruleId).label,
            tokenLabel(step.conclusion),
            formatSet(step.after),
          );
        }
        return copy.explanation.structuredEntailmentStep(
          step.index + 1,
          formatSet(step.premises),
          tokenLabel(step.conclusion),
          formatSet(step.after),
        );
      }),
      copy.explanation.structuredResult(formatSet(result.targetState)),
    ];
  }

  const challengeVisible =
    stage.kind === "challenge" || stage.kind === "complete";
  const controlsVisible =
    stage.kind === "guide" ||
    (stage.kind === "challenge" && stage.input !== undefined);
  const currentFrameNumber = frameIndex === undefined ? 0 : frameIndex + 1;
  const nextDisabled =
    stage.kind === "challenge" &&
    stage.frameIndex === narrativeFrames.length - 1 &&
    stage.input !== challengeInput;

  return (
    <main className="continuous-map-main">
      <section className="continuous-map-introduction">
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
        className="continuous-map-workspace"
        aria-label={copy.workspaceLabel}
      >
        <section
          className="continuous-map-area continuous-map-canvas"
          aria-labelledby="continuous-map-canvas-title"
        >
          <header className="continuous-map-area-heading">
            <span>01</span>
            <div>
              <h2 id="continuous-map-canvas-title">{copy.canvas.heading}</h2>
              <p>{copy.canvas.introduction}</p>
            </div>
          </header>

          <figure
            className="continuous-map-diagram"
            aria-labelledby="continuous-map-diagram-caption"
          >
            <figcaption
              id="continuous-map-diagram-caption"
              className="continuous-map-visually-hidden"
            >
              {copy.canvas.diagramLabel(
                inputStateLabel,
                outputStateLabel,
                ruleStatus,
              )}
            </figcaption>
            <article
              className={`continuous-map-copy is-input${
                frame === "premise" ? " is-focused" : ""
              }`}
            >
              <header>
                <span>{copy.canvas.inputCopyLabel}</span>
                <strong>{copy.canvas.systemName}</strong>
              </header>
              <div>
                <span>{copy.canvas.stateLabel}</span>
                <code>{inputStateLabel}</code>
                <small>
                  {inputIsBottom
                    ? copy.canvas.bottomBadge
                    : copy.canvas.informativeBadge}
                </small>
              </div>
            </article>

            <div
              className={`continuous-map-arrow is-${
                frame === "mappingRule"
                  ? "active"
                  : outputIsRevealed
                    ? "applied"
                    : "pending"
              }`}
            >
              <span aria-hidden="true">→</span>
              <article>
                <span>{ruleStatus}</span>
                <strong>{copy.canvas.mappingName}</strong>
                <code>
                  {activeRuleCopy?.label ?? copy.canvas.dormantRule}
                </code>
                {activeRuleCopy === undefined ? null : (
                  <small>{activeRuleCopy.explanation}</small>
                )}
              </article>
              <span aria-hidden="true">→</span>
            </div>

            <article
              className={`continuous-map-copy is-output${
                frame === "output" ? " is-focused" : ""
              }`}
            >
              <header>
                <span>{copy.canvas.outputCopyLabel}</span>
                <strong>{copy.canvas.systemName}</strong>
              </header>
              <div>
                <span>{copy.canvas.stateLabel}</span>
                <code>{outputStateLabel}</code>
                <small>
                  {outputIsBottom
                    ? copy.canvas.bottomBadge
                    : copy.canvas.informativeBadge}
                </small>
              </div>
            </article>
          </figure>
        </section>

        <section
          className="continuous-map-area continuous-map-experiment"
          aria-labelledby="continuous-map-experiment-title"
        >
          <header className="continuous-map-area-heading">
            <span>02</span>
            <div>
              <h2 id="continuous-map-experiment-title">
                {copy.experiment.heading}
              </h2>
              <p>{copy.experiment.introduction}</p>
            </div>
          </header>

          <dl className="continuous-map-current-states">
            <div>
              <dt>{copy.experiment.inputStateLabel}</dt>
              <dd>
                <code>{inputStateLabel}</code>
              </dd>
            </div>
            <div>
              <dt>{copy.experiment.outputStateLabel}</dt>
              <dd>
                <code>{outputStateLabel}</code>
              </dd>
            </div>
          </dl>

          {challengeVisible ? (
            <div className="continuous-map-challenge">
              <p>{copy.challenge.eyebrow}</p>
              <h3 ref={challengeHeadingRef} tabIndex={-1}>
                {copy.challenge.heading}
              </h3>
              <p>{copy.challenge.introduction}</p>
              <fieldset disabled={stage.kind === "complete"}>
                <legend>{copy.challenge.choiceLegend}</legend>
                <div>
                  {informativeInputs.map((tokenId) => (
                    <button
                      key={tokenId}
                      type="button"
                      aria-label={copy.challenge.chooseInput(
                        requireTokenCopy(tokenId).accessibleName,
                      )}
                      aria-pressed={stageInput === tokenId}
                      onClick={() => chooseChallengeInput(tokenId)}
                    >
                      <span>{tokenLabel(tokenId)}</span>
                      <code>
                        {formatSet([flatBooleanSystem.delta, tokenId])}
                      </code>
                    </button>
                  ))}
                </div>
              </fieldset>
              {frame === "output" && stage.kind === "challenge" ? (
                <span
                  className={`continuous-map-challenge-badge is-${
                    challengeIsCorrect ? "correct" : "incorrect"
                  }`}
                >
                  {challengeIsCorrect
                    ? copy.challenge.correctBadge
                    : copy.challenge.incorrectBadge}
                </span>
              ) : null}
            </div>
          ) : null}

          {stage.kind === "bottom" ? (
            <button
              className="primary-action continuous-map-start"
              type="button"
              onClick={startGuide}
            >
              {copy.actions.startGuide}
              <span className="button-arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          ) : null}

          {controlsVisible ? (
            <div className="continuous-map-controls">
              <span className="continuous-map-progress">
                {stage.kind === "guide"
                  ? copy.experiment.guideProgress(
                      currentFrameNumber,
                      narrativeFrames.length,
                    )
                  : copy.experiment.challengeProgress(
                      currentFrameNumber,
                      narrativeFrames.length,
                    )}
              </span>
              <fieldset aria-label={copy.experiment.navigationLabel}>
                <button
                  type="button"
                  disabled={frameIndex === 0}
                  onClick={showPrevious}
                >
                  ← {copy.actions.previous}
                </button>
                <button
                  ref={nextButtonRef}
                  type="button"
                  disabled={nextDisabled}
                  onClick={showNext}
                >
                  {stage.kind === "guide" &&
                  frameIndex === narrativeFrames.length - 1
                    ? copy.actions.beginChallenge
                    : stage.kind === "challenge" &&
                        frameIndex === narrativeFrames.length - 1
                      ? copy.actions.finishChallenge
                      : copy.actions.next} →
                </button>
              </fieldset>
              {frameIndex !== narrativeFrames.length - 1 ? (
                <button
                  className="secondary-action"
                  type="button"
                  onClick={stage.kind === "guide" ? skipGuide : showResult}
                >
                  {stage.kind === "guide"
                    ? copy.actions.skipGuide
                    : copy.actions.showResult}
                </button>
              ) : null}
              <button
                className="secondary-action"
                type="button"
                onClick={replay}
              >
                {copy.actions.replay}
              </button>
            </div>
          ) : null}

          {stage.kind === "challenge" && stage.input === undefined ? (
            <button
              className="secondary-action continuous-map-replay"
              type="button"
              onClick={replay}
            >
              {copy.actions.replay}
            </button>
          ) : null}

          {stage.kind === "complete" ? (
            <button
              className="secondary-action continuous-map-replay"
              type="button"
              onClick={replay}
            >
              {copy.actions.replay}
            </button>
          ) : null}
        </section>

        <section
          className="continuous-map-area continuous-map-definition"
          aria-labelledby="continuous-map-definition-title"
        >
          <header className="continuous-map-area-heading">
            <span>03</span>
            <div>
              <h2 id="continuous-map-definition-title">
                {copy.definition.heading}
              </h2>
              <p>{copy.definition.introduction}</p>
            </div>
          </header>

          <div className="continuous-map-definition-grid">
            <section>
              <h3>{copy.definition.sourceStatesHeading}</h3>
              <code>
                {formatSet(bottomComputation.sourceState)}, {formatSet(
                  challengeComputation.sourceState,
                )}, {formatSet(guideComputation.sourceState)}
              </code>
            </section>
            <section>
              <h3>{copy.definition.targetStatesHeading}</h3>
              <code>
                {formatSet(bottomComputation.targetState)}, {formatSet(
                  guideComputation.targetState,
                )}, {formatSet(challengeComputation.targetState)}
              </code>
            </section>
            <section className="is-wide">
              <h3>{copy.definition.generatorsHeading}</h3>
              <ul>
                {booleanNegationMapping.rules.map((rule) => (
                  <li key={rule.id}>
                    <code>
                      {formatSet(rule.premises)} ⇒ {tokenLabel(rule.conclusion)}
                    </code>
                    <span>{requireRuleCopy(rule.id).label}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3>{copy.definition.orderHeading}</h3>
              <code>u ⊑ v ⇔ u ⊆ v</code>
              <p>{copy.definition.orderExplanation}</p>
            </section>
            <section>
              <h3>{copy.definition.incomparabilityHeading}</h3>
              <code>
                {formatSet(challengeComputation.sourceState)} ⊈ {formatSet(
                  guideComputation.sourceState,
                )} ∧ {formatSet(guideComputation.sourceState)} ⊈ {formatSet(
                  challengeComputation.sourceState,
                )}
              </code>
              <p>{copy.definition.incomparabilityExplanation}</p>
            </section>
            <section className="is-wide is-continuity">
              <h3>{copy.definition.continuityHeading}</h3>
              <code>
                u ⊆ v ⇒ {copy.canvas.mappingName}(u) ⊆{" "}
                {copy.canvas.mappingName}(v)
              </code>
              <p>{copy.definition.continuityExplanation}</p>
            </section>
          </div>
        </section>

        <section
          className="continuous-map-area continuous-map-explanation"
          aria-labelledby="continuous-map-explanation-title"
        >
          <header className="continuous-map-area-heading">
            <span>04</span>
            <div>
              <h2 id="continuous-map-explanation-title">
                {copy.explanation.heading}
              </h2>
              <p>{copy.explanation.introduction}</p>
            </div>
          </header>

          <output
            className="continuous-map-narration"
            aria-live="polite"
            aria-atomic="true"
          >
            <h3
              id="continuous-map-narration-heading"
              ref={narrationHeadingRef}
              tabIndex={-1}
            >
              {narrativeHeading}
            </h3>
            <span className="continuous-map-narration-copy">
              {narrativeExplanation}
            </span>
            <code>{formalStep}</code>
          </output>

          <details className="continuous-map-structured-trace">
            <summary>{copy.explanation.structuredSummary}</summary>
            <h3>{copy.explanation.structuredHeading}</h3>
            <ol>
              {structuredTraceItems(computation).map((item, index) => (
                <li key={`${index}-${item}`}>{item}</li>
              ))}
            </ol>
          </details>
        </section>
      </fieldset>

      <div className="continuous-map-actions">
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
