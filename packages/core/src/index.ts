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
  | { readonly kind: "declaredRule"; readonly ruleId: string }
  | { readonly kind: "cut"; readonly through: readonly TokenId[] };

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
  | "duplicateRuleId"
  | "duplicateTokenId"
  | "entailmentBreaksConsistency"
  | "inconsistentBottom"
  | "minimalInconsistentSet"
  | "unknownDelta"
  | "unknownTokenReference";

export class SemanticError extends Error {
  readonly category: SemanticErrorCategory;
  readonly witness: readonly string[];

  constructor(
    category: SemanticErrorCategory,
    witness: readonly string[],
    message: string,
  ) {
    super(message);
    this.name = "SemanticError";
    this.category = category;
    this.witness = witness;
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

function firstDuplicate(ids: readonly string[]): string | undefined {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      return id;
    }
    seen.add(id);
  }
  return undefined;
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
): ReadonlyMap<TokenId, TokenDefinition> {
  const tokenIds = system.tokens.map(({ id }) => id);
  const duplicateTokenId = firstDuplicate(tokenIds);
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
  const duplicateRuleId = firstDuplicate(ruleIds);
  if (duplicateRuleId !== undefined) {
    throw new SemanticError(
      "duplicateRuleId",
      [duplicateRuleId],
      `Rule ID '${duplicateRuleId}' is declared more than once.`,
    );
  }

  const knownIds = new Set(tokenIds);
  for (const conflict of system.minimalInconsistentSets) {
    for (const id of conflict) {
      requireKnownToken(knownIds, id, "An inconsistent set");
    }
  }
  for (const rule of system.entailmentRules) {
    for (const premise of rule.premises) {
      requireKnownToken(knownIds, premise, `Rule '${rule.id}'`);
    }
    requireKnownToken(knownIds, rule.conclusion, `Rule '${rule.id}'`);
  }

  return tokenById;
}

function findConflict(
  system: InformationSystemDefinition,
  candidate: ReadonlySet<TokenId>,
): readonly TokenId[] | undefined {
  const conflicts = system.minimalInconsistentSets
    .map((conflict) => sortIds(conflict))
    .sort((left, right) => compareIds(left.join("\0"), right.join("\0")));

  return conflicts.find((conflict) =>
    conflict.every((tokenId) => candidate.has(tokenId)),
  );
}

/** Compute the least state as the closure of the distinguished token. */
export function computeBottom(
  system: InformationSystemDefinition,
): BottomComputation {
  const tokenById = validateReferences(system);
  const result = new Set<TokenId>([system.delta]);
  const rules = [...system.entailmentRules].sort((left, right) =>
    compareIds(left.id, right.id),
  );

  let changed = true;
  while (changed) {
    changed = false;
    for (const rule of rules) {
      const applies = rule.premises.every((premise) => result.has(premise));
      if (applies && !result.has(rule.conclusion)) {
        result.add(rule.conclusion);
        changed = true;
      }
    }
  }

  const witness = findConflict(system, result);
  if (witness !== undefined) {
    throw new SemanticError(
      "inconsistentBottom",
      witness,
      `Bottom entails the inconsistent token set {${witness.join(", ")}}.`,
    );
  }

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

/** Close a consistent finite observation under the system's entailment rules. */
export function computeClosure(
  system: InformationSystemDefinition,
  input: readonly TokenId[],
): ClosureComputation {
  const tokenById = validateReferences(system);
  const normalizedInput = sortIds(new Set(input));

  for (const tokenId of normalizedInput) {
    requireKnownToken(tokenById, tokenId, "The closure input");
  }

  const result = new Set<TokenId>([system.delta, ...normalizedInput]);
  const inputWitness = findConflict(system, result);
  if (inputWitness !== undefined) {
    throw new SemanticError(
      "minimalInconsistentSet",
      inputWitness,
      `These tokens cannot form one state: {${inputWitness.join(", ")}}.`,
    );
  }

  const events: ClosureSemanticEvent[] = [
    { kind: "closureStarted", input: normalizedInput },
    {
      kind: "tokenEntailed",
      premises: [],
      conclusion: system.delta,
      reason: { kind: "distinguishedToken" },
    },
  ];

  for (const tokenId of normalizedInput) {
    if (tokenId !== system.delta) {
      events.push({
        kind: "tokenEntailed",
        premises: [tokenId],
        conclusion: tokenId,
        reason: { kind: "reflexivity" },
      });
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
        result.add(rule.conclusion);
        events.push({
          kind: "tokenEntailed",
          premises: sortIds(rule.premises),
          conclusion: rule.conclusion,
          reason: { kind: "declaredRule", ruleId: rule.id },
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

  return { input: normalizedInput, state, events };
}

/** Enumerate every distinct state of a finite information system. */
export function enumerateStates(
  system: InformationSystemDefinition,
): StateEnumeration {
  validateReferences(system);
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
      const state = computeClosure(system, observations).state;
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

/** Attempt to refine a validated state without mutating it on rejection. */
export function tryAddObservation(
  system: InformationSystemDefinition,
  currentState: readonly TokenId[],
  tokenId: TokenId,
): ObservationAttempt {
  const currentInput = currentState.filter((id) => id !== system.delta);
  const currentClosure = computeClosure(system, currentInput);
  const candidate = sortIds(new Set([...currentClosure.state, tokenId]));
  const candidateInput = candidate.filter((id) => id !== system.delta);

  try {
    return { ok: true, closure: computeClosure(system, candidateInput) };
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
