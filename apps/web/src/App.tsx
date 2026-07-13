import {
  computeBottom,
  computeClosure,
  computeCoverRelation,
  type ClosureComputation,
  type ObservationAttempt,
  type TokenDefinition,
  type TokenId,
  tryAddObservation,
} from "@scottlab/core";
import { flatBooleanSystem } from "@scottlab/examples";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import {
  isSupportedLanguage,
  languageStorageKey,
  messages,
  supportedLanguages,
  type Language,
  type LessonMessages,
  type TokenText,
} from "./i18n";

const bottom = computeBottom(flatBooleanSystem);
const informationOrder = computeCoverRelation(flatBooleanSystem);
const enumeratedStates = informationOrder.states;
const scottHomepageUrl = "https://www.cs.cmu.edu/~scott/";
const scottPaperUrl = "https://doi.org/10.1007/BFb0012801";
const informativeTokens = flatBooleanSystem.tokens.filter(
  ({ id }) => id !== flatBooleanSystem.delta,
);

interface InformedLessonState {
  readonly selectedTokenId: TokenId;
  readonly closure: ClosureComputation;
}

type RejectedObservation = Extract<ObservationAttempt, { readonly ok: false }>;

interface RejectedLessonState extends InformedLessonState {
  readonly attemptedTokenId: TokenId;
  readonly rejection: RejectedObservation;
}

interface ChallengeContext extends RejectedLessonState {
  readonly targetTokenId: TokenId;
}

type LessonState =
  | { readonly step: "intro" }
  | { readonly step: "example" }
  | { readonly step: "bottom" }
  | { readonly step: "inside" }
  | { readonly step: "choose" }
  | ({ readonly step: "informed" } & InformedLessonState)
  | ({ readonly step: "conflict" } & RejectedLessonState)
  | ({
      readonly step: "order";
      readonly inspectedState: readonly TokenId[];
      readonly completedChallengeTokenId?: TokenId;
    } & RejectedLessonState)
  | ({ readonly step: "challenge" } & ChallengeContext)
  | ({
      readonly step: "challengeAttempt";
      readonly challengeTokenId: TokenId;
      readonly challengeClosure: ClosureComputation;
    } & ChallengeContext);

interface TokenCardProps {
  readonly token: TokenDefinition;
  readonly text: TokenText;
  readonly roleLabel: string;
  readonly informative?: boolean;
}

function initialLanguage(): Language {
  try {
    const storedLanguage = window.localStorage.getItem(languageStorageKey);
    if (isSupportedLanguage(storedLanguage)) {
      return storedLanguage;
    }
  } catch {
    // Local storage may be unavailable; the language switcher still works.
  }

  return window.navigator.language.toLowerCase().startsWith("de")
    ? "de-DE"
    : "en-GB";
}

function requireToken(tokenId: TokenId): TokenDefinition {
  const token = flatBooleanSystem.tokens.find(({ id }) => id === tokenId);
  if (token === undefined) {
    throw new Error(`Flat Booleans does not define token '${tokenId}'.`);
  }
  return token;
}

function beginnerVisibleTokenIds(tokenIds: readonly TokenId[]): TokenId[] {
  return tokenIds.filter((tokenId) => tokenId !== flatBooleanSystem.delta);
}

function hasInformation(
  state: LessonState,
): state is Extract<
  LessonState,
  { readonly step: "informed" | "conflict" | "order" }
> {
  return (
    state.step === "informed" ||
    state.step === "conflict" ||
    state.step === "order"
  );
}

function stateKey(tokenIds: readonly TokenId[]): string {
  return tokenIds.join("\0");
}

function tokenText(copy: LessonMessages, token: TokenDefinition): TokenText {
  return (
    copy.tokens[token.id] ?? {
      label: token.label,
      accessibleName: token.label,
      description: token.description,
    }
  );
}

function formatTokenSet(
  copy: LessonMessages,
  tokenIds: readonly TokenId[],
): string {
  const labels = tokenIds.map((tokenId) => {
    const token = requireToken(tokenId);
    return token.symbol ?? tokenText(copy, token).label;
  });
  return labels.length === 0 ? "∅" : `{${labels.join(", ")}}`;
}

function TokenCard({
  token,
  text,
  roleLabel,
  informative = false,
}: TokenCardProps) {
  const symbol = token.symbol;

  return (
    <li
      className={`token-card${symbol === undefined ? "" : " has-symbol"}${informative ? " is-informative" : ""}`}
      aria-label={
        symbol === undefined
          ? text.accessibleName
          : `${text.accessibleName}, ${symbol}`
      }
    >
      <span className="token-role">{roleLabel}</span>
      <span className="token-label">{text.label}</span>
      {symbol === undefined ? null : (
        <span className="token-symbol" aria-hidden="true">
          {symbol}
        </span>
      )}
    </li>
  );
}

interface PositionedOrderState {
  readonly coreState: readonly TokenId[];
  readonly key: string;
  readonly visibleTokenIds: readonly TokenId[];
  readonly x: number;
  readonly y: number;
}

interface InformationOrderDiagramProps {
  readonly copy: LessonMessages;
  readonly inspectedState: readonly TokenId[];
  readonly onInspect: (state: readonly TokenId[]) => void;
}

function positionOrderStates(): readonly PositionedOrderState[] {
  const statesByRank = new Map<number, (readonly TokenId[])[]>();

  for (const coreState of informationOrder.states) {
    const visibleTokenIds = beginnerVisibleTokenIds(coreState);
    const rankStates = statesByRank.get(visibleTokenIds.length) ?? [];
    rankStates.push(coreState);
    statesByRank.set(visibleTokenIds.length, rankStates);
  }

  const ranks = [...statesByRank.keys()].sort((left, right) => left - right);
  return ranks.flatMap((rank, rankIndex) => {
    const states = statesByRank.get(rank) ?? [];
    const y =
      ranks.length === 1
        ? 50
        : 82 - (rankIndex / (ranks.length - 1)) * 64;

    return states.map((coreState, stateIndex) => ({
      coreState,
      key: stateKey(coreState),
      visibleTokenIds: beginnerVisibleTokenIds(coreState),
      x: ((stateIndex + 0.5) / states.length) * 100,
      y,
    }));
  });
}

const positionedOrderStates = positionOrderStates();

function InformationOrderDiagram({
  copy,
  inspectedState,
  onInspect,
}: InformationOrderDiagramProps) {
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const inspectedKey = stateKey(inspectedState);
  const positionByKey = new Map(
    positionedOrderStates.map((state) => [state.key, state]),
  );
  const inspectedVisibleTokenIds = beginnerVisibleTokenIds(inspectedState);
  const inspectedLabel = formatTokenSet(copy, inspectedVisibleTokenIds);
  const inspectedDisplayLabel =
    inspectedVisibleTokenIds.length === 0
      ? `⊥ · ${inspectedLabel}`
      : inspectedLabel;
  const inspectedDetail =
    inspectedVisibleTokenIds.length === 0
      ? copy.informationOrder.bottomDetail
      : copy.informationOrder.informedDetail(inspectedLabel);

  function orderStateLabel(state: PositionedOrderState): string {
    return state.visibleTokenIds.length === 0
      ? "⊥ (∅)"
      : formatTokenSet(copy, state.visibleTokenIds);
  }

  function orderStateSummary(state: PositionedOrderState): string {
    if (state.visibleTokenIds.length === 0) {
      return copy.informationOrder.bottomSummary;
    }

    const tokenId = state.visibleTokenIds[0];
    const tokenLabel =
      tokenId === undefined
        ? ""
        : tokenText(copy, requireToken(tokenId)).label;
    return copy.informationOrder.informedSummary(
      formatTokenSet(copy, state.visibleTokenIds),
      tokenLabel,
    );
  }

  function focusState(targetState: readonly TokenId[] | undefined): void {
    if (targetState === undefined) {
      return;
    }
    nodeRefs.current.get(stateKey(targetState))?.focus();
  }

  function handleNodeKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentState: PositionedOrderState,
  ): void {
    const currentRank = currentState.visibleTokenIds.length;
    const sameRank = positionedOrderStates.filter(
      ({ visibleTokenIds }) => visibleTokenIds.length === currentRank,
    );
    const rankIndex = sameRank.findIndex(({ key }) => key === currentState.key);
    let targetState: readonly TokenId[] | undefined;

    if (event.key === "ArrowUp") {
      targetState = informationOrder.edges.find(
        ({ lower }) => stateKey(lower) === currentState.key,
      )?.upper;
    } else if (event.key === "ArrowDown") {
      targetState = informationOrder.edges.find(
        ({ upper }) => stateKey(upper) === currentState.key,
      )?.lower;
    } else if (event.key === "ArrowLeft" && rankIndex > 0) {
      targetState = sameRank[rankIndex - 1]?.coreState;
    } else if (event.key === "ArrowRight" && rankIndex < sameRank.length - 1) {
      targetState = sameRank[rankIndex + 1]?.coreState;
    }

    if (targetState !== undefined) {
      event.preventDefault();
      focusState(targetState);
    }
  }

  return (
    <section
      className="information-order"
      aria-label={copy.informationOrder.diagramLabel}
    >
      <div className="order-plot">
        <svg
          className="order-lines"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="information-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
          {informationOrder.edges.map((edge) => {
            const lower = positionByKey.get(stateKey(edge.lower));
            const upper = positionByKey.get(stateKey(edge.upper));
            return lower === undefined || upper === undefined ? null : (
              <line
                key={`${lower.key}-${upper.key}`}
                x1={lower.x}
                y1={lower.y - 12}
                x2={upper.x}
                y2={upper.y + 12}
                markerEnd="url(#information-arrow)"
              />
            );
          })}
        </svg>

        <div className="order-direction" aria-hidden="true">
          <span>↑</span>
          <span>{copy.informationOrder.moreInformation}</span>
        </div>

        {positionedOrderStates.map((state) => {
          const isBottom = state.visibleTokenIds.length === 0;
          const label = orderStateLabel(state);
          const summary = orderStateSummary(state);
          return (
            <button
              key={state.key}
              ref={(node) => {
                if (node === null) {
                  nodeRefs.current.delete(state.key);
                } else {
                  nodeRefs.current.set(state.key, node);
                }
              }}
              className={`order-node${isBottom ? " is-bottom" : ""}`}
              style={{ left: `${state.x}%`, top: `${state.y}%` }}
              type="button"
              aria-label={copy.informationOrder.stateButton(summary)}
              aria-pressed={state.key === inspectedKey}
              onClick={() => onInspect(state.coreState)}
              onKeyDown={(event) => handleNodeKeyDown(event, state)}
            >
              <span className="order-node-label">{isBottom ? "⊥" : label}</span>
              {isBottom ? (
                <span className="order-node-detail">
                  ∅ · {copy.noObservations}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="order-inspection" aria-live="polite">
        <span>{copy.informationOrder.selectedState}</span>
        <strong>{inspectedDisplayLabel}</strong>
        <p>{inspectedDetail}</p>
      </div>

      <details className="order-text-view">
        <summary>{copy.informationOrder.textViewSummary}</summary>
        <div className="order-text-columns">
          <section>
            <h2>{copy.informationOrder.statesHeading}</h2>
            <ul>
              {positionedOrderStates.map((state) => (
                <li key={state.key}>{orderStateSummary(state)}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2>{copy.informationOrder.edgesHeading}</h2>
            <ul>
              {informationOrder.edges.map((edge) => {
                const lower = positionByKey.get(stateKey(edge.lower));
                const upper = positionByKey.get(stateKey(edge.upper));
                if (lower === undefined || upper === undefined) {
                  return null;
                }
                return (
                  <li key={`${lower.key}-${upper.key}`}>
                    {copy.informationOrder.edgeDescription(
                      orderStateLabel(lower),
                      orderStateLabel(upper),
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </details>
    </section>
  );
}

export function App() {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [lessonState, setLessonState] = useState<LessonState>({
    step: "intro",
  });
  const insideActionRef = useRef<HTMLButtonElement>(null);
  const firstChoiceRef = useRef<HTMLButtonElement>(null);
  const exampleHeadingRef = useRef<HTMLHeadingElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const copy = messages[language];
  const isIntroduction = lessonState.step === "intro";
  const isExampleIntroduction = lessonState.step === "example";
  const isOpen =
    lessonState.step !== "intro" &&
    lessonState.step !== "example" &&
    lessonState.step !== "bottom";
  const informedState = hasInformation(lessonState) ? lessonState : undefined;
  const conflictState =
    lessonState.step === "conflict" ? lessonState : undefined;
  const orderState = lessonState.step === "order" ? lessonState : undefined;
  const challengeState =
    lessonState.step === "challenge" ? lessonState : undefined;
  const challengeAttemptState =
    lessonState.step === "challengeAttempt" ? lessonState : undefined;
  const challengeContext = challengeState ?? challengeAttemptState;
  const selectedToken =
    informedState === undefined
      ? undefined
      : requireToken(informedState.selectedTokenId);
  const challengeToken =
    challengeAttemptState === undefined
      ? undefined
      : requireToken(challengeAttemptState.challengeTokenId);
  const displayedToken = challengeToken ?? selectedToken;
  const targetToken =
    challengeContext === undefined
      ? undefined
      : requireToken(challengeContext.targetTokenId);
  const completedChallengeToken =
    orderState?.completedChallengeTokenId === undefined
      ? undefined
      : requireToken(orderState.completedChallengeTokenId);
  const attemptedToken =
    conflictState === undefined
      ? undefined
      : requireToken(conflictState.attemptedTokenId);
  const oppositeToken =
    selectedToken === undefined
      ? undefined
      : informativeTokens.find(({ id }) => id !== selectedToken.id);
  const displayedClosure =
    challengeAttemptState?.challengeClosure ?? informedState?.closure;
  const stateTokens =
    displayedClosure === undefined
      ? beginnerVisibleTokenIds(isOpen ? bottom.state : []).map(requireToken)
      : beginnerVisibleTokenIds(displayedClosure.state).map(requireToken);
  const witnessTokens =
    conflictState === undefined
      ? []
      : conflictState.rejection.event.witness.map(requireToken);
  const selectedTokenText =
    selectedToken === undefined ? undefined : tokenText(copy, selectedToken);
  const displayedTokenText =
    displayedToken === undefined ? undefined : tokenText(copy, displayedToken);
  const targetTokenText =
    targetToken === undefined ? undefined : tokenText(copy, targetToken);
  const completedChallengeTokenText =
    completedChallengeToken === undefined
      ? undefined
      : tokenText(copy, completedChallengeToken);
  const attemptedTokenText =
    attemptedToken === undefined ? undefined : tokenText(copy, attemptedToken);
  const stateLabel = formatTokenSet(
    copy,
    stateTokens.map(({ id }) => id),
  );
  const targetStateLabel =
    targetToken === undefined ? "" : formatTokenSet(copy, [targetToken.id]);
  const previousChallengeStateLabel =
    challengeContext === undefined
      ? ""
      : formatTokenSet(copy, [challengeContext.selectedTokenId]);
  const targetMeaning =
    targetToken === undefined
      ? ""
      : copy.challenge.tokenMeaning[targetToken.id] ??
        targetTokenText?.label ??
        "";
  const challengeTokenMeaning =
    challengeToken === undefined
      ? ""
      : copy.challenge.tokenMeaning[challengeToken.id] ??
        displayedTokenText?.label ??
        "";
  const completedChallengeStateLabel =
    completedChallengeToken === undefined
      ? ""
      : formatTokenSet(copy, [completedChallengeToken.id]);
  const modelTokenSet = formatTokenSet(
    copy,
    beginnerVisibleTokenIds(flatBooleanSystem.tokens.map(({ id }) => id)),
  );
  const modelRule = flatBooleanSystem.minimalInconsistentSets
    .map((tokenIds) => formatTokenSet(copy, tokenIds))
    .join("; ");
  const modelStates = enumeratedStates
    .map((tokenIds) =>
      formatTokenSet(copy, beginnerVisibleTokenIds(tokenIds)),
    )
    .join("  ");

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = isIntroduction
      ? copy.introduction.pageTitle
      : isExampleIntroduction
        ? copy.exampleIntroduction.pageTitle
        : copy.pageTitle;
    document
      .querySelector<HTMLMetaElement>('meta[name="description"]')
      ?.setAttribute("content", copy.pageDescription);

    try {
      window.localStorage.setItem(languageStorageKey, language);
    } catch {
      // The selected language remains active for the current page.
    }
  }, [copy, isExampleIntroduction, isIntroduction, language]);

  useEffect(() => {
    if (lessonState.step === "example") {
      exampleHeadingRef.current?.focus();
    }
    if (lessonState.step === "bottom") {
      resultHeadingRef.current?.focus();
    }
    if (lessonState.step === "inside") {
      insideActionRef.current?.focus();
    }
    if (lessonState.step === "choose") {
      firstChoiceRef.current?.focus();
    }
    if (
      lessonState.step === "informed" ||
      lessonState.step === "conflict" ||
      lessonState.step === "order" ||
      lessonState.step === "challenge" ||
      lessonState.step === "challengeAttempt"
    ) {
      resultHeadingRef.current?.focus();
    }
  }, [lessonState.step]);

  function selectObservation(tokenId: TokenId): void {
    const closure = computeClosure(flatBooleanSystem, [tokenId]);
    setLessonState({ step: "informed", selectedTokenId: tokenId, closure });
  }

  function attemptOppositeObservation(): void {
    if (
      informedState === undefined ||
      selectedToken === undefined ||
      oppositeToken === undefined
    ) {
      throw new Error("An informative Boolean state must have an opposite token.");
    }

    const result = tryAddObservation(
      flatBooleanSystem,
      informedState.closure.state,
      oppositeToken.id,
    );
    if (result.ok) {
      setLessonState({
        step: "informed",
        selectedTokenId: oppositeToken.id,
        closure: result.closure,
      });
      return;
    }

    setLessonState({
      step: "conflict",
      selectedTokenId: selectedToken.id,
      attemptedTokenId: oppositeToken.id,
      closure: informedState.closure,
      rejection: result,
    });
  }

  function showInformationOrder(): void {
    if (conflictState === undefined) {
      throw new Error("The information order follows the conflict step.");
    }

    setLessonState({
      step: "order",
      selectedTokenId: conflictState.selectedTokenId,
      attemptedTokenId: conflictState.attemptedTokenId,
      closure: conflictState.closure,
      rejection: conflictState.rejection,
      inspectedState: conflictState.closure.state,
    });
  }

  function inspectOrderState(state: readonly TokenId[]): void {
    if (orderState === undefined) {
      throw new Error("A state can be inspected only in the information order.");
    }
    setLessonState({ ...orderState, inspectedState: state });
  }

  function returnToConflict(): void {
    if (orderState === undefined) {
      throw new Error("The conflict view requires an information-order state.");
    }
    setLessonState({
      step: "conflict",
      selectedTokenId: orderState.selectedTokenId,
      attemptedTokenId: orderState.attemptedTokenId,
      closure: orderState.closure,
      rejection: orderState.rejection,
    });
  }

  function startChallenge(): void {
    if (orderState === undefined) {
      throw new Error("The challenge follows the information order.");
    }
    const target = informativeTokens.find(
      ({ id }) => id !== orderState.selectedTokenId,
    );
    if (target === undefined) {
      throw new Error("The Boolean challenge requires an opposite token.");
    }

    setLessonState({
      step: "challenge",
      selectedTokenId: orderState.selectedTokenId,
      attemptedTokenId: orderState.attemptedTokenId,
      closure: orderState.closure,
      rejection: orderState.rejection,
      targetTokenId: target.id,
    });
  }

  function attemptChallenge(tokenId: TokenId): void {
    if (challengeState === undefined) {
      throw new Error(
        "A challenge token can be chosen only during the challenge.",
      );
    }
    const closure = computeClosure(flatBooleanSystem, [tokenId]);

    if (tokenId === challengeState.targetTokenId) {
      setLessonState({
        step: "order",
        selectedTokenId: challengeState.selectedTokenId,
        attemptedTokenId: challengeState.attemptedTokenId,
        closure: challengeState.closure,
        rejection: challengeState.rejection,
        inspectedState: closure.state,
        completedChallengeTokenId: tokenId,
      });
      return;
    }

    setLessonState({
      step: "challengeAttempt",
      selectedTokenId: challengeState.selectedTokenId,
      attemptedTokenId: challengeState.attemptedTokenId,
      closure: challengeState.closure,
      rejection: challengeState.rejection,
      targetTokenId: challengeState.targetTokenId,
      challengeTokenId: tokenId,
      challengeClosure: closure,
    });
  }

  function retryChallenge(): void {
    if (challengeAttemptState === undefined) {
      throw new Error("Only an incorrect challenge attempt can be retried.");
    }
    setLessonState({
      step: "challenge",
      selectedTokenId: challengeAttemptState.selectedTokenId,
      attemptedTokenId: challengeAttemptState.attemptedTokenId,
      closure: challengeAttemptState.closure,
      rejection: challengeAttemptState.rejection,
      targetTokenId: challengeAttemptState.targetTokenId,
    });
  }

  function returnToInformationOrder(): void {
    if (challengeContext === undefined) {
      throw new Error("The challenge must begin from the information order.");
    }
    setLessonState({
      step: "order",
      selectedTokenId: challengeContext.selectedTokenId,
      attemptedTokenId: challengeContext.attemptedTokenId,
      closure: challengeContext.closure,
      rejection: challengeContext.rejection,
      inspectedState: challengeContext.closure.state,
    });
  }

  const stateDescription =
    displayedToken === undefined
      ? isOpen
        ? copy.stateDescriptions.bottomOpen
        : copy.stateDescriptions.bottomClosed
      : copy.stateDescriptions.informed(displayedTokenText?.label ?? "");

  function currentLessonHeading(): string {
    switch (lessonState.step) {
      case "intro":
      case "example":
        return "";
      case "bottom":
        return copy.headings.bottom;
      case "inside":
        return copy.headings.inside;
      case "choose":
        return copy.headings.choose;
      case "informed":
        return copy.headings.informed(selectedTokenText?.label ?? "");
      case "conflict":
        return copy.headings.conflict;
      case "order":
        return completedChallengeToken === undefined
          ? copy.headings.order
          : copy.challenge.successHeading;
      case "challenge":
        return copy.challenge.heading(targetMeaning);
      case "challengeAttempt":
        return copy.challenge.incorrectHeading(stateLabel);
    }
  }

  function currentLessonExplanation(): string {
    switch (lessonState.step) {
      case "intro":
      case "example":
        return "";
      case "bottom":
        return copy.explanations.bottom;
      case "inside":
        return copy.explanations.inside;
      case "choose":
        return copy.explanations.choose;
      case "informed":
        return copy.explanations.informed(
          selectedTokenText?.label ?? "",
          stateLabel,
        );
      case "conflict":
        return copy.explanations.conflict;
      case "order":
        return completedChallengeToken === undefined
          ? copy.explanations.order
          : copy.challenge.successExplanation(
              completedChallengeTokenText?.label ?? "",
              completedChallengeStateLabel,
            );
      case "challenge":
        return copy.challenge.explanation(
          previousChallengeStateLabel,
          targetStateLabel,
        );
      case "challengeAttempt":
        return copy.challenge.incorrectExplanation(
          challengeTokenMeaning,
          targetMeaning,
        );
    }
  }

  const lessonHeading = currentLessonHeading();
  const lessonExplanation = currentLessonExplanation();
  const lessonFooterStage =
    challengeContext !== undefined
      ? copy.challenge.footerStage
      : orderState?.completedChallengeTokenId !== undefined
        ? copy.challenge.completeFooterStage
        : orderState !== undefined
          ? copy.informationOrder.footerStage
          : copy.footerStage;

  const lessonCopy = (
    <div className="lesson-copy" aria-live="polite">
      <h1 id="lesson-title" ref={resultHeadingRef} tabIndex={-1}>
        {lessonHeading}
      </h1>
      <p>{lessonExplanation}</p>
    </div>
  );

  const showsModelTokens =
    lessonState.step !== "bottom" && lessonState.step !== "inside";
  const showsModelRule =
    hasInformation(lessonState) || challengeContext !== undefined;
  const showsModelStates =
    lessonState.step === "conflict" ||
    lessonState.step === "order" ||
    challengeContext !== undefined;
  const modelDefinition = (
    <aside
      className="model-definition"
      aria-labelledby="model-definition-title"
    >
      <h2 id="model-definition-title">{copy.modelDefinition.title}</h2>
      <dl>
        <div className="model-fact">
          <dt>{copy.modelDefinition.subjectLabel}</dt>
          <dd>{copy.modelDefinition.subject}</dd>
        </div>

        {showsModelTokens ? (
          <div className="model-fact">
            <dt>{copy.modelDefinition.tokensLabel}</dt>
            <dd>
              <code>{modelTokenSet}</code>
            </dd>
          </div>
        ) : null}

        {showsModelRule ? (
          <div className="model-fact">
            <dt>{copy.modelDefinition.ruleLabel}</dt>
            <dd>
              <code>{copy.modelDefinition.rule(modelRule)}</code>
            </dd>
          </div>
        ) : null}

        {showsModelStates ? (
          <div className="model-fact">
            <dt>{copy.modelDefinition.statesLabel}</dt>
            <dd>
              <code>{modelStates}</code>
            </dd>
          </div>
        ) : null}
      </dl>
    </aside>
  );

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand" aria-label="ScottLab">
          <span className="brand-mark" aria-hidden="true">
            ⊥
          </span>
          <span>ScottLab</span>
        </div>

        <div className="header-controls">
          <fieldset className="language-switcher">
            <legend className="visually-hidden">
              {copy.languageSelectorLabel}
            </legend>
            {supportedLanguages.map((option) => (
              <button
                key={option.id}
                className="language-option"
                type="button"
                aria-label={copy.selectLanguage(option.label)}
                aria-pressed={language === option.id}
                onClick={() => setLanguage(option.id)}
              >
                <span className="language-flag" aria-hidden="true">
                  {option.flag}
                </span>
                <span>{option.label}</span>
              </button>
            ))}
          </fieldset>

          <div
            className="lesson-marker"
            aria-label={
              isIntroduction
                ? copy.introduction.markerLabel
                : isExampleIntroduction
                  ? copy.exampleIntroduction.markerLabel
                  : copy.lessonMarkerLabel
            }
          >
            <span className="lesson-number">
              {isIntroduction || isExampleIntroduction ? "00" : "01"}
            </span>
            <span className="lesson-name">
              {isIntroduction
                ? copy.introduction.markerName
                : isExampleIntroduction
                  ? copy.exampleIntroduction.markerName
                  : copy.lessonName}
            </span>
          </div>
        </div>
      </header>

      {isIntroduction ? (
        <main className="introduction-main">
          <section
            className="introduction-panel"
            aria-labelledby="introduction-title"
          >
            <div className="introduction-heading">
              <p className="eyebrow">
                <span className="eyebrow-dot" aria-hidden="true" />
                {copy.introduction.eyebrow}
              </p>
              <h1 id="introduction-title">{copy.introduction.title}</h1>
            </div>

            <div className="introduction-content">
              <p className="introduction-lead">{copy.introduction.lead}</p>
              <p className="introduction-history">
                {copy.introduction.history}
              </p>
              <p className="introduction-purpose">
                {copy.introduction.purpose}
              </p>

              <button
                className="primary-action introduction-action"
                type="button"
                onClick={() => setLessonState({ step: "example" })}
              >
                <span>{copy.introduction.startAction}</span>
                <span className="button-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>

              <nav
                className="introduction-sources"
                aria-label={copy.introduction.sourcesLabel}
              >
                <a href={scottHomepageUrl} target="_blank" rel="noreferrer">
                  {copy.introduction.scottLink}
                  <span aria-hidden="true">↗</span>
                </a>
                <a href={scottPaperUrl} target="_blank" rel="noreferrer">
                  {copy.introduction.paperLink}
                  <span aria-hidden="true">↗</span>
                </a>
              </nav>
            </div>
          </section>
        </main>
      ) : isExampleIntroduction ? (
        <main className="example-main">
          <section
            className="example-panel"
            aria-labelledby="example-introduction-title"
          >
            <div className="example-heading">
              <h1
                id="example-introduction-title"
                ref={exampleHeadingRef}
                tabIndex={-1}
              >
                {copy.exampleIntroduction.title}
              </h1>
              <p className="example-invitation">
                {copy.exampleIntroduction.invitation}
              </p>
            </div>

            <article
              className="boolean-example"
              aria-labelledby="boolean-example-question"
            >
              <p>{copy.exampleIntroduction.questionLabel}</p>
              <h2 id="boolean-example-question">
                {copy.exampleIntroduction.question}
              </h2>
              <div className="boolean-answers">
                <div className="boolean-answer is-true">
                  <code>true</code>
                  <span>{copy.exampleIntroduction.trueMeaning}</span>
                </div>
                <div className="boolean-answer is-false">
                  <code>false</code>
                  <span>{copy.exampleIntroduction.falseMeaning}</span>
                </div>
              </div>
            </article>

            <div className="example-details">
              <p className="example-definition">
                {copy.exampleIntroduction.definition}
              </p>
              <p className="example-rationale">
                {copy.exampleIntroduction.rationale}
              </p>
            </div>
            <p className="example-bottom-explanation">
              {copy.exampleIntroduction.bottomExplanation}
            </p>

            <div className="example-actions">
              <button
                className="primary-action"
                type="button"
                onClick={() => setLessonState({ step: "bottom" })}
              >
                <span>{copy.exampleIntroduction.startAction}</span>
                <span className="button-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
              <button
                className="secondary-action"
                type="button"
                onClick={() => setLessonState({ step: "intro" })}
              >
                {copy.exampleIntroduction.backAction}
              </button>
            </div>
          </section>
        </main>
      ) : (
      <main className="lesson-main">
        <section className="lesson-panel" aria-labelledby="lesson-title">
          <div className="lesson-workspace">
            <div className="lesson-visual">
              {orderState === undefined ? (
                <div className="state-space">
                  <div
                    className={`state-scene${
                      conflictState === undefined ? "" : " has-conflict"
                    }`}
                  >
                    <figure
                      id="current-state"
                      className={`state-vessel${isOpen ? " is-open" : ""}${
                        displayedToken === undefined
                          ? ""
                          : " has-information"
                      }`}
                      aria-label={stateDescription}
                    >
                      <div className="bottom-identity" aria-hidden="true">
                        <span
                          className={`bottom-symbol${
                            displayedToken === undefined ? "" : " is-word"
                          }`}
                        >
                          {displayedToken === undefined ? "⊥" : copy.stateNoun}
                        </span>
                        <span className="state-kind">
                          {displayedToken === undefined
                            ? copy.stateNoun
                            : stateLabel}
                        </span>
                      </div>

                      {isOpen && stateTokens.length === 0 ? (
                        <div
                          className="empty-observations"
                          aria-label={copy.emptyStateLabel}
                        >
                          <span
                            className="empty-set-symbol"
                            aria-hidden="true"
                          >
                            ∅
                          </span>
                          <span>{copy.noObservations}</span>
                        </div>
                      ) : null}

                      {isOpen && stateTokens.length > 0 ? (
                        <ul
                          className="state-tokens"
                          aria-label={copy.tokensInState}
                        >
                          {stateTokens.map((token) => (
                            <TokenCard
                              key={token.id}
                              token={token}
                              text={tokenText(copy, token)}
                              roleLabel={copy.tokenRole}
                              informative
                            />
                          ))}
                        </ul>
                      ) : null}
                    </figure>

                    {attemptedToken === undefined ? null : (
                      <>
                        <div
                          className="conflict-connector"
                          aria-hidden="true"
                        >
                          <span>×</span>
                        </div>
                        <aside
                          className="rejected-token"
                          aria-label={copy.rejectedToken(
                            attemptedTokenText?.label ?? "",
                          )}
                        >
                          <span className="rejected-role">
                            {copy.rejectedRole}
                          </span>
                          <strong>{attemptedTokenText?.label}</strong>
                          <span className="rejected-detail">
                            {copy.rejectedDetail}
                          </span>
                        </aside>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <InformationOrderDiagram
                  copy={copy}
                  inspectedState={orderState.inspectedState}
                  onInspect={inspectOrderState}
                />
              )}
            </div>

            {modelDefinition}

            <div className="lesson-guidance">
              {lessonCopy}

          {conflictState === undefined ? null : (
            <aside
              className="conflict-witness"
              aria-label={copy.conflictWitness(
                witnessTokens
                  .map((token) => tokenText(copy, token).label)
                  .join(copy.tokenSeparator),
              )}
            >
              <span className="witness-title">{copy.conflictTitle}</span>
              <span className="witness-tokens">
                {witnessTokens.map((token, index) => (
                  <span className="witness-item" key={token.id}>
                    {index === 0 ? null : (
                      <span className="witness-cross" aria-hidden="true">
                        ×
                      </span>
                    )}
                    <code>{tokenText(copy, token).label}</code>
                  </span>
                ))}
              </span>
            </aside>
          )}

          {challengeContext === undefined ? null : (
            <aside
              className="challenge-target"
              aria-label={`${copy.challenge.targetLabel}: ${targetStateLabel}`}
            >
              <span>{copy.challenge.targetLabel}</span>
              <code>{targetStateLabel}</code>
            </aside>
          )}

          {challengeState === undefined ? null : (
            <fieldset className="token-choice-fieldset challenge-choices">
              <legend className="visually-hidden">
                {copy.challenge.choiceLegend}
              </legend>
              <div className="token-choices">
                {informativeTokens.map((token) => (
                  <button
                    key={token.id}
                    className="token-choice"
                    type="button"
                    aria-label={copy.addToken(tokenText(copy, token).label)}
                    onClick={() => attemptChallenge(token.id)}
                  >
                    <span className="choice-role">{copy.tokenChoiceRole}</span>
                    <span className="choice-label">
                      {tokenText(copy, token).label}
                    </span>
                    <span className="choice-meaning">
                      {tokenText(copy, token).description}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {lessonState.step === "choose" ? (
            <fieldset className="token-choice-fieldset">
              <legend className="visually-hidden">
                {copy.chooseObservation}
              </legend>
              <div className="token-choices">
                {informativeTokens.map((token, index) => (
                  <button
                    key={token.id}
                    ref={index === 0 ? firstChoiceRef : undefined}
                    className="token-choice"
                    type="button"
                    aria-label={copy.addToken(tokenText(copy, token).label)}
                    onClick={() => selectObservation(token.id)}
                  >
                    <span className="choice-role">{copy.tokenChoiceRole}</span>
                    <span className="choice-label">
                      {tokenText(copy, token).label}
                    </span>
                    <span className="choice-meaning">
                      {tokenText(copy, token).description}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {lessonState.step === "informed" && oppositeToken !== undefined ? (
            <fieldset className="opposite-question">
              <legend className="visually-hidden">{copy.oppositeQuestion}</legend>
              <p className="opposite-prompt">{copy.oppositeQuestion}</p>
              <button
                className="token-choice opposite-choice"
                type="button"
                aria-label={copy.tryAddingToken(
                  tokenText(copy, oppositeToken).label,
                )}
                onClick={attemptOppositeObservation}
              >
                <span className="choice-role">{copy.tryTokenRole}</span>
                <span className="choice-label">
                  {tokenText(copy, oppositeToken).label}
                </span>
              </button>
            </fieldset>
          ) : null}

          <div className="lesson-actions">
            {lessonState.step === "bottom" ? (
              <button
                className="primary-action"
                type="button"
                aria-controls="current-state"
                aria-expanded="false"
                onClick={() => setLessonState({ step: "inside" })}
              >
                <span>{copy.actions.lookInside}</span>
                <span className="button-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
            ) : null}

            {lessonState.step === "inside" ? (
              <>
                <button
                  ref={insideActionRef}
                  className="primary-action"
                  type="button"
                  aria-controls="current-state"
                  aria-expanded="true"
                  onClick={() => setLessonState({ step: "choose" })}
                >
                  <span>{copy.actions.addInformation}</span>
                  <span className="button-arrow" aria-hidden="true">
                    ↗
                  </span>
                </button>
                <button
                  className="secondary-action"
                  type="button"
                  onClick={() => setLessonState({ step: "bottom" })}
                >
                  {copy.actions.closeState}
                </button>
              </>
            ) : null}

            {lessonState.step === "choose" ? (
              <button
                className="secondary-action"
                type="button"
                onClick={() => setLessonState({ step: "inside" })}
              >
                {copy.actions.back}
              </button>
            ) : null}

            {lessonState.step === "informed" ? (
              <button
                className="secondary-action"
                type="button"
                onClick={() => setLessonState({ step: "choose" })}
              >
                {copy.actions.chooseAnother}
              </button>
            ) : null}

            {lessonState.step === "conflict" ? (
              <>
                <button
                  className="primary-action"
                  type="button"
                  onClick={showInformationOrder}
                >
                  <span>{copy.actions.showOrder}</span>
                  <span className="button-arrow" aria-hidden="true">
                    ↑
                  </span>
                </button>
                <button
                  className="secondary-action"
                  type="button"
                  onClick={() => setLessonState({ step: "choose" })}
                >
                  {copy.actions.tryOtherPath}
                </button>
                <button
                  className="secondary-action"
                  type="button"
                  onClick={() => setLessonState({ step: "bottom" })}
                >
                  {copy.actions.startOver}
                </button>
              </>
            ) : null}

            {lessonState.step === "order" ? (
              <>
                {lessonState.completedChallengeTokenId === undefined ? (
                  <>
                    <button
                      className="primary-action"
                      type="button"
                      onClick={startChallenge}
                    >
                      <span>{copy.actions.startChallenge}</span>
                      <span className="button-arrow" aria-hidden="true">
                        ↗
                      </span>
                    </button>
                    <button
                      className="secondary-action"
                      type="button"
                      onClick={returnToConflict}
                    >
                      {copy.actions.backToConflict}
                    </button>
                  </>
                ) : null}
                <button
                  className="secondary-action"
                  type="button"
                  onClick={() => setLessonState({ step: "bottom" })}
                >
                  {copy.actions.startOver}
                </button>
              </>
            ) : null}

            {lessonState.step === "challenge" ? (
              <button
                className="secondary-action"
                type="button"
                onClick={returnToInformationOrder}
              >
                {copy.actions.backToOrder}
              </button>
            ) : null}

            {lessonState.step === "challengeAttempt" ? (
              <>
                <button
                  className="primary-action"
                  type="button"
                  onClick={retryChallenge}
                >
                  <span>{copy.actions.retryChallenge}</span>
                  <span className="button-arrow" aria-hidden="true">
                    ↙
                  </span>
                </button>
                <button
                  className="secondary-action"
                  type="button"
                  onClick={returnToInformationOrder}
                >
                  {copy.actions.backToOrder}
                </button>
              </>
            ) : null}
          </div>
            </div>
          </div>
        </section>
      </main>
      )}

      <footer className="lesson-footer">
        <div className="footer-context">
          <span>{copy.footerSystem}</span>
          <span className="footer-rule" aria-hidden="true" />
          <span>
            {isIntroduction
              ? copy.introduction.footerStage
              : isExampleIntroduction
                ? copy.exampleIntroduction.footerStage
                : lessonFooterStage}
          </span>
        </div>
        <a
          className="repository-link"
          href={import.meta.env.VITE_REPOSITORY_URL}
        >
          <span>{copy.repositoryLink}</span>
          <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </div>
  );
}
