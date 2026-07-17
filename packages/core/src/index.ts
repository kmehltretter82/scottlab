export type TokenId = string;

export interface TokenDefinition {
  readonly id: TokenId;
  readonly label: string;
  readonly symbol?: string;
  readonly description: string;
}

export interface EntailmentRuleDefinition {
  readonly id: string;
  readonly premises: readonly TokenId[];
  readonly conclusion: TokenId;
}

export interface InformationSystemDefinition {
  readonly tokens: readonly TokenDefinition[];
  readonly delta: TokenId;
  readonly minimalInconsistentSets: readonly (readonly TokenId[])[];
  readonly entailmentRules: readonly EntailmentRuleDefinition[];
}

export interface ExactApproximationDefinition {
  readonly kind: "exact";
}

export interface BoundedApproximationDefinition {
  readonly kind: "bounded";
  readonly bound: string;
}

export type ApproximationDefinition =
  | ExactApproximationDefinition
  | BoundedApproximationDefinition;

/** The complete version 1 information-system document persisted as JSON. */
export interface PersistedInformationSystemDefinition
  extends InformationSystemDefinition {
  readonly schemaVersion: "1";
  readonly kind: "information-system";
  readonly convention: "scott-1982-distinguished-token";
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly approximation: ApproximationDefinition;
}

export interface SystemValidation {
  readonly ok: true;
  readonly checkedConsistentSets: number;
}

export interface ApproximableMappingRuleDefinition {
  readonly id: string;
  readonly premises: readonly TokenId[];
  readonly conclusion: TokenId;
}

export interface ApproximableMappingDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly rules: readonly ApproximableMappingRuleDefinition[];
}

/** The complete version 1 approximable-mapping document persisted as JSON. */
export interface PersistedApproximableMappingDefinition
  extends ApproximableMappingDefinition {
  readonly schemaVersion: "1";
  readonly kind: "approximable-mapping";
  readonly approximation: ApproximationDefinition;
  readonly sourceSystemId: string;
  readonly targetSystemId: string;
}

export interface MappingValidation {
  readonly ok: true;
  readonly checkedConsistentSourceSets: number;
}

export interface MappingValidationEstimate {
  readonly sourceTokenCount: number;
  readonly targetTokenCount: number;
  readonly sourceSystemSubsetCandidates: number;
  readonly targetSystemSubsetCandidates: number;
  readonly mappingSubsetCandidates: number;
  readonly totalSubsetCandidates: number;
}

export interface MappingValidationOptions {
  readonly maxSubsetChecks?: number;
}

export const DEFAULT_MAPPING_VALIDATION_MAX_SUBSET_CHECKS = 262_144;

export interface CompiledApproximableMapping {
  readonly kind: "compiledApproximableMapping";
  readonly validation: MappingValidation;
  readonly estimate: MappingValidationEstimate;
}

export interface MappingRuleActivation {
  readonly ruleId: string;
  readonly premises: readonly TokenId[];
  readonly conclusion: TokenId;
}

export type MappingApplicationReason =
  | { readonly kind: "targetDistinguishedToken" }
  | { readonly kind: "mappingRule"; readonly ruleId: string }
  | { readonly kind: "targetEntailment"; readonly ruleId: string };

export interface MappingApplicationStep {
  readonly index: number;
  readonly before: readonly TokenId[];
  readonly premises: readonly TokenId[];
  readonly conclusion: TokenId;
  readonly after: readonly TokenId[];
  readonly reason: MappingApplicationReason;
}

export interface MappingApplication {
  readonly sourceState: readonly TokenId[];
  readonly targetState: readonly TokenId[];
  readonly activations: readonly MappingRuleActivation[];
}

export interface MappingStepsComputation extends MappingApplication {
  readonly steps: readonly MappingApplicationStep[];
}

export interface FixedPointIterationStep {
  /** One-based number of this application of the endomap. */
  readonly index: number;
  readonly before: readonly TokenId[];
  readonly after: readonly TokenId[];
  /** Tokens learned by this application; empty exactly at stabilization. */
  readonly newTokens: readonly TokenId[];
  readonly activations: readonly MappingRuleActivation[];
}

export interface FixedPointComputation {
  /** The ascending Kleene chain ⊥ = x₀ ⊂ x₁ ⊂ … ⊂ xₙ of distinct iterates. */
  readonly iterates: readonly (readonly TokenId[])[];
  /**
   * Every application of the endomap, in order. The final step repeats the
   * fixed point (`newTokens` is empty) and is the stabilization witness.
   */
  readonly steps: readonly FixedPointIterationStep[];
  /** The least fixed point: the last iterate, which the endomap repeats. */
  readonly fixedPoint: readonly TokenId[];
  /** How many applications strictly grew the state before it repeated. */
  readonly stabilizedAfter: number;
}

export type BottomSemanticEvent =
  | {
      readonly kind: "bottomComputed";
      readonly delta: TokenId;
      readonly state: readonly TokenId[];
    }
  | {
      readonly kind: "stateValidated";
      readonly state: readonly TokenId[];
    };

export type EntailmentReason =
  | { readonly kind: "distinguishedToken" }
  | { readonly kind: "reflexivity" }
  | { readonly kind: "declaredRule"; readonly ruleId: string };

export type ClosureSemanticEvent =
  | {
      readonly kind: "closureStarted";
      readonly input: readonly TokenId[];
    }
  | {
      readonly kind: "tokenEntailed";
      readonly premises: readonly TokenId[];
      readonly conclusion: TokenId;
      readonly reason: EntailmentReason;
    }
  | {
      readonly kind: "closureCompleted";
      readonly input: readonly TokenId[];
      readonly result: readonly TokenId[];
    }
  | {
      readonly kind: "stateValidated";
      readonly state: readonly TokenId[];
    };

export interface BottomComputation {
  readonly state: readonly TokenId[];
  readonly deltaToken: TokenDefinition;
  readonly events: readonly BottomSemanticEvent[];
}

export interface ClosureComputation {
  readonly input: readonly TokenId[];
  readonly state: readonly TokenId[];
  readonly events: readonly ClosureSemanticEvent[];
}

export interface ClosureStep {
  readonly index: number;
  readonly before: readonly TokenId[];
  readonly premises: readonly TokenId[];
  readonly conclusion: TokenId;
  readonly after: readonly TokenId[];
  readonly reason: EntailmentReason;
}

export interface ClosureStepsComputation extends ClosureComputation {
  readonly steps: readonly ClosureStep[];
}

export type StateCandidateInspection =
  | {
      readonly kind: "inconsistent";
      readonly candidate: readonly TokenId[];
      readonly witness: readonly TokenId[];
    }
  | {
      readonly kind: "notClosed";
      readonly candidate: readonly TokenId[];
      readonly closure: ClosureStepsComputation;
      readonly missingTokens: readonly TokenId[];
    }
  | {
      readonly kind: "state";
      readonly candidate: readonly TokenId[];
      readonly closure: ClosureStepsComputation;
    };

export type EntailmentExplanation =
  | {
      readonly entailed: true;
      readonly input: readonly TokenId[];
      readonly token: TokenId;
      readonly state: readonly TokenId[];
      readonly step: ClosureStep;
      readonly derivation: readonly ClosureStep[];
    }
  | {
      readonly entailed: false;
      readonly input: readonly TokenId[];
      readonly token: TokenId;
      readonly state: readonly TokenId[];
      readonly reason: "notEntailed";
    };

export interface StateEnumeration {
  readonly states: readonly (readonly TokenId[])[];
}

export interface CoverRelationEdge {
  readonly lower: readonly TokenId[];
  readonly upper: readonly TokenId[];
}

export interface CoverRelationSemanticEvent {
  readonly kind: "coverRelationComputed";
  readonly edges: readonly CoverRelationEdge[];
}

export interface CoverRelationComputation extends StateEnumeration {
  readonly edges: readonly CoverRelationEdge[];
  readonly events: readonly CoverRelationSemanticEvent[];
}

export interface InconsistencyEvent {
  readonly kind: "inconsistencyFound";
  readonly category: "minimalInconsistentSet";
  readonly candidate: readonly TokenId[];
  readonly witness: readonly TokenId[];
}

export type ObservationAttempt =
  | {
      readonly ok: true;
      readonly closure: ClosureComputation;
    }
  | {
      readonly ok: false;
      readonly state: readonly TokenId[];
      readonly event: InconsistencyEvent;
    };

export type SemanticErrorCategory =
  | "deltaInInconsistentSet"
  | "duplicateInconsistentSet"
  | "duplicateInconsistentSetToken"
  | "duplicateMappingRuleId"
  | "duplicateMappingRulePremise"
  | "duplicateRuleId"
  | "duplicateRulePremise"
  | "duplicateTokenId"
  | "entailmentBreaksConsistency"
  | "inconsistentBottom"
  | "inconsistentMappingRulePremises"
  | "inconsistentRulePremises"
  | "inconsistentSetTooSmall"
  | "mappingBreaksConsistency"
  | "mappingInputNotState"
  | "mappingSourceSystemMismatch"
  | "mappingSourceSystemUnidentified"
  | "mappingTargetSystemMismatch"
  | "mappingTargetSystemUnidentified"
  | "mappingValidationBudgetExceeded"
  | "minimalInconsistentSet"
  | "nonMinimalInconsistentSet"
  | "unknownDelta"
  | "unknownSourceTokenReference"
  | "unknownTargetTokenReference"
  | "unknownTokenReference";

export interface MappingBreaksConsistencyErrorDetails {
  readonly kind: "mappingBreaksConsistency";
  readonly sourceSet: readonly TokenId[];
  readonly targetWitness: readonly TokenId[];
  readonly ruleIds: readonly string[];
}

export type MappingInputNotStateErrorDetails =
  | {
      readonly kind: "mappingInputNotState";
      readonly reason: "inconsistent";
      readonly candidate: readonly TokenId[];
      readonly conflictWitness: readonly TokenId[];
    }
  | {
      readonly kind: "mappingInputNotState";
      readonly reason: "notClosed";
      readonly candidate: readonly TokenId[];
      readonly missingTokens: readonly TokenId[];
    };

export interface MappingSystemIdentityErrorDetails {
  readonly kind: "mappingSystemIdentity";
  readonly role: "source" | "target";
  readonly expectedSystemId: string;
  readonly actualSystemId: string | null;
}

export interface MappingValidationBudgetErrorDetails {
  readonly kind: "mappingValidationBudgetExceeded";
  readonly estimate: MappingValidationEstimate;
  readonly maxSubsetChecks: number;
}

export type SemanticErrorDetails =
  | MappingBreaksConsistencyErrorDetails
  | MappingInputNotStateErrorDetails
  | MappingSystemIdentityErrorDetails
  | MappingValidationBudgetErrorDetails;

export class SemanticError extends Error {
  readonly category: SemanticErrorCategory;
  readonly witness: readonly string[];
  readonly details: SemanticErrorDetails | undefined;

  constructor(
    category: SemanticErrorCategory,
    witness: readonly string[],
    message: string,
    details?: SemanticErrorDetails,
  ) {
    super(message);
    this.name = "SemanticError";
    this.category = category;
    this.witness = witness;
    this.details = details;
  }
}

function compareIds(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function sortIds(ids: Iterable<TokenId>): TokenId[] {
  return [...ids].sort(compareIds);
}

function normalizeTokenSet(ids: Iterable<TokenId>): TokenId[] {
  return sortIds(new Set(ids));
}

function firstDuplicateLexically(
  ids: readonly string[],
): string | undefined {
  const counts = new Map<string, number>();
  for (const id of ids) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return sortIds(
    [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([id]) => id),
  )[0];
}

function requireKnownToken(
  tokenIds: Pick<ReadonlySet<TokenId>, "has">,
  id: TokenId,
  context: string,
): void {
  if (!tokenIds.has(id)) {
    throw new SemanticError(
      "unknownTokenReference",
      [id],
      `${context} refers to unknown token '${id}'.`,
    );
  }
}

function validateReferences(
  system: InformationSystemDefinition,
): void {
  const tokenIds = system.tokens.map(({ id }) => id);
  const duplicateTokenId = firstDuplicateLexically(tokenIds);
  if (duplicateTokenId !== undefined) {
    throw new SemanticError(
      "duplicateTokenId",
      [duplicateTokenId],
      `Token ID '${duplicateTokenId}' is declared more than once.`,
    );
  }

  const tokenById = new Map(system.tokens.map((token) => [token.id, token]));
  if (!tokenById.has(system.delta)) {
    throw new SemanticError(
      "unknownDelta",
      [system.delta],
      `The distinguished token '${system.delta}' is not declared.`,
    );
  }

  const ruleIds = system.entailmentRules.map(({ id }) => id);
  const duplicateRuleId = firstDuplicateLexically(ruleIds);
  if (duplicateRuleId !== undefined) {
    throw new SemanticError(
      "duplicateRuleId",
      [duplicateRuleId],
      `Rule ID '${duplicateRuleId}' is declared more than once.`,
    );
  }

  const knownIds = new Set(tokenIds);
  const unknownConflictToken = sortIds(
    system.minimalInconsistentSets
      .flatMap((conflict) => conflict)
      .filter((id) => !knownIds.has(id)),
  )[0];
  if (unknownConflictToken !== undefined) {
    requireKnownToken(knownIds, unknownConflictToken, "An inconsistent set");
  }

  const rules = [...system.entailmentRules].sort((left, right) =>
    compareIds(left.id, right.id),
  );
  for (const rule of rules) {
    const unknownPremise = sortIds(
      rule.premises.filter((premise) => !knownIds.has(premise)),
    )[0];
    if (unknownPremise !== undefined) {
      requireKnownToken(knownIds, unknownPremise, `Rule '${rule.id}'`);
    }
    requireKnownToken(knownIds, rule.conclusion, `Rule '${rule.id}'`);
  }
}

function canonicalConflicts(
  system: InformationSystemDefinition,
): readonly (readonly TokenId[])[] {
  return system.minimalInconsistentSets
    .map((conflict) => sortIds(conflict))
    .sort((left, right) => compareIds(left.join("\0"), right.join("\0")));
}

function findConflictAmong(
  conflicts: readonly (readonly TokenId[])[],
  candidate: ReadonlySet<TokenId>,
): readonly TokenId[] | undefined {
  return conflicts.find((conflict) =>
    conflict.every((tokenId) => candidate.has(tokenId)),
  );
}

function findConflict(
  system: InformationSystemDefinition,
  candidate: ReadonlySet<TokenId>,
): readonly TokenId[] | undefined {
  return findConflictAmong(canonicalConflicts(system), candidate);
}

function sortRulesById<Rule extends { readonly id: string }>(
  rules: readonly Rule[],
): readonly Rule[] {
  return [...rules].sort((left, right) => compareIds(left.id, right.id));
}

interface CanonicalConflictDeclaration {
  readonly original: readonly TokenId[];
  readonly tokens: readonly TokenId[];
  readonly key: string;
}

function compareTokenSets(
  left: readonly TokenId[],
  right: readonly TokenId[],
): number {
  const sizeDifference = left.length - right.length;
  return sizeDifference === 0
    ? compareIds(left.join("\0"), right.join("\0"))
    : sizeDifference;
}

function validateConflictDeclarations(
  system: InformationSystemDefinition,
): void {
  const declarations: CanonicalConflictDeclaration[] =
    system.minimalInconsistentSets
      .map((original) => {
        const tokens = normalizeTokenSet(original);
        return { original, tokens, key: tokens.join("\0") };
      })
      .sort((left, right) => compareTokenSets(left.tokens, right.tokens));

  for (const declaration of declarations) {
    const duplicateToken = firstDuplicateLexically(declaration.original);
    if (duplicateToken !== undefined) {
      throw new SemanticError(
        "duplicateInconsistentSetToken",
        [duplicateToken],
        `The inconsistent-set declaration {${declaration.original.join(", ")}} repeats token '${duplicateToken}'.`,
      );
    }

    if (declaration.tokens.length < 2) {
      throw new SemanticError(
        "inconsistentSetTooSmall",
        declaration.tokens,
        `An inconsistent-set declaration must contain at least two distinct tokens; found {${declaration.tokens.join(", ")}}.`,
      );
    }

    if (declaration.tokens.includes(system.delta)) {
      throw new SemanticError(
        "deltaInInconsistentSet",
        declaration.tokens,
        `The inconsistent set {${declaration.tokens.join(", ")}} contains the distinguished token '${system.delta}'.`,
      );
    }
  }

  const declarationByKey = new Map<string, CanonicalConflictDeclaration>();
  for (const declaration of declarations) {
    if (declarationByKey.has(declaration.key)) {
      throw new SemanticError(
        "duplicateInconsistentSet",
        declaration.tokens,
        `The inconsistent set {${declaration.tokens.join(", ")}} is declared more than once.`,
      );
    }
    declarationByKey.set(declaration.key, declaration);
  }

  for (let largerIndex = 0; largerIndex < declarations.length; largerIndex += 1) {
    const larger = declarations[largerIndex];
    if (larger === undefined) {
      throw new Error("Conflict validation reached an unknown declaration.");
    }

    for (let smallerIndex = 0; smallerIndex < largerIndex; smallerIndex += 1) {
      const smaller = declarations[smallerIndex];
      if (
        smaller !== undefined &&
        smaller.tokens.length < larger.tokens.length &&
        isSubset(smaller.tokens, larger.tokens)
      ) {
        throw new SemanticError(
          "nonMinimalInconsistentSet",
          larger.tokens,
          `The inconsistent set {${larger.tokens.join(", ")}} is not minimal because it contains {${smaller.tokens.join(", ")}}.`,
        );
      }
    }
  }
}

function validateRulePremises(system: InformationSystemDefinition): void {
  const rules = [...system.entailmentRules].sort((left, right) =>
    compareIds(left.id, right.id),
  );

  for (const rule of rules) {
    const duplicatePremise = firstDuplicateLexically(rule.premises);
    if (duplicatePremise !== undefined) {
      throw new SemanticError(
        "duplicateRulePremise",
        [duplicatePremise],
        `Rule '${rule.id}' repeats premise '${duplicatePremise}'.`,
      );
    }

    const witness = findConflict(system, new Set(rule.premises));
    if (witness !== undefined) {
      throw new SemanticError(
        "inconsistentRulePremises",
        witness,
        `Rule '${rule.id}' has the inconsistent premise set {${normalizeTokenSet(rule.premises).join(", ")}}.`,
      );
    }
  }
}

function closeUnderSortedRules(
  delta: TokenId,
  sortedRules: readonly EntailmentRuleDefinition[],
  input: Iterable<TokenId>,
): Set<TokenId> {
  const result = new Set<TokenId>([delta, ...input]);

  let changed = true;
  while (changed) {
    changed = false;
    for (const rule of sortedRules) {
      const applies = rule.premises.every((premise) => result.has(premise));
      if (applies && !result.has(rule.conclusion)) {
        result.add(rule.conclusion);
        changed = true;
      }
    }
  }

  return result;
}

function deriveClosureTokens(
  system: InformationSystemDefinition,
  input: Iterable<TokenId>,
): Set<TokenId> {
  return closeUnderSortedRules(
    system.delta,
    sortRulesById(system.entailmentRules),
    input,
  );
}

function* enumerateTokenSubsets(
  tokenIds: readonly TokenId[],
): Generator<readonly TokenId[]> {
  const selected: TokenId[] = [];

  function* choose(
    startIndex: number,
    remaining: number,
  ): Generator<readonly TokenId[]> {
    if (remaining === 0) {
      yield [...selected];
      return;
    }

    const lastStartIndex = tokenIds.length - remaining;
    for (let index = startIndex; index <= lastStartIndex; index += 1) {
      const tokenId = tokenIds[index];
      if (tokenId === undefined) {
        throw new Error("Subset enumeration reached an unknown token index.");
      }
      selected.push(tokenId);
      yield* choose(index + 1, remaining - 1);
      selected.pop();
    }
  }

  for (let size = 0; size <= tokenIds.length; size += 1) {
    yield* choose(0, size);
  }
}

interface CachedSystemValidation {
  readonly fingerprint: string;
  readonly validation: SystemValidation;
}

const validatedSystems = new WeakMap<
  InformationSystemDefinition,
  CachedSystemValidation
>();

function systemSemanticFingerprint(
  system: InformationSystemDefinition,
): string {
  return JSON.stringify([
    system.tokens.map(({ id }) => id),
    system.delta,
    system.minimalInconsistentSets,
    system.entailmentRules.map((rule) => [
      rule.id,
      rule.premises,
      rule.conclusion,
    ]),
  ]);
}

/**
 * Validate the complete finite information-system presentation.
 *
 * The exhaustive consistent-subset sweep runs once per semantically distinct
 * system object; repeated calls with an unmodified definition return the
 * cached result so every public operation can revalidate cheaply.
 */
export function validateSystem(
  system: InformationSystemDefinition,
): SystemValidation {
  const fingerprint = systemSemanticFingerprint(system);
  const cached = validatedSystems.get(system);
  if (cached !== undefined && cached.fingerprint === fingerprint) {
    return cached.validation;
  }

  validateReferences(system);
  validateConflictDeclarations(system);
  validateRulePremises(system);

  const tokenIds = sortIds(system.tokens.map(({ id }) => id));
  const conflicts = canonicalConflicts(system);
  const rules = sortRulesById(system.entailmentRules);
  let checkedConsistentSets = 0;

  for (const input of enumerateTokenSubsets(tokenIds)) {
    if (findConflictAmong(conflicts, new Set(input)) !== undefined) {
      continue;
    }

    checkedConsistentSets += 1;
    const closure = closeUnderSortedRules(system.delta, rules, input);
    const witness = findConflictAmong(conflicts, closure);
    if (witness !== undefined) {
      const isBottomInput = input.length === 0;
      throw new SemanticError(
        isBottomInput ? "inconsistentBottom" : "entailmentBreaksConsistency",
        witness,
        isBottomInput
          ? `Bottom entails the inconsistent token set {${witness.join(", ")}}.`
          : `Entailment from the consistent set {${input.join(", ")}} derives the inconsistent token set {${witness.join(", ")}}.`,
      );
    }
  }

  const validation: SystemValidation = { ok: true, checkedConsistentSets };
  validatedSystems.set(system, { fingerprint, validation });
  return validation;
}

function powersetCandidateCount(tokenCount: number): number {
  const count = 2 ** tokenCount;
  return Number.isSafeInteger(count) ? count : Number.MAX_SAFE_INTEGER;
}

function saturatingSafeIntegerSum(values: readonly number[]): number {
  let total = 0;
  for (const value of values) {
    if (value > Number.MAX_SAFE_INTEGER - total) {
      return Number.MAX_SAFE_INTEGER;
    }
    total += value;
  }
  return total;
}

/** Estimate the exhaustive subset work performed by mapping validation. */
export function estimateMappingValidation(
  source: InformationSystemDefinition,
  target: InformationSystemDefinition,
): MappingValidationEstimate {
  const sourceSystemSubsetCandidates = powersetCandidateCount(
    source.tokens.length,
  );
  const targetSystemSubsetCandidates = powersetCandidateCount(
    target.tokens.length,
  );
  const mappingSubsetCandidates = sourceSystemSubsetCandidates;

  return Object.freeze({
    sourceTokenCount: source.tokens.length,
    targetTokenCount: target.tokens.length,
    sourceSystemSubsetCandidates,
    targetSystemSubsetCandidates,
    mappingSubsetCandidates,
    totalSubsetCandidates: saturatingSafeIntegerSum([
      sourceSystemSubsetCandidates,
      targetSystemSubsetCandidates,
      mappingSubsetCandidates,
    ]),
  });
}

function mappingValidationBudget(
  options: MappingValidationOptions,
): number {
  const maxSubsetChecks =
    options.maxSubsetChecks ??
    DEFAULT_MAPPING_VALIDATION_MAX_SUBSET_CHECKS;
  if (!Number.isSafeInteger(maxSubsetChecks) || maxSubsetChecks < 1) {
    throw new RangeError(
      "maxSubsetChecks must be a positive safe integer.",
    );
  }
  return maxSubsetChecks;
}

function requireMappingValidationWithinBudget(
  source: InformationSystemDefinition,
  target: InformationSystemDefinition,
  options: MappingValidationOptions,
): MappingValidationEstimate {
  const estimate = estimateMappingValidation(source, target);
  const maxSubsetChecks = mappingValidationBudget(options);
  if (estimate.totalSubsetCandidates > maxSubsetChecks) {
    throw new SemanticError(
      "mappingValidationBudgetExceeded",
      [String(estimate.totalSubsetCandidates), String(maxSubsetChecks)],
      `Mapping validation would inspect up to ${estimate.totalSubsetCandidates} subsets, exceeding the configured limit of ${maxSubsetChecks}.`,
      {
        kind: "mappingValidationBudgetExceeded",
        estimate,
        maxSubsetChecks,
      },
    );
  }
  return estimate;
}

interface PartialPersistedMappingIdentity {
  readonly sourceSystemId?: string;
  readonly targetSystemId?: string;
}

function persistedMappingIdentity(
  mapping: ApproximableMappingDefinition,
): PartialPersistedMappingIdentity {
  const candidate = mapping as ApproximableMappingDefinition & {
    readonly sourceSystemId?: unknown;
    readonly targetSystemId?: unknown;
  };
  return {
    ...(typeof candidate.sourceSystemId === "string"
      ? { sourceSystemId: candidate.sourceSystemId }
      : {}),
    ...(typeof candidate.targetSystemId === "string"
      ? { targetSystemId: candidate.targetSystemId }
      : {}),
  };
}

function informationSystemId(
  system: InformationSystemDefinition,
): string | undefined {
  const candidate = system as InformationSystemDefinition & {
    readonly id?: unknown;
  };
  return typeof candidate.id === "string" ? candidate.id : undefined;
}

function validateMappingSystemIdentity(
  source: InformationSystemDefinition,
  target: InformationSystemDefinition,
  mapping: ApproximableMappingDefinition,
): void {
  const identity = persistedMappingIdentity(mapping);

  if (identity.sourceSystemId !== undefined) {
    const sourceSystemId = informationSystemId(source);
    if (sourceSystemId === undefined) {
      throw new SemanticError(
        "mappingSourceSystemUnidentified",
        [identity.sourceSystemId],
        `Persisted mapping '${mapping.id}' expects source system '${identity.sourceSystemId}', but the supplied source system has no persisted ID.`,
        {
          kind: "mappingSystemIdentity",
          role: "source",
          expectedSystemId: identity.sourceSystemId,
          actualSystemId: null,
        },
      );
    }
    if (sourceSystemId !== identity.sourceSystemId) {
      throw new SemanticError(
        "mappingSourceSystemMismatch",
        [identity.sourceSystemId, sourceSystemId],
        `Persisted mapping '${mapping.id}' expects source system '${identity.sourceSystemId}', not '${sourceSystemId}'.`,
        {
          kind: "mappingSystemIdentity",
          role: "source",
          expectedSystemId: identity.sourceSystemId,
          actualSystemId: sourceSystemId,
        },
      );
    }
  }

  if (identity.targetSystemId !== undefined) {
    const targetSystemId = informationSystemId(target);
    if (targetSystemId === undefined) {
      throw new SemanticError(
        "mappingTargetSystemUnidentified",
        [identity.targetSystemId],
        `Persisted mapping '${mapping.id}' expects target system '${identity.targetSystemId}', but the supplied target system has no persisted ID.`,
        {
          kind: "mappingSystemIdentity",
          role: "target",
          expectedSystemId: identity.targetSystemId,
          actualSystemId: null,
        },
      );
    }
    if (targetSystemId !== identity.targetSystemId) {
      throw new SemanticError(
        "mappingTargetSystemMismatch",
        [identity.targetSystemId, targetSystemId],
        `Persisted mapping '${mapping.id}' expects target system '${identity.targetSystemId}', not '${targetSystemId}'.`,
        {
          kind: "mappingSystemIdentity",
          role: "target",
          expectedSystemId: identity.targetSystemId,
          actualSystemId: targetSystemId,
        },
      );
    }
  }
}

function validateMappingRuleDeclarations(
  source: InformationSystemDefinition,
  target: InformationSystemDefinition,
  mapping: ApproximableMappingDefinition,
): readonly ApproximableMappingRuleDefinition[] {
  const duplicateRuleId = firstDuplicateLexically(
    mapping.rules.map(({ id }) => id),
  );
  if (duplicateRuleId !== undefined) {
    throw new SemanticError(
      "duplicateMappingRuleId",
      [duplicateRuleId],
      `Mapping '${mapping.id}' declares rule ID '${duplicateRuleId}' more than once.`,
    );
  }

  const sourceTokenIds = new Set(source.tokens.map(({ id }) => id));
  const targetTokenIds = new Set(target.tokens.map(({ id }) => id));
  const rules = [...mapping.rules].sort((left, right) =>
    compareIds(left.id, right.id),
  );

  for (const rule of rules) {
    const unknownPremise = sortIds(
      rule.premises.filter((premise) => !sourceTokenIds.has(premise)),
    )[0];
    if (unknownPremise !== undefined) {
      throw new SemanticError(
        "unknownSourceTokenReference",
        [unknownPremise],
        `Mapping rule '${rule.id}' refers to unknown source token '${unknownPremise}'.`,
      );
    }

    if (!targetTokenIds.has(rule.conclusion)) {
      throw new SemanticError(
        "unknownTargetTokenReference",
        [rule.conclusion],
        `Mapping rule '${rule.id}' refers to unknown target token '${rule.conclusion}'.`,
      );
    }

    const duplicatePremise = firstDuplicateLexically(rule.premises);
    if (duplicatePremise !== undefined) {
      throw new SemanticError(
        "duplicateMappingRulePremise",
        [duplicatePremise],
        `Mapping rule '${rule.id}' repeats source premise '${duplicatePremise}'.`,
      );
    }

    const witness = findConflict(source, new Set(rule.premises));
    if (witness !== undefined) {
      throw new SemanticError(
        "inconsistentMappingRulePremises",
        witness,
        `Mapping rule '${rule.id}' has the inconsistent source premise set {${normalizeTokenSet(rule.premises).join(", ")}}.`,
      );
    }
  }

  return rules;
}

/** Validate finite generator rules as an approximable mapping. */
export function validateMapping(
  source: InformationSystemDefinition,
  target: InformationSystemDefinition,
  mapping: ApproximableMappingDefinition,
  options: MappingValidationOptions = {},
): MappingValidation {
  validateMappingSystemIdentity(source, target, mapping);
  requireMappingValidationWithinBudget(source, target, options);
  validateSystem(source);
  validateSystem(target);
  const rules = validateMappingRuleDeclarations(source, target, mapping);
  const sourceTokenIds = sortIds(source.tokens.map(({ id }) => id));
  const sourceConflicts = canonicalConflicts(source);
  const sourceRules = sortRulesById(source.entailmentRules);
  const targetConflicts = canonicalConflicts(target);
  const targetRules = sortRulesById(target.entailmentRules);
  let checkedConsistentSourceSets = 0;

  for (const sourceSet of enumerateTokenSubsets(sourceTokenIds)) {
    const sourceTokens = new Set(sourceSet);
    if (findConflictAmong(sourceConflicts, sourceTokens) !== undefined) {
      continue;
    }

    checkedConsistentSourceSets += 1;
    const sourceClosure = closeUnderSortedRules(
      source.delta,
      sourceRules,
      sourceSet,
    );
    const activeRules = rules.filter((rule) =>
      rule.premises.every((premise) => sourceClosure.has(premise)),
    );
    const conclusions = new Set(
      activeRules.map(({ conclusion }) => conclusion),
    );
    const targetClosure = closeUnderSortedRules(
      target.delta,
      targetRules,
      conclusions,
    );
    const witness = findConflictAmong(targetConflicts, targetClosure);
    if (witness !== undefined) {
      const ruleIds = activeRules.map(({ id }) => id);
      throw new SemanticError(
        "mappingBreaksConsistency",
        witness,
        `Mapping '${mapping.id}' sends the consistent source set {${sourceSet.join(", ")}} to the inconsistent target token set {${witness.join(", ")}} via rules ${ruleIds.map((id) => `'${id}'`).join(", ")}.`,
        {
          kind: "mappingBreaksConsistency",
          sourceSet,
          targetWitness: witness,
          ruleIds,
        },
      );
    }
  }

  return { ok: true, checkedConsistentSourceSets };
}

function requireSourceState(
  source: InformationSystemDefinition,
  candidate: readonly TokenId[],
): readonly TokenId[] {
  const sourceTokenIds = new Set(source.tokens.map(({ id }) => id));
  const normalizedCandidate = normalizeTokenSet(candidate);
  const unknownToken = normalizedCandidate.find(
    (tokenId) => !sourceTokenIds.has(tokenId),
  );
  if (unknownToken !== undefined) {
    throw new SemanticError(
      "unknownSourceTokenReference",
      [unknownToken],
      `The mapping input refers to unknown source token '${unknownToken}'.`,
    );
  }

  const conflict = findConflict(source, new Set(normalizedCandidate));
  const closure = sortIds(deriveClosureTokens(source, normalizedCandidate));
  const candidateTokens = new Set(normalizedCandidate);
  const missingTokens = closure.filter(
    (tokenId) => !candidateTokens.has(tokenId),
  );
  const isClosed =
    normalizedCandidate.length === closure.length &&
    normalizedCandidate.every((tokenId, index) => tokenId === closure[index]);
  if (conflict !== undefined) {
    throw new SemanticError(
      "mappingInputNotState",
      conflict,
      `A mapping can only be applied to a source state; {${normalizedCandidate.join(", ")}} is inconsistent because it contains {${conflict.join(", ")}}.`,
      {
        kind: "mappingInputNotState",
        reason: "inconsistent",
        candidate: normalizedCandidate,
        conflictWitness: conflict,
      },
    );
  }
  if (!isClosed) {
    throw new SemanticError(
      "mappingInputNotState",
      missingTokens,
      `A mapping can only be applied to a source state; {${normalizedCandidate.join(", ")}} is not entailment-closed and is missing {${missingTokens.join(", ")}}.`,
      {
        kind: "mappingInputNotState",
        reason: "notClosed",
        candidate: normalizedCandidate,
        missingTokens,
      },
    );
  }

  return normalizedCandidate;
}

function applyMappingValidated(
  source: InformationSystemDefinition,
  target: InformationSystemDefinition,
  mapping: ApproximableMappingDefinition,
  sourceState: readonly TokenId[],
): MappingStepsComputation {
  const normalizedSourceState = requireSourceState(source, sourceState);
  const sourceTokens = new Set(normalizedSourceState);
  const activeRules = [...mapping.rules]
    .sort((left, right) => compareIds(left.id, right.id))
    .filter((rule) =>
      rule.premises.every((premise) => sourceTokens.has(premise)),
    );
  const activations: MappingRuleActivation[] = activeRules.map((rule) => ({
    ruleId: rule.id,
    premises: normalizeTokenSet(rule.premises),
    conclusion: rule.conclusion,
  }));
  const targetTokens = new Set<TokenId>();
  const steps: MappingApplicationStep[] = [];

  function addStep(
    premises: readonly TokenId[],
    conclusion: TokenId,
    reason: MappingApplicationReason,
  ): void {
    const before = sortIds(targetTokens);
    targetTokens.add(conclusion);
    steps.push({
      index: steps.length,
      before,
      premises: normalizeTokenSet(premises),
      conclusion,
      after: sortIds(targetTokens),
      reason,
    });
  }

  const targetRules = [...target.entailmentRules].sort((left, right) =>
    compareIds(left.id, right.id),
  );
  function closeTarget(): void {
    let changed = true;
    while (changed) {
      changed = false;
      for (const rule of targetRules) {
        const applies = rule.premises.every((premise) =>
          targetTokens.has(premise),
        );
        if (applies && !targetTokens.has(rule.conclusion)) {
          addStep(rule.premises, rule.conclusion, {
            kind: "targetEntailment",
            ruleId: rule.id,
          });
          changed = true;
        }
      }
    }
  }

  addStep([], target.delta, { kind: "targetDistinguishedToken" });

  // Establish target bottom first so unconditional target information is never
  // presented as if it had been caused by a source-dependent mapping rule.
  closeTarget();

  for (const activation of activations) {
    addStep(activation.premises, activation.conclusion, {
      kind: "mappingRule",
      ruleId: activation.ruleId,
    });
  }

  closeTarget();

  return {
    sourceState: normalizedSourceState,
    targetState: sortIds(targetTokens),
    activations,
    steps,
  };
}

function omitMappingSteps(
  computation: MappingStepsComputation,
): MappingApplication {
  return {
    sourceState: computation.sourceState,
    targetState: computation.targetState,
    activations: computation.activations,
  };
}

interface CompiledMappingData {
  readonly source: InformationSystemDefinition;
  readonly target: InformationSystemDefinition;
  readonly mapping: ApproximableMappingDefinition;
}

const compiledMappingData = new WeakMap<
  CompiledApproximableMapping,
  CompiledMappingData
>();

function snapshotInformationSystem(
  system: InformationSystemDefinition,
): InformationSystemDefinition {
  return {
    tokens: system.tokens.map((token) => ({ ...token })),
    delta: system.delta,
    minimalInconsistentSets: system.minimalInconsistentSets.map((conflict) => [
      ...conflict,
    ]),
    entailmentRules: system.entailmentRules.map((rule) => ({
      ...rule,
      premises: [...rule.premises],
    })),
  };
}

function snapshotApproximableMapping(
  mapping: ApproximableMappingDefinition,
): ApproximableMappingDefinition {
  return {
    id: mapping.id,
    title: mapping.title,
    description: mapping.description,
    rules: mapping.rules.map((rule) => ({
      ...rule,
      premises: [...rule.premises],
    })),
  };
}

/** Validate once and capture an immutable semantic snapshot for repeated use. */
export function compileMapping(
  source: InformationSystemDefinition,
  target: InformationSystemDefinition,
  mapping: ApproximableMappingDefinition,
  options: MappingValidationOptions = {},
): CompiledApproximableMapping {
  const validation = Object.freeze(
    validateMapping(source, target, mapping, options),
  );
  const handle: CompiledApproximableMapping = Object.freeze({
    kind: "compiledApproximableMapping",
    validation,
    estimate: estimateMappingValidation(source, target),
  });
  compiledMappingData.set(handle, {
    source: snapshotInformationSystem(source),
    target: snapshotInformationSystem(target),
    mapping: snapshotApproximableMapping(mapping),
  });
  return handle;
}

function requireCompiledMappingData(
  compiled: CompiledApproximableMapping,
): CompiledMappingData {
  const data = compiledMappingData.get(compiled);
  if (data === undefined) {
    throw new TypeError(
      "The supplied mapping handle was not produced by compileMapping.",
    );
  }
  return data;
}

/** Apply a compiled mapping without repeating exhaustive validation. */
export function applyCompiledMapping(
  compiled: CompiledApproximableMapping,
  sourceState: readonly TokenId[],
): MappingApplication {
  const { source, target, mapping } = requireCompiledMappingData(compiled);
  return omitMappingSteps(
    applyMappingValidated(source, target, mapping, sourceState),
  );
}

/** Apply a compiled mapping with its deterministic causal trace. */
export function applyCompiledMappingSteps(
  compiled: CompiledApproximableMapping,
  sourceState: readonly TokenId[],
): MappingStepsComputation {
  const { source, target, mapping } = requireCompiledMappingData(compiled);
  return applyMappingValidated(source, target, mapping, sourceState);
}

/** Apply a validated finite approximable mapping to an actual source state. */
export function applyMapping(
  source: InformationSystemDefinition,
  target: InformationSystemDefinition,
  mapping: ApproximableMappingDefinition,
  sourceState: readonly TokenId[],
  options: MappingValidationOptions = {},
): MappingApplication {
  return applyCompiledMapping(
    compileMapping(source, target, mapping, options),
    sourceState,
  );
}

/** Apply a mapping with deterministic generator and target-closure steps. */
export function applyMappingSteps(
  source: InformationSystemDefinition,
  target: InformationSystemDefinition,
  mapping: ApproximableMappingDefinition,
  sourceState: readonly TokenId[],
  options: MappingValidationOptions = {},
): MappingStepsComputation {
  return applyCompiledMappingSteps(
    compileMapping(source, target, mapping, options),
    sourceState,
  );
}

/**
 * Iterate an approximable endomapping from ⊥ to its least fixed point.
 *
 * Following Scott's token-level presentation (PRG-19, Theorem 4.1), the
 * least fixed point is reached by applying the mapping's rules repeatedly
 * starting from the least state. Approximable mappings are monotone, so
 * the iterates `⊥ ⊑ F(⊥) ⊑ F²(⊥) ⊑ …` form an ascending chain that must
 * repeat on a finite system; the first repetition is the least fixed
 * point, and the final recorded step is its stabilization witness.
 */
export function iterateFromBottom(
  system: InformationSystemDefinition,
  mapping: ApproximableMappingDefinition,
  options: MappingValidationOptions = {},
): FixedPointComputation {
  const compiled = compileMapping(system, system, mapping, options);
  const iterates: (readonly TokenId[])[] = [];
  const steps: FixedPointIterationStep[] = [];

  let current = computeBottom(system).state;
  iterates.push(current);

  const maximumApplications = system.tokens.length + 1;
  for (let index = 1; index <= maximumApplications; index += 1) {
    const application = applyCompiledMapping(compiled, current);
    const after = application.targetState;
    const currentTokens = new Set(current);
    const newTokens = after.filter((tokenId) => !currentTokens.has(tokenId));

    steps.push({
      index,
      before: current,
      after,
      newTokens,
      activations: application.activations,
    });

    if (newTokens.length === 0) {
      return {
        iterates,
        steps,
        fixedPoint: current,
        stabilizedAfter: iterates.length - 1,
      };
    }

    current = after;
    iterates.push(current);
  }

  throw new Error(
    "Fixed-point iteration exceeded the height of the finite system.",
  );
}

function requireKnownCandidateTokens(
  system: InformationSystemDefinition,
  candidate: readonly TokenId[],
  context: string,
): void {
  const knownIds = new Set(system.tokens.map(({ id }) => id));
  for (const tokenId of normalizeTokenSet(candidate)) {
    requireKnownToken(knownIds, tokenId, context);
  }
}

/** Decide consistency after validating the finite system definition. */
export function isConsistent(
  system: InformationSystemDefinition,
  candidate: readonly TokenId[],
): boolean {
  validateSystem(system);
  requireKnownCandidateTokens(system, candidate, "The consistency candidate");
  return findConflict(system, new Set(candidate)) === undefined;
}

/** Decide whether a finite token set is a consistent entailment-closed state. */
export function isState(
  system: InformationSystemDefinition,
  candidate: readonly TokenId[],
): boolean {
  validateSystem(system);
  requireKnownCandidateTokens(system, candidate, "The state candidate");

  const normalizedCandidate = normalizeTokenSet(candidate);
  if (findConflict(system, new Set(normalizedCandidate)) !== undefined) {
    return false;
  }

  const closure = sortIds(deriveClosureTokens(system, normalizedCandidate));
  return (
    normalizedCandidate.length === closure.length &&
    normalizedCandidate.every((tokenId, index) => tokenId === closure[index])
  );
}

/** Compute the least state as the closure of the distinguished token. */
export function computeBottom(
  system: InformationSystemDefinition,
): BottomComputation {
  validateSystem(system);
  const tokenById = new Map(system.tokens.map((token) => [token.id, token]));
  const result = deriveClosureTokens(system, [system.delta]);

  const state = sortIds(result);
  const deltaToken = tokenById.get(system.delta);
  if (deltaToken === undefined) {
    throw new SemanticError(
      "unknownDelta",
      [system.delta],
      `The distinguished token '${system.delta}' is not declared.`,
    );
  }

  return {
    state,
    deltaToken,
    events: [
      { kind: "bottomComputed", delta: system.delta, state },
      { kind: "stateValidated", state },
    ],
  };
}

function computeClosureDetailsValidated(
  system: InformationSystemDefinition,
  input: readonly TokenId[],
): ClosureStepsComputation {
  const tokenById = new Map(system.tokens.map((token) => [token.id, token]));
  const normalizedInput = normalizeTokenSet(input);

  for (const tokenId of normalizedInput) {
    requireKnownToken(tokenById, tokenId, "The closure input");
  }

  const inputCandidate = new Set<TokenId>([system.delta, ...normalizedInput]);
  const inputWitness = findConflict(system, inputCandidate);
  if (inputWitness !== undefined) {
    throw new SemanticError(
      "minimalInconsistentSet",
      inputWitness,
      `These tokens cannot form one state: {${inputWitness.join(", ")}}.`,
    );
  }

  const result = new Set<TokenId>();
  const events: ClosureSemanticEvent[] = [
    { kind: "closureStarted", input: normalizedInput },
  ];
  const steps: ClosureStep[] = [];

  function addStep(
    premises: readonly TokenId[],
    conclusion: TokenId,
    reason: EntailmentReason,
  ): void {
    const before = sortIds(result);
    result.add(conclusion);
    const after = sortIds(result);
    const normalizedPremises = normalizeTokenSet(premises);

    steps.push({
      index: steps.length,
      before,
      premises: normalizedPremises,
      conclusion,
      after,
      reason,
    });
    events.push({
      kind: "tokenEntailed",
      premises: normalizedPremises,
      conclusion,
      reason,
    });
  }

  addStep([], system.delta, { kind: "distinguishedToken" });

  for (const tokenId of normalizedInput) {
    if (tokenId !== system.delta) {
      addStep([tokenId], tokenId, { kind: "reflexivity" });
    }
  }

  const rules = [...system.entailmentRules].sort((left, right) =>
    compareIds(left.id, right.id),
  );
  let changed = true;
  while (changed) {
    changed = false;
    for (const rule of rules) {
      const applies = rule.premises.every((premise) => result.has(premise));
      if (applies && !result.has(rule.conclusion)) {
        addStep(rule.premises, rule.conclusion, {
          kind: "declaredRule",
          ruleId: rule.id,
        });
        changed = true;
      }
    }
  }

  const derivedWitness = findConflict(system, result);
  if (derivedWitness !== undefined) {
    throw new SemanticError(
      "entailmentBreaksConsistency",
      derivedWitness,
      `Entailment derives the inconsistent token set {${derivedWitness.join(", ")}}.`,
    );
  }

  const state = sortIds(result);
  events.push(
    { kind: "closureCompleted", input: normalizedInput, result: state },
    { kind: "stateValidated", state },
  );

  return { input: normalizedInput, state, events, steps };
}

function omitClosureSteps(
  computation: ClosureStepsComputation,
): ClosureComputation {
  return {
    input: computation.input,
    state: computation.state,
    events: computation.events,
  };
}

function computeClosureValidated(
  system: InformationSystemDefinition,
  input: readonly TokenId[],
): ClosureComputation {
  return omitClosureSteps(computeClosureDetailsValidated(system, input));
}

/** Close a consistent finite observation under the system's entailment rules. */
export function computeClosure(
  system: InformationSystemDefinition,
  input: readonly TokenId[],
): ClosureComputation {
  validateSystem(system);
  return computeClosureValidated(system, input);
}

/** Compute closure together with deterministic, inspectable causal steps. */
export function closureSteps(
  system: InformationSystemDefinition,
  input: readonly TokenId[],
): ClosureStepsComputation {
  validateSystem(system);
  return computeClosureDetailsValidated(system, input);
}

/** Explain whether an arbitrary finite token selection is a state. */
export function inspectStateCandidate(
  system: InformationSystemDefinition,
  candidate: readonly TokenId[],
): StateCandidateInspection {
  validateSystem(system);
  requireKnownCandidateTokens(system, candidate, "The state candidate");

  const normalizedCandidate = normalizeTokenSet(candidate);
  const witness = findConflict(system, new Set(normalizedCandidate));
  if (witness !== undefined) {
    return { kind: "inconsistent", candidate: normalizedCandidate, witness };
  }

  const closure = computeClosureDetailsValidated(system, normalizedCandidate);
  const candidateTokens = new Set(normalizedCandidate);
  const missingTokens = closure.state.filter(
    (tokenId) => !candidateTokens.has(tokenId),
  );

  return missingTokens.length === 0
    ? { kind: "state", candidate: normalizedCandidate, closure }
    : {
        kind: "notClosed",
        candidate: normalizedCandidate,
        closure,
        missingTokens,
      };
}

function entailmentDerivation(
  steps: readonly ClosureStep[],
  target: ClosureStep,
): readonly ClosureStep[] {
  const includedIndices = new Set<number>();

  function include(step: ClosureStep): void {
    if (includedIndices.has(step.index)) {
      return;
    }
    includedIndices.add(step.index);
    for (const premise of step.premises) {
      const premiseStep = steps.findLast(
        (candidate) =>
          candidate.index < step.index && candidate.conclusion === premise,
      );
      if (premiseStep !== undefined) {
        include(premiseStep);
      }
    }
  }

  include(target);
  return steps.filter((step) => includedIndices.has(step.index));
}

/** Explain why a known token is or is not entailed by a finite input set. */
export function explainEntailment(
  system: InformationSystemDefinition,
  input: readonly TokenId[],
  token: TokenId,
): EntailmentExplanation {
  validateSystem(system);
  requireKnownCandidateTokens(system, [token], "The entailment query");
  const computation = computeClosureDetailsValidated(system, input);

  const step = computation.steps.find(
    (candidate) => candidate.conclusion === token,
  );
  if (step === undefined) {
    return {
      entailed: false,
      input: computation.input,
      token,
      state: computation.state,
      reason: "notEntailed",
    };
  }

  return {
    entailed: true,
    input: computation.input,
    token,
    state: computation.state,
    step,
    derivation: entailmentDerivation(computation.steps, step),
  };
}

/** Enumerate every distinct state of a finite information system. */
export function enumerateStates(
  system: InformationSystemDefinition,
): StateEnumeration {
  validateSystem(system);
  const observationIds = sortIds(
    system.tokens
      .map(({ id }) => id)
      .filter((tokenId) => tokenId !== system.delta),
  );
  const statesByKey = new Map<string, readonly TokenId[]>();

  function visit(index: number, observations: readonly TokenId[]): void {
    if (index < observationIds.length) {
      const tokenId = observationIds[index];
      if (tokenId === undefined) {
        throw new Error("State enumeration reached an unknown token index.");
      }
      visit(index + 1, observations);
      visit(index + 1, [...observations, tokenId]);
      return;
    }

    try {
      const state = computeClosureValidated(system, observations).state;
      statesByKey.set(state.join("\0"), state);
    } catch (error) {
      if (
        error instanceof SemanticError &&
        error.category === "minimalInconsistentSet"
      ) {
        return;
      }
      throw error;
    }
  }

  visit(0, []);

  const states = [...statesByKey.values()].sort((left, right) => {
    const sizeDifference = left.length - right.length;
    return sizeDifference === 0
      ? compareIds(left.join("\0"), right.join("\0"))
      : sizeDifference;
  });

  return { states };
}

function isSubset(
  candidateSubset: readonly TokenId[],
  candidateSuperset: readonly TokenId[],
): boolean {
  const superset = new Set(candidateSuperset);
  return candidateSubset.every((tokenId) => superset.has(tokenId));
}

/** Compute the cover edges of the finite information order. */
export function computeCoverRelation(
  system: InformationSystemDefinition,
): CoverRelationComputation {
  const { states } = enumerateStates(system);
  const edges: CoverRelationEdge[] = [];

  for (const lower of states) {
    for (const upper of states) {
      if (lower.length >= upper.length || !isSubset(lower, upper)) {
        continue;
      }

      const hasIntermediateState = states.some(
        (intermediate) =>
          intermediate.length > lower.length &&
          intermediate.length < upper.length &&
          isSubset(lower, intermediate) &&
          isSubset(intermediate, upper),
      );

      if (!hasIntermediateState) {
        edges.push({ lower, upper });
      }
    }
  }

  return {
    states,
    edges,
    events: [{ kind: "coverRelationComputed", edges }],
  };
}

/**
 * Attempt to refine a validated state without mutating it on rejection.
 *
 * `currentState` must be consistent: an unclosed consistent selection is
 * closed before the refinement, while an inconsistent one is caller misuse
 * and throws a `SemanticError` with category `minimalInconsistentSet`. Only
 * the refused refinement itself is reported as `ok: false`.
 */
export function tryAddObservation(
  system: InformationSystemDefinition,
  currentState: readonly TokenId[],
  tokenId: TokenId,
): ObservationAttempt {
  validateSystem(system);
  const currentInput = currentState.filter((id) => id !== system.delta);
  const currentClosure = computeClosureValidated(system, currentInput);
  const candidate = sortIds(new Set([...currentClosure.state, tokenId]));
  const candidateInput = candidate.filter((id) => id !== system.delta);

  try {
    return {
      ok: true,
      closure: computeClosureValidated(system, candidateInput),
    };
  } catch (error) {
    if (
      error instanceof SemanticError &&
      error.category === "minimalInconsistentSet"
    ) {
      return {
        ok: false,
        state: currentClosure.state,
        event: {
          kind: "inconsistencyFound",
          category: "minimalInconsistentSet",
          candidate,
          witness: error.witness,
        },
      };
    }
    throw error;
  }
}
