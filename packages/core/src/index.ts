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

export interface BottomComputation {
  readonly state: readonly TokenId[];
  readonly deltaToken: TokenDefinition;
  readonly events: readonly BottomSemanticEvent[];
}

export type SemanticErrorCategory =
  | "duplicateRuleId"
  | "duplicateTokenId"
  | "inconsistentBottom"
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
  tokenIds: ReadonlySet<TokenId>,
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
