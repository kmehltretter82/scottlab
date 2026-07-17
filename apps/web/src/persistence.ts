import type { TokenId } from "@scottlab/core";
import {
  accessPermissionsSystem,
  editingPolicySystem,
  flatBooleanSystem,
} from "@scottlab/examples";

import {
  continuousMapFrameCount,
  type ContinuousMapLessonProgress,
} from "./ContinuousMapLesson";
import {
  entailmentTraceFrameCount,
  type EntailmentLessonProgress,
} from "./EntailmentLesson";
import type { StateLessonProgress } from "./StateLesson";

/**
 * The serialized position inside the introductory flat-Boolean lesson.
 *
 * Only token references and step names are persisted; closures, traces,
 * and rejections are recomputed from the semantic core on restore so a
 * stored session can never inject stale or forged mathematical results.
 */
export interface PersistedLessonPosition {
  readonly step: string;
  readonly selectedTokenId?: TokenId;
  readonly attemptedTokenId?: TokenId;
  readonly targetTokenId?: TokenId;
  readonly challengeTokenId?: TokenId;
  readonly inspectedState?: readonly TokenId[];
  readonly completedChallengeTokenId?: TokenId;
  readonly formalisationPage?: string;
}

export interface PersistedProgress {
  readonly version: 1;
  readonly lesson: PersistedLessonPosition;
  readonly entailment: EntailmentLessonProgress;
  readonly states: StateLessonProgress;
  readonly maps: ContinuousMapLessonProgress;
  readonly statesUnlocked: boolean;
}

export const progressStorageKey = "scottlab.progress.v1";

const lessonSteps = new Set([
  "intro",
  "example",
  "bottom",
  "inside",
  "choose",
  "informed",
  "conflict",
  "order",
  "formal",
  "challenge",
  "challengeAttempt",
]);

const formalisationPages = new Set([
  "distinction",
  "ingredients",
  "closure",
  "states",
]);

function knownTokenIds(system: {
  readonly tokens: readonly { readonly id: TokenId }[];
}): Set<TokenId> {
  return new Set(system.tokens.map(({ id }) => id));
}

const flatBooleanTokenIds = knownTokenIds(flatBooleanSystem);
const accessPermissionsTokenIds = knownTokenIds(accessPermissionsSystem);
const editingPolicyTokenIds = knownTokenIds(editingPolicySystem);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalToken(
  value: unknown,
  tokenIds: ReadonlySet<TokenId>,
): value is TokenId | undefined {
  return value === undefined || (typeof value === "string" && tokenIds.has(value));
}

function isTokenArray(
  value: unknown,
  tokenIds: ReadonlySet<TokenId>,
): value is readonly TokenId[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) => typeof entry === "string" && tokenIds.has(entry),
    )
  );
}

function isFrameIndex(value: unknown, frameCount: number): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < frameCount
  );
}

function validateLessonPosition(
  value: unknown,
): PersistedLessonPosition | undefined {
  if (!isRecord(value) || typeof value.step !== "string") {
    return undefined;
  }
  if (!lessonSteps.has(value.step)) {
    return undefined;
  }
  if (
    !isOptionalToken(value.selectedTokenId, flatBooleanTokenIds) ||
    !isOptionalToken(value.attemptedTokenId, flatBooleanTokenIds) ||
    !isOptionalToken(value.targetTokenId, flatBooleanTokenIds) ||
    !isOptionalToken(value.challengeTokenId, flatBooleanTokenIds) ||
    !isOptionalToken(value.completedChallengeTokenId, flatBooleanTokenIds)
  ) {
    return undefined;
  }
  if (
    value.inspectedState !== undefined &&
    !isTokenArray(value.inspectedState, flatBooleanTokenIds)
  ) {
    return undefined;
  }
  if (
    value.formalisationPage !== undefined &&
    (typeof value.formalisationPage !== "string" ||
      !formalisationPages.has(value.formalisationPage))
  ) {
    return undefined;
  }

  return {
    step: value.step,
    ...(value.selectedTokenId === undefined
      ? {}
      : { selectedTokenId: value.selectedTokenId }),
    ...(value.attemptedTokenId === undefined
      ? {}
      : { attemptedTokenId: value.attemptedTokenId }),
    ...(value.targetTokenId === undefined
      ? {}
      : { targetTokenId: value.targetTokenId }),
    ...(value.challengeTokenId === undefined
      ? {}
      : { challengeTokenId: value.challengeTokenId }),
    ...(value.inspectedState === undefined
      ? {}
      : { inspectedState: value.inspectedState }),
    ...(value.completedChallengeTokenId === undefined
      ? {}
      : { completedChallengeTokenId: value.completedChallengeTokenId }),
    ...(value.formalisationPage === undefined
      ? {}
      : { formalisationPage: value.formalisationPage }),
  };
}

function validateEntailmentProgress(
  value: unknown,
): EntailmentLessonProgress | undefined {
  if (!isRecord(value) || !isRecord(value.stage)) {
    return undefined;
  }
  if (!isOptionalToken(value.challengeAttempt, accessPermissionsTokenIds)) {
    return undefined;
  }

  const { stage } = value;
  if (stage.kind === "bottom" || stage.kind === "complete") {
    return {
      stage: { kind: stage.kind },
      ...(value.challengeAttempt === undefined
        ? {}
        : { challengeAttempt: value.challengeAttempt }),
    };
  }
  if (
    stage.kind === "trace" &&
    isFrameIndex(stage.frameIndex, entailmentTraceFrameCount)
  ) {
    return {
      stage: { kind: "trace", frameIndex: stage.frameIndex },
      ...(value.challengeAttempt === undefined
        ? {}
        : { challengeAttempt: value.challengeAttempt }),
    };
  }
  return undefined;
}

function validateStateLessonProgress(
  value: unknown,
): StateLessonProgress | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  if (
    value.stage !== "guide" &&
    value.stage !== "closedExample" &&
    value.stage !== "challenge" &&
    value.stage !== "complete"
  ) {
    return undefined;
  }
  if (!isTokenArray(value.selection, editingPolicyTokenIds)) {
    return undefined;
  }
  return { stage: value.stage, selection: value.selection };
}

function validateContinuousMapProgress(
  value: unknown,
): ContinuousMapLessonProgress | undefined {
  if (!isRecord(value) || !isRecord(value.stage)) {
    return undefined;
  }
  const { stage } = value;
  if (stage.kind === "bottom" || stage.kind === "complete") {
    return { stage: { kind: stage.kind } };
  }
  if (
    stage.kind === "guide" &&
    isFrameIndex(stage.frameIndex, continuousMapFrameCount)
  ) {
    return { stage: { kind: "guide", frameIndex: stage.frameIndex } };
  }
  if (
    stage.kind === "challenge" &&
    isFrameIndex(stage.frameIndex, continuousMapFrameCount) &&
    (stage.input === undefined ||
      stage.input === "false" ||
      stage.input === "true")
  ) {
    return {
      stage: {
        kind: "challenge",
        frameIndex: stage.frameIndex,
        ...(stage.input === undefined ? {} : { input: stage.input }),
      },
    };
  }
  return undefined;
}

/** Load and validate stored progress; anything malformed is discarded. */
export function loadPersistedProgress(): PersistedProgress | undefined {
  try {
    const raw = window.localStorage.getItem(progressStorageKey);
    if (raw === null) {
      return undefined;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 1) {
      return undefined;
    }

    const lesson = validateLessonPosition(parsed.lesson);
    const entailment = validateEntailmentProgress(parsed.entailment);
    const states = validateStateLessonProgress(parsed.states);
    const maps = validateContinuousMapProgress(parsed.maps);
    if (
      lesson === undefined ||
      entailment === undefined ||
      states === undefined ||
      maps === undefined ||
      typeof parsed.statesUnlocked !== "boolean"
    ) {
      return undefined;
    }

    return {
      version: 1,
      lesson,
      entailment,
      states,
      maps,
      statesUnlocked: parsed.statesUnlocked,
    };
  } catch {
    return undefined;
  }
}

/** Persist progress; storage failures leave the session non-resumable. */
export function savePersistedProgress(progress: PersistedProgress): void {
  try {
    window.localStorage.setItem(
      progressStorageKey,
      JSON.stringify(progress),
    );
  } catch {
    // Local storage may be unavailable; the lesson continues unpersisted.
  }
}
