import {
  computeBottom,
  computeClosure,
  type ClosureComputation,
  type ObservationAttempt,
  type TokenDefinition,
  type TokenId,
  tryAddObservation,
} from "@scottlab/core";
import { flatBooleanSystem } from "@scottlab/examples";
import { useEffect, useRef, useState } from "react";

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
const informativeTokens = flatBooleanSystem.tokens.filter(
  ({ id }) => id !== flatBooleanSystem.delta,
);

interface InformedLessonState {
  readonly selectedTokenId: TokenId;
  readonly closure: ClosureComputation;
}

type RejectedObservation = Extract<ObservationAttempt, { readonly ok: false }>;

type LessonState =
  | { readonly step: "bottom" }
  | { readonly step: "inside" }
  | { readonly step: "choose" }
  | ({ readonly step: "informed" } & InformedLessonState)
  | ({
      readonly step: "conflict";
      readonly attemptedTokenId: TokenId;
      readonly rejection: RejectedObservation;
    } & InformedLessonState);

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

function hasInformation(
  state: LessonState,
): state is Extract<LessonState, { readonly step: "informed" | "conflict" }> {
  return state.step === "informed" || state.step === "conflict";
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

function TokenCard({
  token,
  text,
  roleLabel,
  informative = false,
}: TokenCardProps) {
  const symbol = token.symbol ?? token.label;

  return (
    <li
      className={`token-card${informative ? " is-informative" : ""}`}
      aria-label={`${text.accessibleName}, ${symbol}`}
    >
      <span className="token-role">{roleLabel}</span>
      <span className="token-label">{text.label}</span>
      <span className="token-symbol" aria-hidden="true">
        {symbol}
      </span>
    </li>
  );
}

export function App() {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [lessonState, setLessonState] = useState<LessonState>({
    step: "bottom",
  });
  const insideActionRef = useRef<HTMLButtonElement>(null);
  const firstChoiceRef = useRef<HTMLButtonElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const copy = messages[language];
  const isOpen = lessonState.step !== "bottom";
  const informedState = hasInformation(lessonState) ? lessonState : undefined;
  const conflictState =
    lessonState.step === "conflict" ? lessonState : undefined;
  const selectedToken =
    informedState === undefined
      ? undefined
      : requireToken(informedState.selectedTokenId);
  const attemptedToken =
    conflictState === undefined
      ? undefined
      : requireToken(conflictState.attemptedTokenId);
  const oppositeToken =
    selectedToken === undefined
      ? undefined
      : informativeTokens.find(({ id }) => id !== selectedToken.id);
  const stateTokens =
    informedState === undefined
      ? isOpen
        ? [bottom.deltaToken]
        : []
      : informedState.closure.state.map(requireToken);
  const witnessTokens =
    conflictState === undefined
      ? []
      : conflictState.rejection.event.witness.map(requireToken);
  const selectedTokenText =
    selectedToken === undefined ? undefined : tokenText(copy, selectedToken);
  const attemptedTokenText =
    attemptedToken === undefined ? undefined : tokenText(copy, attemptedToken);
  const stateLabel = `{${stateTokens
    .map((token) => token.symbol ?? token.label)
    .join(", ")}}`;

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.pageTitle;
    document
      .querySelector<HTMLMetaElement>('meta[name="description"]')
      ?.setAttribute("content", copy.pageDescription);

    try {
      window.localStorage.setItem(languageStorageKey, language);
    } catch {
      // The selected language remains active for the current page.
    }
  }, [copy, language]);

  useEffect(() => {
    if (lessonState.step === "inside") {
      insideActionRef.current?.focus();
    }
    if (lessonState.step === "choose") {
      firstChoiceRef.current?.focus();
    }
    if (lessonState.step === "informed" || lessonState.step === "conflict") {
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

  const stateDescription =
    selectedToken === undefined
      ? isOpen
        ? copy.stateDescriptions.bottomOpen
        : copy.stateDescriptions.bottomClosed
      : copy.stateDescriptions.informed(selectedTokenText?.label ?? "");

  const lessonHeading =
    lessonState.step === "bottom"
      ? copy.headings.bottom
      : lessonState.step === "inside"
        ? copy.headings.inside
        : lessonState.step === "choose"
          ? copy.headings.choose
          : lessonState.step === "informed"
            ? copy.headings.informed(selectedTokenText?.label ?? "")
            : copy.headings.conflict;

  const lessonExplanation =
    lessonState.step === "bottom"
      ? copy.explanations.bottom
      : lessonState.step === "inside"
        ? copy.explanations.inside
        : lessonState.step === "choose"
          ? copy.explanations.choose
          : lessonState.step === "informed"
            ? copy.explanations.informed(
                selectedTokenText?.label ?? "",
                stateLabel,
              )
            : copy.explanations.conflict;

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

          <div className="lesson-marker" aria-label={copy.lessonMarkerLabel}>
            <span className="lesson-number">01</span>
            <span className="lesson-name">{copy.lessonName}</span>
          </div>
        </div>
      </header>

      <main className="lesson-main">
        <section className="lesson-panel" aria-labelledby="lesson-title">
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            {copy.eyebrow}
          </p>

          <div className="state-space">
            <div
              className={`state-scene${
                conflictState === undefined ? "" : " has-conflict"
              }`}
            >
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
                    {selectedToken === undefined ? "⊥" : copy.stateNoun}
                  </span>
                  <span className="state-kind">
                    {selectedToken === undefined
                      ? copy.stateNoun
                      : `{${stateTokens
                          .map((token) => token.symbol ?? token.label)
                          .join(", ")}}`}
                  </span>
                </div>

                {isOpen ? (
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
                        informative={token.id !== flatBooleanSystem.delta}
                      />
                    ))}
                  </ul>
                ) : null}
              </figure>

              {attemptedToken === undefined ? null : (
                <>
                  <div className="conflict-connector" aria-hidden="true">
                    <span>×</span>
                  </div>
                  <aside
                    className="rejected-token"
                    aria-label={copy.rejectedToken(
                      attemptedTokenText?.label ?? "",
                    )}
                  >
                    <span className="rejected-role">{copy.rejectedRole}</span>
                    <strong>{attemptedTokenText?.label}</strong>
                    <span className="rejected-detail">
                      {copy.rejectedDetail}
                    </span>
                  </aside>
                </>
              )}
            </div>
          </div>

          <div className="lesson-copy" aria-live="polite">
            <h1
              id="lesson-title"
              ref={resultHeadingRef}
              tabIndex={hasInformation(lessonState) ? -1 : undefined}
            >
              {lessonHeading}
            </h1>
            <p>{lessonExplanation}</p>
          </div>

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
              <legend>
                {copy.oppositeQuestion}
              </legend>
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
                  onClick={() => setLessonState({ step: "choose" })}
                >
                  <span>{copy.actions.tryOtherPath}</span>
                  <span className="button-arrow" aria-hidden="true">
                    ↙
                  </span>
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
          </div>
        </section>
      </main>

      <footer className="lesson-footer">
        <div className="footer-context">
          <span>{copy.footerSystem}</span>
          <span className="footer-rule" aria-hidden="true" />
          <span>{copy.footerStage}</span>
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
