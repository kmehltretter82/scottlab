import {
  computeBottom,
  computeClosure,
  type ClosureComputation,
  type TokenDefinition,
  type TokenId,
} from "@scottlab/core";
import { flatBooleanSystem } from "@scottlab/examples";
import { useEffect, useRef, useState } from "react";

const bottom = computeBottom(flatBooleanSystem);
const informativeTokens = flatBooleanSystem.tokens.filter(
  ({ id }) => id !== flatBooleanSystem.delta,
);

type LessonState =
  | { readonly step: "bottom" }
  | { readonly step: "inside" }
  | { readonly step: "choose" }
  | {
      readonly step: "informed";
      readonly selectedTokenId: TokenId;
      readonly closure: ClosureComputation;
    };

interface TokenCardProps {
  readonly token: TokenDefinition;
  readonly informative?: boolean;
}

function requireToken(tokenId: TokenId): TokenDefinition {
  const token = flatBooleanSystem.tokens.find(({ id }) => id === tokenId);
  if (token === undefined) {
    throw new Error(`Flat Booleans does not define token '${tokenId}'.`);
  }
  return token;
}

function TokenCard({ token, informative = false }: TokenCardProps) {
  const symbol = token.symbol ?? token.label;
  const accessibleName = token.label.toLowerCase().endsWith("token")
    ? token.label
    : `${token.label} token`;

  return (
    <li
      className={`token-card${informative ? " is-informative" : ""}`}
      aria-label={`${accessibleName}, ${symbol}`}
    >
      <span className="token-role">one observation</span>
      <span className="token-label">{token.label}</span>
      <span className="token-symbol" aria-hidden="true">
        {symbol}
      </span>
    </li>
  );
}

export function App() {
  const [lessonState, setLessonState] = useState<LessonState>({
    step: "bottom",
  });
  const insideActionRef = useRef<HTMLButtonElement>(null);
  const firstChoiceRef = useRef<HTMLButtonElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const deltaSymbol = bottom.deltaToken.symbol ?? bottom.deltaToken.id;
  const isOpen = lessonState.step !== "bottom";
  const selectedToken =
    lessonState.step === "informed"
      ? requireToken(lessonState.selectedTokenId)
      : undefined;
  const stateTokens =
    lessonState.step === "informed"
      ? lessonState.closure.state.map(requireToken)
      : isOpen
        ? [bottom.deltaToken]
        : [];

  useEffect(() => {
    if (lessonState.step === "inside") {
      insideActionRef.current?.focus();
    }
    if (lessonState.step === "choose") {
      firstChoiceRef.current?.focus();
    }
    if (lessonState.step === "informed") {
      resultHeadingRef.current?.focus();
    }
  }, [lessonState.step]);

  function selectObservation(tokenId: TokenId): void {
    const closure = computeClosure(flatBooleanSystem, [tokenId]);
    setLessonState({ step: "informed", selectedTokenId: tokenId, closure });
  }

  const stateDescription =
    selectedToken === undefined
      ? isOpen
        ? "Bottom state containing the always-present Delta token"
        : "Bottom state: no specific information yet"
      : `State containing the always-present Delta token and the ${selectedToken.label} token`;

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand" aria-label="ScottLab">
          <span className="brand-mark" aria-hidden="true">
            ⊥
          </span>
          <span>ScottLab</span>
        </div>

        <div className="lesson-marker" aria-label="Lesson 1: Bottom">
          <span className="lesson-number">01</span>
          <span className="lesson-name">Bottom</span>
        </div>
      </header>

      <main className="lesson-main">
        <section className="lesson-panel" aria-labelledby="lesson-title">
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Begin here
          </p>

          <div className="state-space">
            <figure
              id="current-state"
              className={`state-vessel${isOpen ? " is-open" : ""}${
                selectedToken === undefined ? "" : " has-information"
              }`}
              aria-label={stateDescription}
            >
              <div className="bottom-identity" aria-hidden="true">
                <span
                  className={`bottom-symbol${
                    selectedToken === undefined ? "" : " is-word"
                  }`}
                >
                  {selectedToken === undefined ? "⊥" : "state"}
                </span>
                <span className="state-kind">
                  {selectedToken === undefined
                    ? "state"
                    : `{${stateTokens
                        .map((token) => token.symbol ?? token.label)
                        .join(", ")}}`}
                </span>
              </div>

              {isOpen ? (
                <ul className="state-tokens" aria-label="Tokens in this state">
                  {stateTokens.map((token) => (
                    <TokenCard
                      key={token.id}
                      token={token}
                      informative={token.id !== flatBooleanSystem.delta}
                    />
                  ))}
                </ul>
              ) : null}
            </figure>
          </div>

          <div className="lesson-copy" aria-live="polite">
            <h1
              id="lesson-title"
              ref={resultHeadingRef}
              tabIndex={lessonState.step === "informed" ? -1 : undefined}
            >
              {lessonState.step === "bottom"
                ? "No specific information yet"
                : lessonState.step === "inside"
                  ? "There is always one token inside."
                  : lessonState.step === "choose"
                    ? "Add one observation."
                    : `The state now contains the token ${selectedToken?.label}.`}
            </h1>

            {lessonState.step === "inside" ? (
              <p>
                This whole shape is a state. The object inside is one token.
                <span className="formal-note">
                  {` ${deltaSymbol}`} is present in every state, but gives no
                  specific Boolean information.
                </span>
              </p>
            ) : null}

            {lessonState.step === "choose" ? (
              <p>
                Choose <code>true</code> or <code>false</code>. Either token
                gives the state more information than
                <span aria-hidden="true"> ⊥</span>
                <span className="visually-hidden"> bottom</span>.
              </p>
            ) : null}

            {lessonState.step === "informed" ? (
              <p>
                It has more information than
                <span aria-hidden="true"> ⊥</span>
                <span className="visually-hidden"> bottom</span>.
              </p>
            ) : null}
          </div>

          {lessonState.step === "choose" ? (
            <fieldset className="token-choice-fieldset">
              <legend className="visually-hidden">Choose one observation</legend>
              <div className="token-choices">
                {informativeTokens.map((token, index) => (
                  <button
                    key={token.id}
                    ref={index === 0 ? firstChoiceRef : undefined}
                    className="token-choice"
                    type="button"
                    aria-label={`Add ${token.label} token`}
                    onClick={() => selectObservation(token.id)}
                  >
                    <span className="choice-role">token</span>
                    <span className="choice-label">{token.label}</span>
                  </button>
                ))}
              </div>
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
                <span>Look inside</span>
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
                  <span>Add information</span>
                  <span className="button-arrow" aria-hidden="true">
                    ↗
                  </span>
                </button>
                <button
                  className="secondary-action"
                  type="button"
                  onClick={() => setLessonState({ step: "bottom" })}
                >
                  Close the state
                </button>
              </>
            ) : null}

            {lessonState.step === "choose" ? (
              <button
                className="secondary-action"
                type="button"
                onClick={() => setLessonState({ step: "inside" })}
              >
                Back
              </button>
            ) : null}

            {lessonState.step === "informed" ? (
              <>
                <button
                  className="primary-action"
                  type="button"
                  onClick={() => setLessonState({ step: "choose" })}
                >
                  <span>Choose again</span>
                  <span className="button-arrow" aria-hidden="true">
                    ↙
                  </span>
                </button>
                <button
                  className="secondary-action"
                  type="button"
                  onClick={() => setLessonState({ step: "bottom" })}
                >
                  Start over
                </button>
              </>
            ) : null}
          </div>
        </section>
      </main>

      <footer className="lesson-footer">
        <span>Flat Booleans</span>
        <span className="footer-rule" aria-hidden="true" />
        <span>First observation</span>
      </footer>
    </div>
  );
}
