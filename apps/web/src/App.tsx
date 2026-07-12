import { computeBottom } from "@scottlab/core";
import { flatBooleanSystem } from "@scottlab/examples";
import { useState } from "react";

const bottom = computeBottom(flatBooleanSystem);

export function App() {
  const [isInspected, setIsInspected] = useState(false);
  const deltaSymbol = bottom.deltaToken.symbol ?? bottom.deltaToken.id;

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
              id="bottom-state"
              className={`state-vessel${isInspected ? " is-open" : ""}`}
              aria-label={
                isInspected
                  ? "Bottom state containing the always-present Delta token"
                  : "Bottom state: no specific information yet"
              }
            >
              <div className="bottom-identity" aria-hidden="true">
                <span className="bottom-symbol">⊥</span>
                <span className="state-kind">state</span>
              </div>

              {isInspected ? (
                <div
                  className="token-card"
                  aria-label={`Always-present token, ${deltaSymbol}`}
                >
                  <span className="token-role">one observation</span>
                  <span className="token-label">
                    {bottom.deltaToken.label}
                  </span>
                  <span className="token-symbol" aria-hidden="true">
                    {deltaSymbol}
                  </span>
                </div>
              ) : null}
            </figure>
          </div>

          <div className="lesson-copy" aria-live="polite">
            <h1 id="lesson-title">
              {isInspected
                ? "There is always one token inside."
                : "No specific information yet"}
            </h1>
            {isInspected ? (
              <p>
                This whole shape is a state. The object inside is one token.
                <span className="formal-note">
                  {` ${deltaSymbol}`} is present in every state, but gives no
                  specific Boolean information.
                </span>
              </p>
            ) : null}
          </div>

          <button
            className="primary-action"
            type="button"
            aria-controls="bottom-state"
            aria-expanded={isInspected}
            onClick={() => setIsInspected((current) => !current)}
          >
            <span>{isInspected ? "Close the state" : "Look inside"}</span>
            <span className="button-arrow" aria-hidden="true">
              {isInspected ? "↙" : "↗"}
            </span>
          </button>
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
