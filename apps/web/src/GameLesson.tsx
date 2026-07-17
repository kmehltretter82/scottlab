import { iterateFromBottom, type TokenId } from "@scottlab/core";
import {
  retrogradeAnalysisMapping,
  takeAwayGameSystem,
} from "@scottlab/examples";
import { useEffect, useRef, type Ref } from "react";

import "./fixed-point-lesson.css";
import "./game-lesson.css";

export interface GameLessonTokenCopy {
  readonly label: string;
  readonly accessibleName: string;
  readonly description: string;
}

export interface GameLessonRuleCopy {
  readonly label: string;
  readonly explanation: string;
}

export interface GameLessonSeeAlsoEntry {
  readonly name: string;
  readonly note: string;
}

export interface GameLessonCopy {
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
  readonly tokens: Readonly<Record<string, GameLessonTokenCopy>>;
  readonly rules: Readonly<Record<string, GameLessonRuleCopy>>;
  readonly intro: {
    readonly heading: string;
    readonly explanation: string;
    readonly rulesExplanation: string;
    readonly startAction: string;
  };
  readonly analysis: {
    readonly heading: string;
    readonly introduction: string;
    readonly chainLabel: string;
    readonly iterateName: (index: number) => string;
    readonly bottomIterateName: string;
    readonly currentStateLabel: string;
    readonly progress: (applied: number, total: number) => string;
    readonly applyAction: string;
    readonly stepBackAction: string;
    readonly startHeading: string;
    readonly startExplanation: string;
    readonly appliedHeading: (newTokens: string) => string;
    readonly appliedExplanation: (before: string, after: string) => string;
    readonly stabilizedHeading: string;
    readonly stabilizedExplanation: (state: string) => string;
    readonly silenceNote: string;
    readonly activationsLabel: string;
    readonly newTokensLabel: string;
    readonly nothingNew: string;
    readonly continueChallengeAction: string;
  };
  readonly challenge: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly explanation: string;
    readonly choiceLegend: string;
    readonly takeOne: string;
    readonly takeTwo: string;
    readonly chooseMove: (move: string) => string;
    readonly correctHeading: string;
    readonly correctExplanation: string;
    readonly incorrectHeading: string;
    readonly incorrectExplanation: string;
    readonly finishAction: string;
  };
  readonly seeAlso: {
    readonly heading: string;
    readonly introduction: string;
    readonly entries: readonly GameLessonSeeAlsoEntry[];
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

export type GameLessonMove = "take-1" | "take-2";

export type GameLessonStage =
  | { readonly kind: "intro" }
  | { readonly kind: "analysis"; readonly applied: number }
  | { readonly kind: "challenge"; readonly answer?: GameLessonMove }
  | { readonly kind: "complete" };

export interface GameLessonProgress {
  readonly stage: GameLessonStage;
}

export const initialGameLessonProgress: GameLessonProgress = {
  stage: { kind: "intro" },
};

const analysisComputation = iterateFromBottom(
  takeAwayGameSystem,
  retrogradeAnalysisMapping,
);

if (
  analysisComputation.stabilizedAfter !== 4 ||
  analysisComputation.fixedPoint.includes("win-3") ||
  !analysisComputation.fixedPoint.includes("loss-3")
) {
  throw new Error(
    "The game lesson requires the documented take-away-game analysis.",
  );
}

/** The number of applications the analysis can show, for validation. */
export const gameAnalysisApplicationCount = analysisComputation.steps.length;

const correctMove: GameLessonMove = "take-1";

export interface GameLessonProps {
  readonly copy: GameLessonCopy;
  readonly headingRef: Ref<HTMLHeadingElement>;
  readonly progress: GameLessonProgress;
  readonly onProgressChange: (progress: GameLessonProgress) => void;
  readonly onBack: () => void;
  readonly onOpenSandbox: () => void;
}

export function GameLesson({
  copy,
  headingRef,
  progress,
  onProgressChange,
  onBack,
  onOpenSandbox,
}: GameLessonProps) {
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);
  const { stage } = progress;

  const focusTarget =
    stage.kind === "analysis"
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

  function requireTokenCopy(tokenId: TokenId): GameLessonTokenCopy {
    const tokenCopy = copy.tokens[tokenId];
    if (tokenCopy === undefined) {
      throw new Error(`Missing game lesson copy for token '${tokenId}'.`);
    }
    return tokenCopy;
  }

  function requireRuleCopy(ruleId: string): GameLessonRuleCopy {
    const ruleCopy = copy.rules[ruleId];
    if (ruleCopy === undefined) {
      throw new Error(`Missing game lesson copy for rule '${ruleId}'.`);
    }
    return ruleCopy;
  }

  function tokenLabel(tokenId: TokenId): string {
    const token = takeAwayGameSystem.tokens.find(({ id }) => id === tokenId);
    if (token === undefined) {
      throw new Error(
        `The take-away game does not define token '${tokenId}'.`,
      );
    }
    return token.symbol ?? requireTokenCopy(tokenId).label;
  }

  function formatSet(tokenIds: readonly TokenId[]): string {
    const tokenSet = new Set(tokenIds);
    return `{${takeAwayGameSystem.tokens
      .filter(({ id }) => tokenSet.has(id))
      .map(({ id }) => tokenLabel(id))
      .join(", ")}}`;
  }

  const applied = stage.kind === "analysis" ? stage.applied : 0;
  const stabilizedAfter = analysisComputation.stabilizedAfter;
  const isStabilized = stage.kind === "analysis" && applied > stabilizedAfter;
  const reachedIterateIndex = Math.min(applied, stabilizedAfter);
  const currentState = analysisComputation.iterates[reachedIterateIndex];
  const currentStep =
    applied === 0 ? undefined : analysisComputation.steps[applied - 1];
  const totalApplications = analysisComputation.steps.length;

  const challengeStage = stage.kind === "challenge" ? stage : undefined;
  const challengeIsCorrect = challengeStage?.answer === correctMove;

  let stageHeading = copy.intro.heading;
  let stageExplanation = copy.intro.explanation;

  if (stage.kind === "analysis") {
    const stateLabel = formatSet(currentState ?? []);
    if (applied === 0) {
      stageHeading = copy.analysis.startHeading;
      stageExplanation = copy.analysis.startExplanation;
    } else if (isStabilized) {
      stageHeading = copy.analysis.stabilizedHeading;
      stageExplanation = copy.analysis.stabilizedExplanation(stateLabel);
    } else if (currentStep !== undefined) {
      stageHeading = copy.analysis.appliedHeading(
        formatSet(currentStep.newTokens),
      );
      stageExplanation = copy.analysis.appliedExplanation(
        formatSet(currentStep.before),
        formatSet(currentStep.after),
      );
    }
  } else if (stage.kind === "challenge") {
    stageHeading = copy.challenge.heading;
    stageExplanation = copy.challenge.explanation;
  } else if (stage.kind === "complete") {
    stageHeading = copy.complete.heading;
    stageExplanation = copy.complete.explanation;
  }

  function startAnalysis(): void {
    onProgressChange({ stage: { kind: "analysis", applied: 0 } });
  }

  function applyMap(): void {
    if (stage.kind !== "analysis") {
      return;
    }
    if (stage.applied < totalApplications) {
      onProgressChange({
        stage: { kind: "analysis", applied: stage.applied + 1 },
      });
    }
  }

  function stepBack(): void {
    if (stage.kind !== "analysis" || stage.applied === 0) {
      return;
    }
    onProgressChange({
      stage: { kind: "analysis", applied: stage.applied - 1 },
    });
  }

  function continueToChallenge(): void {
    onProgressChange({ stage: { kind: "challenge" } });
  }

  function chooseMove(move: GameLessonMove): void {
    onProgressChange({ stage: { kind: "challenge", answer: move } });
  }

  function finishChallenge(): void {
    if (challengeIsCorrect) {
      onProgressChange({ stage: { kind: "complete" } });
    }
  }

  function replay(): void {
    onProgressChange(initialGameLessonProgress);
  }

  return (
    <main className="fixed-point-main game-main">
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
          aria-labelledby="game-stage-title"
        >
          <header className="fixed-point-stage-heading">
            <p>
              {stage.kind === "challenge"
                ? copy.challenge.eyebrow
                : copy.analysis.heading}
            </p>
            <div aria-live="polite" aria-atomic="true">
              <h2 id="game-stage-title" ref={stageHeadingRef} tabIndex={-1}>
                {stageHeading}
              </h2>
              <p>{stageExplanation}</p>
            </div>
          </header>

          {stage.kind === "intro" ? (
            <div className="fixed-point-intro-panels">
              <p>{copy.intro.rulesExplanation}</p>
              <div className="fixed-point-map-rules">
                {retrogradeAnalysisMapping.rules.map((rule) => (
                  <code key={rule.id}>
                    {rule.premises.length === 0
                      ? "∅"
                      : formatSet(rule.premises)}
                    {" ⇒ "}
                    {tokenLabel(rule.conclusion)}
                  </code>
                ))}
              </div>
              <button
                className="primary-action"
                type="button"
                onClick={startAnalysis}
              >
                <span>{copy.intro.startAction}</span>
                <span className="button-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          ) : null}

          {stage.kind === "analysis" ? (
            <>
              <p className="fixed-point-phase-introduction">
                {copy.analysis.introduction}
              </p>

              <ol
                className="fixed-point-chain"
                aria-label={copy.analysis.chainLabel}
              >
                {analysisComputation.iterates.map((iterate, index) => (
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
                        ? copy.analysis.bottomIterateName
                        : copy.analysis.iterateName(index)}
                    </span>
                    <code>{formatSet(iterate)}</code>
                  </li>
                ))}
              </ol>

              <output className="fixed-point-current" aria-live="polite">
                <span>{copy.analysis.currentStateLabel}</span>
                <code>{formatSet(currentState ?? [])}</code>
              </output>

              {currentStep === undefined ? null : (
                <div className="fixed-point-step-detail">
                  <span>{copy.analysis.activationsLabel}</span>
                  <ul>
                    {currentStep.activations.map((activation) => (
                      <li key={activation.ruleId}>
                        <code>
                          {activation.premises.length === 0
                            ? "∅"
                            : formatSet(activation.premises)}
                          {" ⇒ "}
                          {tokenLabel(activation.conclusion)}
                        </code>
                        <small>
                          {requireRuleCopy(activation.ruleId).label}
                        </small>
                      </li>
                    ))}
                  </ul>
                  <span>{copy.analysis.newTokensLabel}</span>
                  <code>
                    {currentStep.newTokens.length === 0
                      ? copy.analysis.nothingNew
                      : formatSet(currentStep.newTokens)}
                  </code>
                </div>
              )}

              {isStabilized ? (
                <p className="fixed-point-bound-note">
                  {copy.analysis.silenceNote}
                </p>
              ) : null}

              <div className="fixed-point-controls">
                <span className="fixed-point-progress">
                  {copy.analysis.progress(applied, totalApplications)}
                </span>
                <fieldset aria-label={copy.analysis.chainLabel}>
                  <button
                    type="button"
                    disabled={applied === 0}
                    onClick={stepBack}
                  >
                    ← {copy.analysis.stepBackAction}
                  </button>
                  <button
                    ref={applyButtonRef}
                    type="button"
                    disabled={applied >= totalApplications}
                    onClick={applyMap}
                  >
                    {copy.analysis.applyAction} →
                  </button>
                </fieldset>
                {isStabilized ? (
                  <button
                    className="primary-action"
                    type="button"
                    onClick={continueToChallenge}
                  >
                    {copy.analysis.continueChallengeAction}
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
                  {(
                    [
                      ["take-1", copy.challenge.takeOne],
                      ["take-2", copy.challenge.takeTwo],
                    ] as const
                  ).map(([move, label]) => (
                    <button
                      key={move}
                      type="button"
                      aria-label={copy.challenge.chooseMove(label)}
                      aria-pressed={challengeStage?.answer === move}
                      onClick={() => chooseMove(move)}
                    >
                      <strong>{label}</strong>
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
                        : copy.challenge.incorrectExplanation}
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
            <div className="game-see-also">
              <h3>{copy.seeAlso.heading}</h3>
              <p>{copy.seeAlso.introduction}</p>
              <dl>
                {copy.seeAlso.entries.map((entry) => (
                  <div key={entry.name}>
                    <dt>{entry.name}</dt>
                    <dd>{entry.note}</dd>
                  </div>
                ))}
              </dl>
              <button
                className="secondary-action"
                type="button"
                onClick={replay}
              >
                {copy.actions.replay}
              </button>
            </div>
          ) : null}
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
