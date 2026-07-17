import {
  computeBottom,
  computeClosure,
  computeCoverRelation,
  type TokenId,
} from "@scottlab/core";
import { flatBooleanSystem } from "@scottlab/examples";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type Ref,
} from "react";

import "./sandbox-preview.css";

export interface SandboxTokenText {
  readonly label: string;
  readonly accessibleName: string;
  readonly description: string;
}

export interface SandboxPreviewCopy {
  readonly pageTitle: string;
  readonly markerLabel: string;
  readonly markerName: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly readOnlyBadge: string;
  readonly workspaceLabel: string;
  readonly sectionNavigationLabel: string;
  readonly canvasTab: string;
  readonly trayTab: string;
  readonly definitionTab: string;
  readonly explanationTab: string;
  readonly canvasHeading: string;
  readonly canvasIntroduction: string;
  readonly diagramLabel: string;
  readonly moreInformation: string;
  readonly bottomSummary: string;
  readonly informedSummary: (state: string, token: string) => string;
  readonly inspectState: (summary: string) => string;
  readonly selectedState: string;
  readonly textViewSummary: string;
  readonly statesHeading: string;
  readonly edgesHeading: string;
  readonly edgeDescription: (lower: string, upper: string) => string;
  readonly trayHeading: string;
  readonly trayIntroduction: string;
  readonly stateChoicesLabel: string;
  readonly selectState: (state: string) => string;
  readonly formalState: string;
  readonly observationRole: string;
  readonly deltaRole: string;
  readonly definitionHeading: string;
  readonly lockedLabel: string;
  readonly editingLater: string;
  readonly tokensLabel: string;
  readonly consistencyLabel: string;
  readonly entailmentLabel: string;
  readonly consistencyRule: (set: string) => string;
  readonly entailmentRule: string;
  readonly explanationHeading: string;
  readonly plainLanguageLabel: string;
  readonly bottomExplanation: string;
  readonly informedExplanation: (token: string) => string;
  readonly traceHeading: string;
  readonly deltaTrace: string;
  readonly reflexivityTrace: (token: string) => string;
  readonly declaredRuleTrace: (ruleId: string, token: string) => string;
  readonly cutTrace: (token: string) => string;
  readonly openAction: string;
  readonly backAction: string;
  readonly restartAction: string;
  readonly footerSystem: string;
  readonly footerStage: string;
}

export interface SandboxPreviewProps {
  readonly copy: SandboxPreviewCopy;
  readonly headingRef: Ref<HTMLHeadingElement>;
  readonly initialState?: readonly TokenId[] | undefined;
  readonly onBack: () => void;
  readonly onRestart: () => void;
  /** Reports every selection so the shell can keep the share URL current. */
  readonly onSelectionChange?: (state: readonly TokenId[]) => void;
  readonly tokenTextById: Readonly<Record<string, SandboxTokenText>>;
}

interface PositionedState {
  readonly key: string;
  readonly state: readonly TokenId[];
  readonly visibleTokenIds: readonly TokenId[];
  readonly x: number;
  readonly y: number;
}

const informationOrder = computeCoverRelation(flatBooleanSystem);

function stateKey(state: readonly TokenId[]): string {
  return [...new Set(state)].sort().join("\0");
}

function visibleTokenIds(state: readonly TokenId[]): TokenId[] {
  return state.filter((tokenId) => tokenId !== flatBooleanSystem.delta);
}

function positionStates(): readonly PositionedState[] {
  const statesByRank = new Map<number, (readonly TokenId[])[]>();

  for (const state of informationOrder.states) {
    const rank = visibleTokenIds(state).length;
    const states = statesByRank.get(rank) ?? [];
    states.push(state);
    statesByRank.set(rank, states);
  }

  const ranks = [...statesByRank.keys()].sort((left, right) => left - right);
  return ranks.flatMap((rank, rankIndex) => {
    const states = statesByRank.get(rank) ?? [];
    return states.map((state, stateIndex) => ({
      key: stateKey(state),
      state,
      visibleTokenIds: visibleTokenIds(state),
      x: ((stateIndex + 0.5) / states.length) * 100,
      y:
        ranks.length === 1
          ? 50
          : 82 - (rankIndex / (ranks.length - 1)) * 64,
    }));
  });
}

const positionedStates = positionStates();
const bottomState: readonly TokenId[] = computeBottom(flatBooleanSystem).state;

export function SandboxPreview({
  copy,
  headingRef,
  initialState,
  onBack,
  onRestart,
  onSelectionChange,
  tokenTextById,
}: SandboxPreviewProps) {
  const initialKey = stateKey(initialState ?? bottomState);
  const [selectedKey, setSelectedKey] = useState(() =>
    informationOrder.states.some((state) => stateKey(state) === initialKey)
      ? initialKey
      : stateKey(bottomState),
  );

  // Browser history can change the shared selection while the sandbox stays
  // mounted; follow it whenever the requested state is real.
  useEffect(() => {
    if (
      informationOrder.states.some((state) => stateKey(state) === initialKey)
    ) {
      setSelectedKey(initialKey);
    }
  }, [initialKey]);
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const selectedState =
    informationOrder.states.find((state) => stateKey(state) === selectedKey) ??
    bottomState;
  const selectedVisibleTokenIds = visibleTokenIds(selectedState);
  const selectedInput = selectedState.filter(
    (tokenId) => tokenId !== flatBooleanSystem.delta,
  );
  const closure = computeClosure(flatBooleanSystem, selectedInput);
  const positionByKey = new Map(
    positionedStates.map((state) => [state.key, state]),
  );

  function requireTokenText(tokenId: TokenId): SandboxTokenText {
    const text = tokenTextById[tokenId];
    if (text === undefined) {
      throw new Error(`Missing sandbox copy for token '${tokenId}'.`);
    }
    return text;
  }

  function tokenLabel(tokenId: TokenId): string {
    const token = flatBooleanSystem.tokens.find(({ id }) => id === tokenId);
    if (token === undefined) {
      throw new Error(`Flat Booleans does not define token '${tokenId}'.`);
    }
    return token.symbol ?? requireTokenText(tokenId).label;
  }

  function formatSet(tokenIds: readonly TokenId[]): string {
    return tokenIds.length === 0
      ? "∅"
      : `{${tokenIds.map(tokenLabel).join(", ")}}`;
  }

  function stateLabel(state: readonly TokenId[]): string {
    const observations = visibleTokenIds(state);
    return observations.length === 0 ? `⊥ = ${formatSet(state)}` : formatSet(state);
  }

  function stateSummary(state: readonly TokenId[]): string {
    const observations = visibleTokenIds(state);
    if (observations.length === 0) {
      return copy.bottomSummary;
    }
    const tokenId = observations[0];
    return copy.informedSummary(
      formatSet(state),
      tokenId === undefined ? "" : requireTokenText(tokenId).label,
    );
  }

  function selectState(state: readonly TokenId[]): void {
    setSelectedKey(stateKey(state));
    onSelectionChange?.(state);
  }

  function focusState(state: readonly TokenId[] | undefined): void {
    if (state !== undefined) {
      nodeRefs.current.get(stateKey(state))?.focus();
    }
  }

  function showArea(id: string): void {
    const area = document.getElementById(id);
    area?.focus({ preventScroll: true });
    area?.scrollIntoView?.({ block: "start" });
  }

  function handleNodeKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    current: PositionedState,
  ): void {
    const currentRank = current.visibleTokenIds.length;
    const sameRank = positionedStates.filter(
      ({ visibleTokenIds: observations }) =>
        observations.length === currentRank,
    );
    const rankIndex = sameRank.findIndex(({ key }) => key === current.key);
    let target: readonly TokenId[] | undefined;

    if (event.key === "ArrowUp") {
      target = informationOrder.edges.find(
        ({ lower }) => stateKey(lower) === current.key,
      )?.upper;
    } else if (event.key === "ArrowDown") {
      target = informationOrder.edges.find(
        ({ upper }) => stateKey(upper) === current.key,
      )?.lower;
    } else if (event.key === "ArrowLeft" && rankIndex > 0) {
      target = sameRank[rankIndex - 1]?.state;
    } else if (event.key === "ArrowRight" && rankIndex < sameRank.length - 1) {
      target = sameRank[rankIndex + 1]?.state;
    }

    if (target !== undefined) {
      event.preventDefault();
      focusState(target);
    }
  }

  const selectedFormalState = formatSet(selectedState);
  const selectedObservationId = selectedVisibleTokenIds[0];
  const selectedPlainExplanation =
    selectedObservationId === undefined
      ? copy.bottomExplanation
      : copy.informedExplanation(
          requireTokenText(selectedObservationId).label,
        );

  return (
    <main className="sandbox-main">
      <section className="sandbox-introduction">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h1 ref={headingRef} tabIndex={-1}>
            {copy.title}
          </h1>
        </div>
        <div className="sandbox-introduction-copy">
          <p>{copy.lead}</p>
          <span className="sandbox-read-only-badge">
            <span aria-hidden="true">⌁</span>
            {copy.readOnlyBadge}
          </span>
        </div>
      </section>

      <nav
        className="sandbox-section-navigation"
        aria-label={copy.sectionNavigationLabel}
      >
        <button
          type="button"
          aria-controls="sandbox-canvas"
          onClick={() => showArea("sandbox-canvas")}
        >
          {copy.canvasTab}
        </button>
        <button
          type="button"
          aria-controls="sandbox-tray"
          onClick={() => showArea("sandbox-tray")}
        >
          {copy.trayTab}
        </button>
        <button
          type="button"
          aria-controls="sandbox-definition"
          onClick={() => showArea("sandbox-definition")}
        >
          {copy.definitionTab}
        </button>
        <button
          type="button"
          aria-controls="sandbox-explanation"
          onClick={() => showArea("sandbox-explanation")}
        >
          {copy.explanationTab}
        </button>
      </nav>

      <fieldset
        className="sandbox-workspace"
        aria-label={copy.workspaceLabel}
      >
        <section
          id="sandbox-canvas"
          className="sandbox-area sandbox-canvas"
          aria-labelledby="sandbox-canvas-title"
          tabIndex={-1}
        >
          <header className="sandbox-area-heading">
            <span>01</span>
            <div>
              <h2 id="sandbox-canvas-title">{copy.canvasHeading}</h2>
              <p>{copy.canvasIntroduction}</p>
            </div>
          </header>

          <section className="sandbox-order" aria-label={copy.diagramLabel}>
            <div className="sandbox-order-plot">
              <svg
                className="sandbox-order-lines"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <marker
                    id="sandbox-information-arrow"
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
                      markerEnd="url(#sandbox-information-arrow)"
                    />
                  );
                })}
              </svg>

              <div className="sandbox-order-direction" aria-hidden="true">
                <span>↑</span>
                <span>{copy.moreInformation}</span>
              </div>

              {positionedStates.map((positionedState) => {
                const observations = positionedState.visibleTokenIds;
                const isBottom = observations.length === 0;
                const summary = stateSummary(positionedState.state);
                return (
                  <button
                    key={positionedState.key}
                    ref={(node) => {
                      if (node === null) {
                        nodeRefs.current.delete(positionedState.key);
                      } else {
                        nodeRefs.current.set(positionedState.key, node);
                      }
                    }}
                    className={`sandbox-order-node${isBottom ? " is-bottom" : ""}`}
                    style={{
                      left: `${positionedState.x}%`,
                      top: `${positionedState.y}%`,
                    }}
                    type="button"
                    aria-label={copy.inspectState(summary)}
                    aria-pressed={positionedState.key === selectedKey}
                    onClick={() => selectState(positionedState.state)}
                    onKeyDown={(event) =>
                      handleNodeKeyDown(event, positionedState)
                    }
                  >
                    <strong>
                      {isBottom
                        ? "⊥"
                        : formatSet(positionedState.visibleTokenIds)}
                    </strong>
                    <span>{formatSet(positionedState.state)}</span>
                  </button>
                );
              })}
            </div>

            <output
              className="sandbox-selected-state"
              aria-live="polite"
              aria-atomic="true"
            >
              <span>{copy.selectedState}</span>
              <strong>{stateLabel(selectedState)}</strong>
            </output>

            <details className="sandbox-text-view">
              <summary>{copy.textViewSummary}</summary>
              <div>
                <section>
                  <h3>{copy.statesHeading}</h3>
                  <ul>
                    {informationOrder.states.map((state) => (
                      <li key={stateKey(state)}>{stateSummary(state)}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3>{copy.edgesHeading}</h3>
                  <ul>
                    {informationOrder.edges.map((edge) => (
                      <li key={`${stateKey(edge.lower)}-${stateKey(edge.upper)}`}>
                        {copy.edgeDescription(
                          stateLabel(edge.lower),
                          stateLabel(edge.upper),
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </details>
          </section>
        </section>

        <section
          id="sandbox-tray"
          className="sandbox-area sandbox-tray"
          aria-labelledby="sandbox-tray-title"
          tabIndex={-1}
        >
          <header className="sandbox-area-heading">
            <span>02</span>
            <div>
              <h2 id="sandbox-tray-title">{copy.trayHeading}</h2>
              <p>{copy.trayIntroduction}</p>
            </div>
          </header>

          <fieldset className="sandbox-state-choices">
            <legend>{copy.stateChoicesLabel}</legend>
            {informationOrder.states.map((state) => {
              const label = stateLabel(state);
              return (
                <button
                  key={stateKey(state)}
                  type="button"
                  aria-label={copy.selectState(label)}
                  aria-pressed={stateKey(state) === selectedKey}
                  onClick={() => selectState(state)}
                >
                  {label}
                </button>
              );
            })}
          </fieldset>

          <div className="sandbox-token-tray">
            <span>{copy.formalState}</span>
            <ul>
              {selectedState.map((tokenId) => {
                const isDelta = tokenId === flatBooleanSystem.delta;
                const text = requireTokenText(tokenId);
                return (
                  <li
                    key={tokenId}
                    className={isDelta ? "is-delta" : "is-observation"}
                    aria-label={text.accessibleName}
                  >
                    <span>{isDelta ? copy.deltaRole : copy.observationRole}</span>
                    <strong>{tokenLabel(tokenId)}</strong>
                    <small>{text.label}</small>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section
          id="sandbox-definition"
          className="sandbox-area sandbox-definition"
          aria-labelledby="sandbox-definition-title"
          tabIndex={-1}
        >
          <header className="sandbox-area-heading">
            <span>03</span>
            <div>
              <h2 id="sandbox-definition-title">{copy.definitionHeading}</h2>
              <p>{copy.editingLater}</p>
            </div>
            <span className="sandbox-lock-badge">
              <span aria-hidden="true">◇</span>
              {copy.lockedLabel}
            </span>
          </header>

          <dl className="sandbox-definition-list">
            <div className="sandbox-definition-selection">
              <dt>{copy.selectedState}</dt>
              <dd>
                <code>{selectedFormalState}</code>
              </dd>
            </div>
            <div>
              <dt>{copy.tokensLabel}</dt>
              <dd>
                <code>
                  T = {formatSet(flatBooleanSystem.tokens.map(({ id }) => id))}
                </code>
              </dd>
            </div>
            <div>
              <dt>{copy.consistencyLabel}</dt>
              <dd>
                <code>
                  {copy.consistencyRule(
                    formatSet(flatBooleanSystem.minimalInconsistentSets[0] ?? []),
                  )}
                </code>
              </dd>
            </div>
            <div>
              <dt>{copy.entailmentLabel}</dt>
              <dd>
                <code>{copy.entailmentRule}</code>
              </dd>
            </div>
          </dl>
        </section>

        <section
          id="sandbox-explanation"
          className="sandbox-area sandbox-explanation"
          aria-labelledby="sandbox-explanation-title"
          tabIndex={-1}
        >
          <header className="sandbox-area-heading">
            <span>04</span>
            <div>
              <h2 id="sandbox-explanation-title">{copy.explanationHeading}</h2>
              <p>{copy.plainLanguageLabel}</p>
            </div>
          </header>

          <p className="sandbox-plain-explanation">
            {selectedPlainExplanation}
          </p>
          <div className="sandbox-formal-result">
            <span>{copy.formalState}</span>
            <code>{selectedFormalState}</code>
          </div>
          <section className="sandbox-trace" aria-labelledby="sandbox-trace-title">
            <h3 id="sandbox-trace-title">{copy.traceHeading}</h3>
            <ol>
              {closure.events.flatMap((event, index) => {
                if (event.kind !== "tokenEntailed") {
                  return [];
                }
                let description: string;
                if (event.reason.kind === "distinguishedToken") {
                  description = copy.deltaTrace;
                } else if (event.reason.kind === "reflexivity") {
                  description = copy.reflexivityTrace(
                    tokenLabel(event.conclusion),
                  );
                } else if (event.reason.kind === "declaredRule") {
                  description = copy.declaredRuleTrace(
                    event.reason.ruleId,
                    tokenLabel(event.conclusion),
                  );
                } else {
                  description = copy.cutTrace(tokenLabel(event.conclusion));
                }
                return [<li key={`${event.conclusion}-${index}`}>{description}</li>];
              })}
            </ol>
          </section>
        </section>
      </fieldset>

      <div className="sandbox-actions">
        <button className="primary-action" type="button" onClick={onBack}>
          <span>{copy.backAction}</span>
          <span className="button-arrow" aria-hidden="true">
            ↙
          </span>
        </button>
        <button className="secondary-action" type="button" onClick={onRestart}>
          {copy.restartAction}
        </button>
      </div>
    </main>
  );
}
