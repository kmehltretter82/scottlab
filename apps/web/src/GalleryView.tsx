import {
  enumerateStates,
  estimateMappingValidation,
  inspectStateCandidate,
  validateSystem,
  type PersistedInformationSystemDefinition,
  type StateCandidateInspection,
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
import { useMemo, useState, type Ref } from "react";

import {
  loadImportedSystems,
  saveImportedSystems,
  validatePersistedSystemShape,
} from "./persistence";
import "./gallery.css";

export interface GalleryTokenText {
  readonly label: string;
  readonly description: string;
}

export interface GallerySystemNote {
  readonly name: string;
  readonly note: string;
}

export interface GalleryCopy {
  readonly pageTitle: string;
  readonly pageDescription: string;
  readonly markerLabel: string;
  readonly markerName: string;
  readonly footerSystem: string;
  readonly footerStage: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly systemNotes: Readonly<Record<string, GallerySystemNote>>;
  readonly index: {
    readonly builtInHeading: string;
    readonly importedHeading: string;
    readonly noImports: string;
    readonly openSystem: (name: string) => string;
    readonly removeImport: (name: string) => string;
    readonly tokensSummary: (count: number) => string;
  };
  readonly importPanel: {
    readonly heading: string;
    readonly introduction: string;
    readonly jsonLabel: string;
    readonly importAction: string;
    readonly fcaHeading: string;
    readonly fcaIntroduction: string;
    readonly fcaLabel: string;
    readonly fcaPlaceholder: string;
    readonly fcaAction: string;
    readonly errorInvalidJson: string;
    readonly errorInvalidShape: string;
    readonly errorClashingId: (id: string) => string;
    readonly errorSemantic: (message: string) => string;
    readonly errorFcaShape: string;
    readonly imported: (name: string) => string;
  };
  readonly viewer: {
    readonly backToIndex: string;
    readonly definitionHeading: string;
    readonly tokensLabel: string;
    readonly conflictsLabel: string;
    readonly noConflicts: string;
    readonly rulesLabel: string;
    readonly noRules: string;
    readonly boundLabel: (bound: string) => string;
    readonly exactLabel: string;
    readonly statesHeading: string;
    readonly enumerationGuard: (candidates: string) => string;
    readonly enumerateAnyway: string;
    readonly statesCount: (count: number) => string;
    readonly selectState: (state: string) => string;
    readonly selectedStateLabel: string;
    readonly coverEdgesLabel: string;
    readonly noEdges: string;
    readonly exportAction: string;
  };
  readonly quiz: {
    readonly heading: string;
    readonly introduction: string;
    readonly startAction: string;
    readonly nextAction: string;
    readonly candidateLabel: string;
    readonly choiceLegend: string;
    readonly answerInconsistent: string;
    readonly answerUnclosed: string;
    readonly answerState: string;
    readonly correct: string;
    readonly incorrect: string;
    readonly verdictInconsistent: (witness: string) => string;
    readonly verdictUnclosed: (missing: string) => string;
    readonly verdictState: string;
  };
}

const builtInSystems: readonly PersistedInformationSystemDefinition[] = [
  flatBooleanSystem,
  coquandSystem,
  accessPermissionsSystem,
  editingPolicySystem,
  boundedLazyNaturalsSystem,
  streamPrefixesSystem,
  takeAwayGameSystem,
];

const enumerationTokenLimit = 12;

type QuizAnswer = "inconsistent" | "notClosed" | "state";

interface QuizRound {
  readonly candidate: readonly TokenId[];
  readonly inspection: StateCandidateInspection;
  readonly answer?: QuizAnswer;
}

export interface GalleryViewProps {
  readonly copy: GalleryCopy;
  readonly headingRef: Ref<HTMLHeadingElement>;
  readonly systemId: string | undefined;
  readonly onOpenSystem: (systemId: string) => void;
  readonly onBackToIndex: () => void;
  readonly localizedTokens: (
    systemId: string,
  ) => Readonly<Record<string, GalleryTokenText>> | undefined;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
  return slug.length === 0 ? "attribute" : slug;
}

/** Derive an information system from a formal-concept cross-table. */
function systemFromCrossTable(
  csv: string,
): PersistedInformationSystemDefinition | undefined {
  const rows = csv
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row.length > 0)
    .map((row) => row.split(",").map((cell) => cell.trim()));
  const header = rows[0];
  if (rows.length < 2 || header === undefined || header.length < 2) {
    return undefined;
  }

  const attributes = header.slice(1).map(slugify);
  if (
    attributes.length > 6 ||
    new Set(attributes).size !== attributes.length ||
    attributes.includes("delta")
  ) {
    return undefined;
  }

  const objects = rows.slice(1).map((row) => {
    const marks = new Set<string>();
    row.slice(1).forEach((cell, index) => {
      const attribute = attributes[index];
      if (
        attribute !== undefined &&
        (cell === "x" || cell === "X" || cell === "1")
      ) {
        marks.add(attribute);
      }
    });
    return marks;
  });
  if (objects.length === 0 || objects.length > 12) {
    return undefined;
  }

  function closeAttributes(input: readonly string[]): Set<string> {
    const sharing = objects.filter((marks) =>
      input.every((attribute) => marks.has(attribute)),
    );
    if (sharing.length === 0) {
      return new Set(attributes);
    }
    return new Set(
      attributes.filter((attribute) =>
        sharing.every((marks) => marks.has(attribute)),
      ),
    );
  }

  const rules: {
    id: string;
    premises: string[];
    conclusion: string;
  }[] = [];
  const subsetCount = 2 ** attributes.length;
  for (let mask = 0; mask < subsetCount; mask += 1) {
    const premises = attributes.filter(
      (_, index) => (mask & (1 << index)) !== 0,
    );
    const closed = closeAttributes(premises);
    for (const conclusion of closed) {
      if (!premises.includes(conclusion)) {
        rules.push({
          id: `implication-${String(rules.length + 1)}`,
          premises,
          conclusion,
        });
      }
    }
  }

  return {
    schemaVersion: "1",
    kind: "information-system",
    convention: "scott-1982-distinguished-token",
    id: `fca-import-${String(Date.now() % 100000)}`,
    title: "Imported concept table",
    description:
      "Derived from an object-attribute cross-table; states are the concept intents.",
    approximation: { kind: "exact" },
    tokens: [
      {
        id: "delta",
        label: "Always-present token",
        symbol: "Δ",
        description: "The distinguished token present in every state.",
      },
      ...attributes.map((attribute) => ({
        id: attribute,
        label: attribute,
        description: `The attribute '${attribute}' from the imported table.`,
      })),
    ],
    delta: "delta",
    minimalInconsistentSets: [],
    entailmentRules: rules,
  };
}

export function GalleryView({
  copy,
  headingRef,
  systemId,
  onOpenSystem,
  onBackToIndex,
  localizedTokens,
}: GalleryViewProps) {
  const [importedSystems, setImportedSystems] = useState(loadImportedSystems);
  const [importText, setImportText] = useState("");
  const [fcaText, setFcaText] = useState("");
  const [importFeedback, setImportFeedback] = useState<string | undefined>(
    undefined,
  );
  const [enumerationConfirmed, setEnumerationConfirmed] = useState(false);
  const [selectedStateKey, setSelectedStateKey] = useState<string | undefined>(
    undefined,
  );
  const [quizRound, setQuizRound] = useState<QuizRound | undefined>(undefined);

  const system: PersistedInformationSystemDefinition | undefined =
    systemId === undefined
      ? undefined
      : (builtInSystems.find(({ id }) => id === systemId) ??
        importedSystems.find(({ id }) => id === systemId));

  const tokenText =
    system === undefined ? undefined : localizedTokens(system.id);

  const enumerationAllowed =
    system !== undefined &&
    (system.tokens.length <= enumerationTokenLimit || enumerationConfirmed);

  const enumeration = useMemo(() => {
    if (system === undefined || !enumerationAllowed) {
      return undefined;
    }
    return enumerateStates(system);
  }, [system, enumerationAllowed]);

  function tokenLabel(tokenId: TokenId): string {
    const token = system?.tokens.find(({ id }) => id === tokenId);
    if (token === undefined) {
      return tokenId;
    }
    return token.symbol ?? tokenText?.[tokenId]?.label ?? token.label;
  }

  function formatSet(tokenIds: readonly TokenId[]): string {
    if (system === undefined) {
      return "∅";
    }
    const tokenSet = new Set(tokenIds);
    const labels = system.tokens
      .filter(({ id }) => tokenSet.has(id))
      .map(({ id }) => tokenLabel(id));
    return labels.length === 0 ? "∅" : `{${labels.join(", ")}}`;
  }

  function stateKeyOf(state: readonly TokenId[]): string {
    return [...state].sort().join("\0");
  }

  const selectedState = enumeration?.states.find(
    (state) => stateKeyOf(state) === selectedStateKey,
  );

  function persistImports(
    systems: readonly PersistedInformationSystemDefinition[],
  ): void {
    setImportedSystems(systems);
    saveImportedSystems(systems);
  }

  function activateImport(
    document: PersistedInformationSystemDefinition,
  ): void {
    if (builtInSystems.some(({ id }) => id === document.id)) {
      setImportFeedback(copy.importPanel.errorClashingId(document.id));
      return;
    }
    try {
      validateSystem(document);
    } catch (error) {
      setImportFeedback(
        copy.importPanel.errorSemantic(
          error instanceof Error ? error.message : String(error),
        ),
      );
      return;
    }
    persistImports([
      ...importedSystems.filter(({ id }) => id !== document.id),
      document,
    ]);
    setImportFeedback(copy.importPanel.imported(document.title));
    onOpenSystem(document.id);
  }

  function importJson(): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(importText);
    } catch {
      setImportFeedback(copy.importPanel.errorInvalidJson);
      return;
    }
    const document = validatePersistedSystemShape(parsed);
    if (document === undefined) {
      setImportFeedback(copy.importPanel.errorInvalidShape);
      return;
    }
    activateImport(document);
  }

  function importCrossTable(): void {
    const document = systemFromCrossTable(fcaText);
    if (document === undefined) {
      setImportFeedback(copy.importPanel.errorFcaShape);
      return;
    }
    activateImport(document);
  }

  function removeImport(id: string): void {
    persistImports(importedSystems.filter((entry) => entry.id !== id));
  }

  function exportSystem(): void {
    if (system === undefined) {
      return;
    }
    const blob = new Blob([`${JSON.stringify(system, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${system.id}.system.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function startQuizRound(): void {
    if (system === undefined) {
      return;
    }
    const observationIds = system.tokens
      .map(({ id }) => id)
      .filter((id) => id !== system.delta);
    const candidate = observationIds.filter(() => Math.random() < 0.4);
    const sample =
      candidate.length === 0 ? observationIds.slice(0, 1) : candidate;
    setQuizRound({
      candidate: sample,
      inspection: inspectStateCandidate(system, sample),
    });
  }

  function answerQuiz(answer: QuizAnswer): void {
    if (quizRound !== undefined) {
      setQuizRound({ ...quizRound, answer });
    }
  }

  function quizVerdict(round: QuizRound): string {
    if (round.inspection.kind === "inconsistent") {
      return copy.quiz.verdictInconsistent(
        formatSet(round.inspection.witness),
      );
    }
    if (round.inspection.kind === "notClosed") {
      return copy.quiz.verdictUnclosed(
        formatSet(round.inspection.missingTokens),
      );
    }
    return copy.quiz.verdictState;
  }

  const systemNote =
    system === undefined ? undefined : copy.systemNotes[system.id];
  const estimate =
    system === undefined
      ? undefined
      : estimateMappingValidation(system, system).sourceSystemSubsetCandidates;

  return (
    <main className="gallery-main">
      <section className="gallery-introduction">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h1 ref={headingRef} tabIndex={-1}>
            {system === undefined
              ? copy.title
              : (systemNote?.name ?? system.title)}
          </h1>
        </div>
        <p>
          {system === undefined
            ? copy.lead
            : (systemNote?.note ?? system.description)}
        </p>
      </section>

      {system === undefined ? (
        <>
          <section
            className="gallery-index"
            aria-label={copy.index.builtInHeading}
          >
            <h2>{copy.index.builtInHeading}</h2>
            <ul>
              {builtInSystems.map((entry) => {
                const note = copy.systemNotes[entry.id];
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      aria-label={copy.index.openSystem(
                        note?.name ?? entry.title,
                      )}
                      onClick={() => onOpenSystem(entry.id)}
                    >
                      <strong>{note?.name ?? entry.title}</strong>
                      <span>{copy.index.tokensSummary(entry.tokens.length)}</span>
                      <small>{note?.note ?? entry.description}</small>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section
            className="gallery-index gallery-imports"
            aria-label={copy.index.importedHeading}
          >
            <h2>{copy.index.importedHeading}</h2>
            {importedSystems.length === 0 ? (
              <p>{copy.index.noImports}</p>
            ) : (
              <ul>
                {importedSystems.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      aria-label={copy.index.openSystem(entry.title)}
                      onClick={() => onOpenSystem(entry.id)}
                    >
                      <strong>{entry.title}</strong>
                      <span>
                        {copy.index.tokensSummary(entry.tokens.length)}
                      </span>
                      <small>{entry.description}</small>
                    </button>
                    <button
                      className="secondary-action"
                      type="button"
                      aria-label={copy.index.removeImport(entry.title)}
                      onClick={() => removeImport(entry.id)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            className="gallery-import-panel"
            aria-labelledby="gallery-import-title"
          >
            <h2 id="gallery-import-title">{copy.importPanel.heading}</h2>
            <p>{copy.importPanel.introduction}</p>
            <label>
              <span>{copy.importPanel.jsonLabel}</span>
              <textarea
                rows={6}
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
              />
            </label>
            <button
              className="primary-action"
              type="button"
              onClick={importJson}
            >
              {copy.importPanel.importAction}
            </button>

            <h3>{copy.importPanel.fcaHeading}</h3>
            <p>{copy.importPanel.fcaIntroduction}</p>
            <label>
              <span>{copy.importPanel.fcaLabel}</span>
              <textarea
                rows={5}
                placeholder={copy.importPanel.fcaPlaceholder}
                value={fcaText}
                onChange={(event) => setFcaText(event.target.value)}
              />
            </label>
            <button
              className="primary-action"
              type="button"
              onClick={importCrossTable}
            >
              {copy.importPanel.fcaAction}
            </button>

            {importFeedback === undefined ? null : (
              <output aria-live="polite">{importFeedback}</output>
            )}
          </section>
        </>
      ) : (
        <>
          <div className="gallery-viewer-actions">
            <button
              className="secondary-action"
              type="button"
              onClick={onBackToIndex}
            >
              {copy.viewer.backToIndex}
            </button>
            <button
              className="secondary-action"
              type="button"
              onClick={exportSystem}
            >
              {copy.viewer.exportAction}
            </button>
          </div>

          <section
            className="gallery-definition"
            aria-labelledby="gallery-definition-title"
          >
            <h2 id="gallery-definition-title">
              {copy.viewer.definitionHeading}
            </h2>
            <p className="gallery-approximation">
              {system.approximation.kind === "bounded"
                ? copy.viewer.boundLabel(system.approximation.bound)
                : copy.viewer.exactLabel}
            </p>
            <dl>
              <div>
                <dt>{copy.viewer.tokensLabel}</dt>
                <dd>
                  <ul className="gallery-token-list">
                    {system.tokens.map((token) => (
                      <li key={token.id}>
                        <code>{token.symbol ?? tokenLabel(token.id)}</code>
                        <span>
                          {tokenText?.[token.id]?.description ??
                            token.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>{copy.viewer.conflictsLabel}</dt>
                <dd>
                  {system.minimalInconsistentSets.length === 0 ? (
                    copy.viewer.noConflicts
                  ) : (
                    <code>
                      {system.minimalInconsistentSets
                        .map((conflict) => formatSet(conflict))
                        .join("  ")}
                    </code>
                  )}
                </dd>
              </div>
              <div>
                <dt>{copy.viewer.rulesLabel}</dt>
                <dd>
                  {system.entailmentRules.length === 0 ? (
                    copy.viewer.noRules
                  ) : (
                    <ul className="gallery-rule-list">
                      {system.entailmentRules.map((rule) => (
                        <li key={rule.id}>
                          <code>
                            {formatSet(rule.premises)} ⊢{" "}
                            {tokenLabel(rule.conclusion)}
                          </code>
                        </li>
                      ))}
                    </ul>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section
            className="gallery-states"
            aria-labelledby="gallery-states-title"
          >
            <h2 id="gallery-states-title">{copy.viewer.statesHeading}</h2>
            {enumeration === undefined ? (
              <div className="gallery-enumeration-guard">
                <p>
                  {copy.viewer.enumerationGuard(
                    estimate === undefined
                      ? ""
                      : estimate.toLocaleString("en-US"),
                  )}
                </p>
                <button
                  className="primary-action"
                  type="button"
                  onClick={() => setEnumerationConfirmed(true)}
                >
                  {copy.viewer.enumerateAnyway}
                </button>
              </div>
            ) : (
              <>
                <p>{copy.viewer.statesCount(enumeration.states.length)}</p>
                <ul className="gallery-state-list">
                  {enumeration.states.map((state) => (
                    <li key={stateKeyOf(state)}>
                      <button
                        type="button"
                        aria-label={copy.viewer.selectState(formatSet(state))}
                        aria-pressed={stateKeyOf(state) === selectedStateKey}
                        onClick={() => setSelectedStateKey(stateKeyOf(state))}
                      >
                        <code>{formatSet(state)}</code>
                      </button>
                    </li>
                  ))}
                </ul>
                {selectedState === undefined ? null : (
                  <div className="gallery-state-detail" aria-live="polite">
                    <span>{copy.viewer.selectedStateLabel}</span>
                    <code>{formatSet(selectedState)}</code>
                    <span>{copy.viewer.coverEdgesLabel}</span>
                    {(() => {
                      const covers = enumeration.states.filter(
                        (upper) =>
                          upper.length > selectedState.length &&
                          selectedState.every((tokenId) =>
                            upper.includes(tokenId),
                          ) &&
                          !enumeration.states.some(
                            (middle) =>
                              middle.length > selectedState.length &&
                              middle.length < upper.length &&
                              selectedState.every((tokenId) =>
                                middle.includes(tokenId),
                              ) &&
                              middle.every((tokenId) =>
                                upper.includes(tokenId),
                              ),
                          ),
                      );
                      return covers.length === 0 ? (
                        <p>{copy.viewer.noEdges}</p>
                      ) : (
                        <ul>
                          {covers.map((upper) => (
                            <li key={stateKeyOf(upper)}>
                              <code>
                                {formatSet(selectedState)} ⊑ {formatSet(upper)}
                              </code>
                            </li>
                          ))}
                        </ul>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
          </section>

          <section className="gallery-quiz" aria-labelledby="gallery-quiz-title">
            <h2 id="gallery-quiz-title">{copy.quiz.heading}</h2>
            <p>{copy.quiz.introduction}</p>
            {quizRound === undefined ? (
              <button
                className="primary-action"
                type="button"
                onClick={startQuizRound}
              >
                {copy.quiz.startAction}
              </button>
            ) : (
              <div className="gallery-quiz-round">
                <p>
                  <span>{copy.quiz.candidateLabel}</span>{" "}
                  <code>{formatSet(quizRound.candidate)}</code>
                </p>
                <fieldset>
                  <legend>{copy.quiz.choiceLegend}</legend>
                  <div>
                    {(
                      [
                        ["inconsistent", copy.quiz.answerInconsistent],
                        ["notClosed", copy.quiz.answerUnclosed],
                        ["state", copy.quiz.answerState],
                      ] as const
                    ).map(([answer, label]) => (
                      <button
                        key={answer}
                        type="button"
                        aria-pressed={quizRound.answer === answer}
                        onClick={() => answerQuiz(answer)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                {quizRound.answer === undefined ? null : (
                  <output aria-live="polite">
                    <strong>
                      {quizRound.answer === quizRound.inspection.kind
                        ? copy.quiz.correct
                        : copy.quiz.incorrect}
                    </strong>{" "}
                    {quizVerdict(quizRound)}
                  </output>
                )}
                <button
                  className="secondary-action"
                  type="button"
                  onClick={startQuizRound}
                >
                  {copy.quiz.nextAction}
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
