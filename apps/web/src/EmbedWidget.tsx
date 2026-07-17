import {
  enumerateStates,
  inspectStateCandidate,
  type PersistedInformationSystemDefinition,
  type TokenId,
} from "@scottlab/core";
import {
  accessPermissionsSystem,
  boundedLazyNaturalsSystem,
  coquandSystem,
  editingPolicySystem,
  flatBooleanSystem,
  streamPrefixesSystem,
  takeAwayGameSystem,
} from "@scottlab/examples";
import { useState } from "react";

import { isSupportedLanguage, messages, type Language } from "./i18n";
import "./embed-widget.css";

const embeddableSystems: readonly PersistedInformationSystemDefinition[] = [
  flatBooleanSystem,
  coquandSystem,
  accessPermissionsSystem,
  editingPolicySystem,
  boundedLazyNaturalsSystem,
  streamPrefixesSystem,
  takeAwayGameSystem,
];

function requestedSystem(): PersistedInformationSystemDefinition {
  const parameters = new URLSearchParams(window.location.search);
  const systemId = parameters.get("system") ?? "flat-boolean";
  return (
    embeddableSystems.find(({ id }) => id === systemId) ?? flatBooleanSystem
  );
}

function requestedLanguage(): Language {
  const parameters = new URLSearchParams(window.location.search);
  const language = parameters.get("lang");
  if (language === "de") {
    return "de-DE";
  }
  return isSupportedLanguage(language) ? language : "en-GB";
}

/**
 * A single self-contained interaction for embedding in lecture notes: the
 * state order of one built-in system, with a selectable detail readout.
 */
export function EmbedWidget() {
  const [system] = useState(requestedSystem);
  const [language] = useState(requestedLanguage);
  const copy = messages[language].gallery;
  const enumeration = enumerateStates(system);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedState = enumeration.states[selectedIndex] ?? [];
  const inspection = inspectStateCandidate(system, selectedState);
  const systemNote = copy.systemNotes[system.id];

  function tokenLabel(tokenId: TokenId): string {
    const token = system.tokens.find(({ id }) => id === tokenId);
    return token?.symbol ?? token?.label ?? tokenId;
  }

  function formatSet(tokenIds: readonly TokenId[]): string {
    const tokenSet = new Set(tokenIds);
    const labels = system.tokens
      .filter(({ id }) => tokenSet.has(id))
      .map(({ id }) => tokenLabel(id));
    return labels.length === 0 ? "∅" : `{${labels.join(", ")}}`;
  }

  return (
    <main className="embed-widget" lang={language}>
      <header>
        <span className="embed-brand" aria-hidden="true">
          ⊥
        </span>
        <div>
          <h1>{systemNote?.name ?? system.title}</h1>
          <p>{systemNote?.note ?? system.description}</p>
        </div>
      </header>

      <ul className="embed-state-list">
        {enumeration.states.map((state, index) => (
          <li key={state.join("|")}>
            <button
              type="button"
              aria-label={copy.viewer.selectState(formatSet(state))}
              aria-pressed={index === selectedIndex}
              onClick={() => setSelectedIndex(index)}
            >
              <code>{formatSet(state)}</code>
            </button>
          </li>
        ))}
      </ul>

      <output className="embed-detail" aria-live="polite">
        <span>{copy.viewer.selectedStateLabel}</span>
        <code>{formatSet(selectedState)}</code>
        <span>
          {inspection.kind === "state" ? copy.quiz.verdictState : ""}
        </span>
      </output>

      <footer>
        <a
          href={`./#/gallery/${system.id}`}
          target="_blank"
          rel="noreferrer"
        >
          ScottLab ↗
        </a>
      </footer>
    </main>
  );
}
