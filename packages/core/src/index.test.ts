import { describe, expect, it } from "vitest";

import {
  applyCompiledMapping,
  applyMapping,
  applyMappingSteps,
  closureSteps,
  compileMapping,
  computeBottom,
  computeClosure,
  computeCoverRelation,
  enumerateStates,
  estimateMappingValidation,
  explainEntailment,
  inspectStateCandidate,
  isConsistent,
  isState,
  SemanticError,
  tryAddObservation,
  validateMapping,
  validateSystem,
  type ApproximableMappingDefinition,
  type InformationSystemDefinition,
  type PersistedApproximableMappingDefinition,
  type PersistedInformationSystemDefinition,
  type SemanticErrorCategory,
} from "./index";

const flatBoolean: InformationSystemDefinition = {
  tokens: [
    {
      id: "delta",
      label: "Always-present token",
      symbol: "Δ",
      description: "The distinguished token present in every state.",
    },
    {
      id: "false",
      label: "false",
      description: "The observation that the Boolean is false.",
    },
    {
      id: "true",
      label: "true",
      description: "The observation that the Boolean is true.",
    },
  ],
  delta: "delta",
  minimalInconsistentSets: [["false", "true"]],
  entailmentRules: [],
};

const entailmentChain: InformationSystemDefinition = {
  tokens: [
    {
      id: "delta",
      label: "Always-present token",
      symbol: "Δ",
      description: "The distinguished token present in every state.",
    },
    { id: "a", label: "a", description: "The first observation." },
    { id: "b", label: "b", description: "A consequence of a." },
    { id: "c", label: "c", description: "A consequence of b." },
  ],
  delta: "delta",
  minimalInconsistentSets: [],
  entailmentRules: [
    { id: "a-entails-b", premises: ["a"], conclusion: "b" },
    { id: "b-entails-c", premises: ["b"], conclusion: "c" },
  ],
};

const booleanNegation: ApproximableMappingDefinition = {
  id: "boolean-negation",
  title: "Boolean negation",
  description: "Swap the two total Boolean observations.",
  rules: [
    { id: "false-to-true", premises: ["false"], conclusion: "true" },
    { id: "true-to-false", premises: ["true"], conclusion: "false" },
  ],
};

const persistedFlatBoolean: PersistedInformationSystemDefinition = {
  schemaVersion: "1",
  kind: "information-system",
  convention: "scott-1982-distinguished-token",
  id: "flat-boolean",
  title: "Flat Booleans",
  description: "The exact finite flat-Boolean information system.",
  approximation: { kind: "exact" },
  ...flatBoolean,
};

const persistedBooleanNegation: PersistedApproximableMappingDefinition = {
  schemaVersion: "1",
  kind: "approximable-mapping",
  approximation: { kind: "exact" },
  sourceSystemId: "flat-boolean",
  targetSystemId: "flat-boolean",
  ...booleanNegation,
};

const booleanPair: InformationSystemDefinition = {
  tokens: [
    {
      id: "delta",
      label: "Always-present token",
      symbol: "Δ",
      description: "The distinguished token present in every state.",
    },
    { id: "left-false", label: "left false", description: "Left is false." },
    { id: "left-true", label: "left true", description: "Left is true." },
    {
      id: "right-false",
      label: "right false",
      description: "Right is false.",
    },
    { id: "right-true", label: "right true", description: "Right is true." },
  ],
  delta: "delta",
  minimalInconsistentSets: [
    ["left-false", "left-true"],
    ["right-false", "right-true"],
  ],
  entailmentRules: [],
};

const booleanParity: ApproximableMappingDefinition = {
  id: "boolean-parity",
  title: "Boolean parity",
  description: "Return true exactly when the two observations differ.",
  rules: [
    {
      id: "false-false-is-even",
      premises: ["left-false", "right-false"],
      conclusion: "false",
    },
    {
      id: "false-true-is-odd",
      premises: ["left-false", "right-true"],
      conclusion: "true",
    },
    {
      id: "true-false-is-odd",
      premises: ["left-true", "right-false"],
      conclusion: "true",
    },
    {
      id: "true-true-is-even",
      premises: ["left-true", "right-true"],
      conclusion: "false",
    },
  ],
};

function expectSemanticError(
  action: () => unknown,
  category: SemanticErrorCategory,
  witness: readonly string[],
): void {
  expect(action).toThrowError(
    expect.objectContaining<Partial<SemanticError>>({ category, witness }),
  );
}

function captureSemanticError(action: () => unknown): SemanticError {
  try {
    action();
  } catch (error) {
    if (error instanceof SemanticError) {
      return error;
    }
    throw error;
  }
  throw new Error("Expected the operation to throw a SemanticError.");
}

describe("validateSystem", () => {
  it("validates the flat-Boolean presentation exhaustively", () => {
    expect(validateSystem(flatBoolean)).toEqual({
      ok: true,
      checkedConsistentSets: 6,
    });
  });

  it("rejects a duplicate token ID with a concrete witness", () => {
    expect.hasAssertions();
    expectSemanticError(
      () =>
        validateSystem({
          ...flatBoolean,
          tokens: [
            ...flatBoolean.tokens,
            {
              id: "true",
              label: "duplicate true",
              description: "A duplicate token declaration.",
            },
          ],
        }),
      "duplicateTokenId",
      ["true"],
    );
  });

  it("rejects an unknown distinguished token", () => {
    expect.hasAssertions();
    expectSemanticError(
      () => validateSystem({ ...flatBoolean, delta: "missing" }),
      "unknownDelta",
      ["missing"],
    );
  });

  it("rejects a duplicate rule ID", () => {
    expect.hasAssertions();
    expectSemanticError(
      () =>
        validateSystem({
          ...flatBoolean,
          entailmentRules: [
            { id: "observe", premises: ["true"], conclusion: "true" },
            { id: "observe", premises: ["false"], conclusion: "false" },
          ],
        }),
      "duplicateRuleId",
      ["observe"],
    );
  });

  it("rejects unknown tokens in conflicts, premises, and conclusions", () => {
    expect.hasAssertions();
    expectSemanticError(
      () =>
        validateSystem({
          ...flatBoolean,
          minimalInconsistentSets: [["false", "missing"]],
        }),
      "unknownTokenReference",
      ["missing"],
    );
    expectSemanticError(
      () =>
        validateSystem({
          ...flatBoolean,
          entailmentRules: [
            { id: "missing-premise", premises: ["missing"], conclusion: "true" },
          ],
        }),
      "unknownTokenReference",
      ["missing"],
    );
    expectSemanticError(
      () =>
        validateSystem({
          ...flatBoolean,
          entailmentRules: [
            { id: "missing-conclusion", premises: [], conclusion: "missing" },
          ],
        }),
      "unknownTokenReference",
      ["missing"],
    );
  });

  it("rejects repeated tokens inside an inconsistent-set declaration", () => {
    expect.hasAssertions();
    expectSemanticError(
      () =>
        validateSystem({
          ...flatBoolean,
          minimalInconsistentSets: [["true", "true"]],
        }),
      "duplicateInconsistentSetToken",
      ["true"],
    );
  });

  it("rejects duplicate inconsistent sets independent of token order", () => {
    expect.hasAssertions();
    expectSemanticError(
      () =>
        validateSystem({
          ...flatBoolean,
          minimalInconsistentSets: [
            ["false", "true"],
            ["true", "false"],
          ],
        }),
      "duplicateInconsistentSet",
      ["false", "true"],
    );
  });

  it("rejects an inconsistent set with fewer than two tokens", () => {
    expect.hasAssertions();
    expectSemanticError(
      () =>
        validateSystem({
          ...flatBoolean,
          minimalInconsistentSets: [["true"]],
        }),
      "inconsistentSetTooSmall",
      ["true"],
    );
  });

  it("rejects an inconsistent set containing delta", () => {
    expect.hasAssertions();
    expectSemanticError(
      () =>
        validateSystem({
          ...flatBoolean,
          minimalInconsistentSets: [["true", "delta"]],
        }),
      "deltaInInconsistentSet",
      ["delta", "true"],
    );
  });

  it("rejects a nonminimal inconsistent set", () => {
    expect.hasAssertions();
    expectSemanticError(
      () =>
        validateSystem({
          ...flatBoolean,
          tokens: [
            ...flatBoolean.tokens,
            {
              id: "unknown",
              label: "unknown",
              description: "An additional ordinary observation.",
            },
          ],
          minimalInconsistentSets: [
            ["false", "true"],
            ["unknown", "true", "false"],
          ],
        }),
      "nonMinimalInconsistentSet",
      ["false", "true", "unknown"],
    );
  });

  it("rejects a repeated rule premise", () => {
    expect.hasAssertions();
    expectSemanticError(
      () =>
        validateSystem({
          ...flatBoolean,
          entailmentRules: [
            {
              id: "repeated-premise",
              premises: ["true", "true"],
              conclusion: "true",
            },
          ],
        }),
      "duplicateRulePremise",
      ["true"],
    );
  });

  it("rejects an inconsistent declared premise set", () => {
    expect.hasAssertions();
    expectSemanticError(
      () =>
        validateSystem({
          ...flatBoolean,
          entailmentRules: [
            {
              id: "inconsistent-premises",
              premises: ["true", "false"],
              conclusion: "delta",
            },
          ],
        }),
      "inconsistentRulePremises",
      ["false", "true"],
    );
  });

  it("finds a consistency-preservation counterexample exhaustively", () => {
    expect.hasAssertions();
    expectSemanticError(
      () =>
        validateSystem({
          ...flatBoolean,
          entailmentRules: [
            {
              id: "true-entails-false",
              premises: ["true"],
              conclusion: "false",
            },
          ],
        }),
      "entailmentBreaksConsistency",
      ["false", "true"],
    );
  });

  it("selects deterministic witnesses independent of declaration order", () => {
    expect.hasAssertions();
    const invalidSystem: InformationSystemDefinition = {
      ...flatBoolean,
      tokens: [
        ...flatBoolean.tokens,
        { id: "a", label: "a", description: "Observation a." },
        { id: "b", label: "b", description: "Observation b." },
      ],
      minimalInconsistentSets: [
        ["true", "false"],
        ["b", "a"],
      ],
      entailmentRules: [
        { id: "true-entails-b", premises: ["true"], conclusion: "b" },
        { id: "true-entails-a", premises: ["true"], conclusion: "a" },
        {
          id: "true-entails-false",
          premises: ["true"],
          conclusion: "false",
        },
      ],
    };

    expectSemanticError(
      () => validateSystem(invalidSystem),
      "entailmentBreaksConsistency",
      ["a", "b"],
    );
  });

  it("makes existing computations reject invalid definitions first", () => {
    expect.hasAssertions();
    expectSemanticError(
      () =>
        computeClosure(
          { ...flatBoolean, minimalInconsistentSets: [["false"]] },
          ["true"],
        ),
      "inconsistentSetTooSmall",
      ["false"],
    );
  });
});

describe("approximable mappings", () => {
  it("validates and applies Boolean negation without a redundant delta rule", () => {
    expect(validateMapping(flatBoolean, flatBoolean, booleanNegation)).toEqual({
      ok: true,
      checkedConsistentSourceSets: 6,
    });

    expect(
      applyMapping(flatBoolean, flatBoolean, booleanNegation, [
        "delta",
        "false",
      ]),
    ).toEqual({
      sourceState: ["delta", "false"],
      targetState: ["delta", "true"],
      activations: [
        {
          ruleId: "false-to-true",
          premises: ["false"],
          conclusion: "true",
        },
      ],
    });
    expect(
      applyMapping(flatBoolean, flatBoolean, booleanNegation, [
        "delta",
        "true",
      ]).targetState,
    ).toEqual(["delta", "false"]);
    expect(
      applyMapping(flatBoolean, flatBoolean, booleanNegation, ["delta"]),
    ).toEqual({
      sourceState: ["delta"],
      targetState: ["delta"],
      activations: [],
    });
  });

  it("resolves persisted mapping system identities before validation", () => {
    const mismatchedSource: PersistedInformationSystemDefinition = {
      ...persistedFlatBoolean,
      id: "other-source",
    };
    const mismatchedTarget: PersistedInformationSystemDefinition = {
      ...persistedFlatBoolean,
      id: "other-target",
    };

    expect(
      validateMapping(
        persistedFlatBoolean,
        persistedFlatBoolean,
        persistedBooleanNegation,
      ),
    ).toEqual({ ok: true, checkedConsistentSourceSets: 6 });

    expectSemanticError(
      () =>
        validateMapping(
          flatBoolean,
          persistedFlatBoolean,
          persistedBooleanNegation,
        ),
      "mappingSourceSystemUnidentified",
      ["flat-boolean"],
    );
    expectSemanticError(
      () =>
        validateMapping(
          mismatchedSource,
          persistedFlatBoolean,
          persistedBooleanNegation,
        ),
      "mappingSourceSystemMismatch",
      ["flat-boolean", "other-source"],
    );
    expectSemanticError(
      () =>
        validateMapping(
          persistedFlatBoolean,
          flatBoolean,
          persistedBooleanNegation,
        ),
      "mappingTargetSystemUnidentified",
      ["flat-boolean"],
    );

    const mismatch = captureSemanticError(() =>
      validateMapping(
        persistedFlatBoolean,
        mismatchedTarget,
        persistedBooleanNegation,
      ),
    );
    expect(mismatch).toMatchObject({
      category: "mappingTargetSystemMismatch",
      witness: ["flat-boolean", "other-target"],
      details: {
        kind: "mappingSystemIdentity",
        role: "target",
        expectedSystemId: "flat-boolean",
        actualSystemId: "other-target",
      },
    });
  });

  it("estimates and bounds exhaustive mapping validation before enumeration", () => {
    const estimate = estimateMappingValidation(flatBoolean, flatBoolean);
    expect(estimate).toEqual({
      sourceTokenCount: 3,
      targetTokenCount: 3,
      sourceSystemSubsetCandidates: 8,
      targetSystemSubsetCandidates: 8,
      mappingSubsetCandidates: 8,
      totalSubsetCandidates: 24,
    });

    const error = captureSemanticError(() =>
      validateMapping(flatBoolean, flatBoolean, booleanNegation, {
        maxSubsetChecks: 23,
      }),
    );
    expect(error).toMatchObject({
      category: "mappingValidationBudgetExceeded",
      witness: ["24", "23"],
      details: {
        kind: "mappingValidationBudgetExceeded",
        estimate,
        maxSubsetChecks: 23,
      },
    });
  });

  it("reuses an immutable compiled snapshot without revalidating definitions", () => {
    const mutableRules = [
      { id: "false-to-true", premises: ["false"], conclusion: "true" },
    ];
    const mutableMapping: ApproximableMappingDefinition = {
      id: "mutable-source-definition",
      title: "Mutable source definition",
      description: "Compilation captures a safe semantic snapshot.",
      rules: mutableRules,
    };
    const compiled = compileMapping(
      flatBoolean,
      flatBoolean,
      mutableMapping,
    );
    const sourceState = ["delta", "false"] as const;

    expect(Object.isFrozen(compiled)).toBe(true);
    expect(applyCompiledMapping(compiled, sourceState).targetState).toEqual([
      "delta",
      "true",
    ]);

    const mutableRule = mutableRules[0];
    if (mutableRule === undefined) {
      throw new Error("The mutable mapping must contain its generator rule.");
    }
    mutableRule.conclusion = "false";

    expect(applyCompiledMapping(compiled, sourceState).targetState).toEqual([
      "delta",
      "true",
    ]);
    expect(applyCompiledMapping(compiled, ["delta"]).targetState).toEqual([
      "delta",
    ]);
  });

  it("represents parity on total pairs while preserving partial information", () => {
    expect(validateMapping(booleanPair, flatBoolean, booleanParity)).toEqual({
      ok: true,
      checkedConsistentSourceSets: 18,
    });

    const examples = [
      {
        source: ["delta", "left-false", "right-false"],
        target: ["delta", "false"],
      },
      {
        source: ["delta", "left-false", "right-true"],
        target: ["delta", "true"],
      },
      {
        source: ["delta", "left-true", "right-false"],
        target: ["delta", "true"],
      },
      {
        source: ["delta", "left-true", "right-true"],
        target: ["delta", "false"],
      },
    ] as const;

    for (const example of examples) {
      expect(
        applyMapping(
          booleanPair,
          flatBoolean,
          booleanParity,
          example.source,
        ).targetState,
      ).toEqual(example.target);
    }
    expect(
      applyMapping(booleanPair, flatBoolean, booleanParity, [
        "delta",
        "left-false",
      ]).targetState,
    ).toEqual(["delta"]);
  });

  it("is monotone on complete finite source-state orders", () => {
    const cases: readonly {
      readonly source: InformationSystemDefinition;
      readonly target: InformationSystemDefinition;
      readonly mapping: ApproximableMappingDefinition;
    }[] = [
      {
        source: flatBoolean,
        target: flatBoolean,
        mapping: booleanNegation,
      },
      {
        source: booleanPair,
        target: flatBoolean,
        mapping: booleanParity,
      },
    ];

    for (const example of cases) {
      const compiled = compileMapping(
        example.source,
        example.target,
        example.mapping,
      );
      const sourceStates = enumerateStates(example.source).states;

      for (const lower of sourceStates) {
        for (const upper of sourceStates) {
          if (!lower.every((tokenId) => upper.includes(tokenId))) {
            continue;
          }
          const lowerTarget = applyCompiledMapping(compiled, lower).targetState;
          const upperTarget = applyCompiledMapping(compiled, upper).targetState;

          expect(
            lowerTarget.every((tokenId) => upperTarget.includes(tokenId)),
          ).toBe(true);
        }
      }
    }
  });

  it("activates rules whose source premises were derived by entailment", () => {
    const mapping: ApproximableMappingDefinition = {
      id: "derived-premise",
      title: "Derived premise",
      description: "Observe true when the source entails b.",
      rules: [
        { id: "b-to-true", premises: ["b"], conclusion: "true" },
      ],
    };
    const sourceState = computeClosure(entailmentChain, ["a"]).state;

    expect(
      applyMapping(entailmentChain, flatBoolean, mapping, sourceState),
    ).toEqual({
      sourceState: ["a", "b", "c", "delta"],
      targetState: ["delta", "true"],
      activations: [
        {
          ruleId: "b-to-true",
          premises: ["b"],
          conclusion: "true",
        },
      ],
    });
  });

  it("orders activations by ID, retains alternate support, then closes the target", () => {
    const mapping: ApproximableMappingDefinition = {
      id: "alternate-support",
      title: "Alternate support",
      description: "Two source rules independently justify target a.",
      rules: [
        { id: "z-support", premises: ["true"], conclusion: "a" },
        { id: "a-support", premises: ["true"], conclusion: "a" },
      ],
    };
    const computation = applyMappingSteps(
      flatBoolean,
      entailmentChain,
      mapping,
      ["true", "delta"],
    );

    expect(computation.targetState).toEqual(["a", "b", "c", "delta"]);
    expect(computation.activations).toEqual([
      { ruleId: "a-support", premises: ["true"], conclusion: "a" },
      { ruleId: "z-support", premises: ["true"], conclusion: "a" },
    ]);
    expect(computation.steps).toEqual([
      {
        index: 0,
        before: [],
        premises: [],
        conclusion: "delta",
        after: ["delta"],
        reason: { kind: "targetDistinguishedToken" },
      },
      {
        index: 1,
        before: ["delta"],
        premises: ["true"],
        conclusion: "a",
        after: ["a", "delta"],
        reason: { kind: "mappingRule", ruleId: "a-support" },
      },
      {
        index: 2,
        before: ["a", "delta"],
        premises: ["true"],
        conclusion: "a",
        after: ["a", "delta"],
        reason: { kind: "mappingRule", ruleId: "z-support" },
      },
      {
        index: 3,
        before: ["a", "delta"],
        premises: ["a"],
        conclusion: "b",
        after: ["a", "b", "delta"],
        reason: { kind: "targetEntailment", ruleId: "a-entails-b" },
      },
      {
        index: 4,
        before: ["a", "b", "delta"],
        premises: ["b"],
        conclusion: "c",
        after: ["a", "b", "c", "delta"],
        reason: { kind: "targetEntailment", ruleId: "b-entails-c" },
      },
    ]);
    expect(
      applyMappingSteps(
        flatBoolean,
        entailmentChain,
        { ...mapping, rules: [...mapping.rules].reverse() },
        ["delta", "true"],
      ),
    ).toEqual(computation);
    expect(applyMapping(flatBoolean, entailmentChain, mapping, [
      "delta",
      "true",
    ])).toEqual({
      sourceState: computation.sourceState,
      targetState: computation.targetState,
      activations: computation.activations,
    });
  });

  it("establishes target bottom before source-dependent mapping support", () => {
    const targetWithBottomFact: InformationSystemDefinition = {
      tokens: [
        {
          id: "delta",
          label: "Always-present token",
          description: "The target distinguished token.",
        },
        {
          id: "a",
          label: "a",
          description: "An unconditionally entailed target observation.",
        },
      ],
      delta: "delta",
      minimalInconsistentSets: [],
      entailmentRules: [
        { id: "always-a", premises: [], conclusion: "a" },
      ],
    };
    const mapping: ApproximableMappingDefinition = {
      id: "also-support-a",
      title: "Also support a",
      description: "The mapping offers alternate support for target a.",
      rules: [
        { id: "true-supports-a", premises: ["true"], conclusion: "a" },
      ],
    };

    expect(
      applyMappingSteps(flatBoolean, targetWithBottomFact, mapping, [
        "delta",
        "true",
      ]).steps,
    ).toEqual([
      {
        index: 0,
        before: [],
        premises: [],
        conclusion: "delta",
        after: ["delta"],
        reason: { kind: "targetDistinguishedToken" },
      },
      {
        index: 1,
        before: ["delta"],
        premises: [],
        conclusion: "a",
        after: ["a", "delta"],
        reason: { kind: "targetEntailment", ruleId: "always-a" },
      },
      {
        index: 2,
        before: ["a", "delta"],
        premises: ["true"],
        conclusion: "a",
        after: ["a", "delta"],
        reason: { kind: "mappingRule", ruleId: "true-supports-a" },
      },
    ]);
  });

  it("supports empty mappings and empty-premise constant generators", () => {
    const emptyMapping: ApproximableMappingDefinition = {
      id: "empty",
      title: "Empty mapping",
      description: "Only target bottom is produced.",
      rules: [],
    };
    const constantTrue: ApproximableMappingDefinition = {
      id: "constant-true",
      title: "Constant true",
      description: "True is justified without a source observation.",
      rules: [
        { id: "always-true", premises: [], conclusion: "true" },
      ],
    };

    expect(
      applyMapping(flatBoolean, flatBoolean, emptyMapping, ["delta"])
        .targetState,
    ).toEqual(["delta"]);
    expect(
      applyMapping(flatBoolean, flatBoolean, constantTrue, ["delta"]),
    ).toMatchObject({
      targetState: ["delta", "true"],
      activations: [
        { ruleId: "always-true", premises: [], conclusion: "true" },
      ],
    });
  });

  it("rejects invalid rule IDs, references, and premise declarations", () => {
    expect.hasAssertions();
    const mapping = (
      rules: ApproximableMappingDefinition["rules"],
    ): ApproximableMappingDefinition => ({
      id: "invalid",
      title: "Invalid mapping",
      description: "A mapping used to exercise validation.",
      rules,
    });

    expectSemanticError(
      () =>
        validateMapping(
          flatBoolean,
          flatBoolean,
          mapping([
            { id: "same", premises: ["true"], conclusion: "true" },
            { id: "same", premises: ["false"], conclusion: "false" },
          ]),
        ),
      "duplicateMappingRuleId",
      ["same"],
    );
    expectSemanticError(
      () =>
        validateMapping(
          flatBoolean,
          flatBoolean,
          mapping([
            { id: "unknown-source", premises: ["missing"], conclusion: "true" },
          ]),
        ),
      "unknownSourceTokenReference",
      ["missing"],
    );
    expectSemanticError(
      () =>
        validateMapping(
          flatBoolean,
          flatBoolean,
          mapping([
            { id: "unknown-target", premises: ["true"], conclusion: "missing" },
          ]),
        ),
      "unknownTargetTokenReference",
      ["missing"],
    );
    expectSemanticError(
      () =>
        validateMapping(
          flatBoolean,
          flatBoolean,
          mapping([
            {
              id: "duplicate-premise",
              premises: ["true", "true"],
              conclusion: "true",
            },
          ]),
        ),
      "duplicateMappingRulePremise",
      ["true"],
    );
    expectSemanticError(
      () =>
        validateMapping(
          flatBoolean,
          flatBoolean,
          mapping([
            {
              id: "inconsistent-premises",
              premises: ["true", "false"],
              conclusion: "true",
            },
          ]),
        ),
      "inconsistentMappingRulePremises",
      ["false", "true"],
    );
  });

  it("rejects jointly inconsistent outputs activated by a consistent source", () => {
    const invalidMapping: ApproximableMappingDefinition = {
      id: "inconsistent-output",
      title: "Inconsistent output",
      description: "One compatible source set activates both target values.",
      rules: [
        { id: "to-false", premises: ["true"], conclusion: "false" },
        { id: "to-true", premises: ["true"], conclusion: "true" },
      ],
    };

    const error = captureSemanticError(() =>
      validateMapping(flatBoolean, flatBoolean, invalidMapping),
    );
    expect(error).toMatchObject({
      category: "mappingBreaksConsistency",
      witness: ["false", "true"],
      details: {
        kind: "mappingBreaksConsistency",
        sourceSet: ["true"],
        targetWitness: ["false", "true"],
        ruleIds: ["to-false", "to-true"],
      },
    });
  });

  it("includes source entailment when checking joint rule activation", () => {
    const invalidMapping: ApproximableMappingDefinition = {
      id: "entailed-inconsistent-output",
      title: "Entailed inconsistent output",
      description: "Entailed source information activates a second rule.",
      rules: [
        { id: "a-to-false", premises: ["a"], conclusion: "false" },
        { id: "b-to-true", premises: ["b"], conclusion: "true" },
      ],
    };

    const error = captureSemanticError(() =>
      validateMapping(entailmentChain, flatBoolean, invalidMapping),
    );
    expect(error).toMatchObject({
      category: "mappingBreaksConsistency",
      witness: ["false", "true"],
      details: {
        kind: "mappingBreaksConsistency",
        sourceSet: ["a"],
        targetWitness: ["false", "true"],
        ruleIds: ["a-to-false", "b-to-true"],
      },
    });
  });

  it("accepts incompatible outputs when their source supports are incompatible", () => {
    expect(validateMapping(flatBoolean, flatBoolean, booleanNegation)).toEqual({
      ok: true,
      checkedConsistentSourceSets: 6,
    });
  });

  it("rejects unknown, inconsistent, and non-closed mapping inputs", () => {
    expectSemanticError(
      () =>
        applyMapping(flatBoolean, flatBoolean, booleanNegation, ["missing"]),
      "unknownSourceTokenReference",
      ["missing"],
    );

    const notClosed = captureSemanticError(() =>
      applyMapping(flatBoolean, flatBoolean, booleanNegation, ["true"]),
    );
    expect(notClosed).toMatchObject({
      category: "mappingInputNotState",
      witness: ["delta"],
      details: {
        kind: "mappingInputNotState",
        reason: "notClosed",
        candidate: ["true"],
        missingTokens: ["delta"],
      },
    });

    const inconsistent = captureSemanticError(() =>
      applyMapping(flatBoolean, flatBoolean, booleanNegation, [
        "delta",
        "false",
        "true",
      ]),
    );
    expect(inconsistent).toMatchObject({
      category: "mappingInputNotState",
      witness: ["false", "true"],
      details: {
        kind: "mappingInputNotState",
        reason: "inconsistent",
        candidate: ["delta", "false", "true"],
        conflictWitness: ["false", "true"],
      },
    });

    const entailedMissing = captureSemanticError(() =>
      applyMapping(
        entailmentChain,
        flatBoolean,
        {
          id: "chain",
          title: "Chain",
          description: "Map c to true.",
          rules: [{ id: "c-to-true", premises: ["c"], conclusion: "true" }],
        },
        ["delta", "a"],
      ),
    );
    expect(entailedMissing).toMatchObject({
      category: "mappingInputNotState",
      witness: ["b", "c"],
      details: {
        kind: "mappingInputNotState",
        reason: "notClosed",
        candidate: ["a", "delta"],
        missingTokens: ["b", "c"],
      },
    });
  });
});

describe("information-system predicates and generated laws", () => {
  it("decides consistency and rejects unknown candidate tokens", () => {
    expect(isConsistent(flatBoolean, [])).toBe(true);
    expect(isConsistent(flatBoolean, ["delta", "true"])).toBe(true);
    expect(isConsistent(flatBoolean, ["true", "false"])).toBe(false);
    expectSemanticError(
      () => isConsistent(flatBoolean, ["missing"]),
      "unknownTokenReference",
      ["missing"],
    );
  });

  it("recognizes exactly consistent, entailment-closed token sets as states", () => {
    expect(isState(flatBoolean, ["delta"])).toBe(true);
    expect(isState(flatBoolean, ["delta", "true"])).toBe(true);
    expect(isState(flatBoolean, [])).toBe(false);
    expect(isState(flatBoolean, ["true"])).toBe(false);
    expect(isState(flatBoolean, ["delta", "false", "true"])).toBe(false);

    expect(isState(entailmentChain, ["delta", "a"])).toBe(false);
    expect(isState(entailmentChain, ["delta", "a", "b", "c"])).toBe(true);
  });

  it("generates distinguished-token, reflexive, weakening, and cut entailment", () => {
    expect(computeClosure(entailmentChain, []).state).toEqual(["delta"]);
    expect(computeClosure(entailmentChain, ["c"]).state).toEqual([
      "c",
      "delta",
    ]);
    expect(computeClosure(entailmentChain, ["a"]).state).toEqual([
      "a",
      "b",
      "c",
      "delta",
    ]);
    expect(computeClosure(entailmentChain, ["a", "c"]).state).toEqual([
      "a",
      "b",
      "c",
      "delta",
    ]);
  });

  it("satisfies closure extensivity, monotonicity, and idempotence exhaustively", () => {
    const inputs: readonly (readonly string[])[] = [
      [],
      ["a"],
      ["b"],
      ["c"],
      ["a", "b"],
      ["a", "c"],
      ["b", "c"],
      ["a", "b", "c"],
    ];
    const closures = inputs.map(
      (input) => computeClosure(entailmentChain, input).state,
    );

    for (const [index, input] of inputs.entries()) {
      const result = closures[index];
      if (result === undefined) {
        throw new Error("A closure result is missing.");
      }
      expect(input.every((tokenId) => result.includes(tokenId))).toBe(true);
      expect(computeClosure(entailmentChain, result).state).toEqual(result);
      expect(isConsistent(entailmentChain, result)).toBe(true);
    }

    for (const [leftIndex, left] of inputs.entries()) {
      for (const [rightIndex, right] of inputs.entries()) {
        if (!left.every((tokenId) => right.includes(tokenId))) {
          continue;
        }
        const leftClosure = closures[leftIndex];
        const rightClosure = closures[rightIndex];
        if (leftClosure === undefined || rightClosure === undefined) {
          throw new Error("A monotonicity closure result is missing.");
        }
        expect(
          leftClosure.every((tokenId) => rightClosure.includes(tokenId)),
        ).toBe(true);
      }
    }
  });
});

describe("inspectStateCandidate", () => {
  it("explains a consistent selection that is not entailment-closed", () => {
    const inspection = inspectStateCandidate(entailmentChain, ["delta", "a"]);

    expect(inspection).toMatchObject({
      kind: "notClosed",
      candidate: ["a", "delta"],
      missingTokens: ["b", "c"],
      closure: { state: ["a", "b", "c", "delta"] },
    });
    if (inspection.kind !== "notClosed") {
      throw new Error("Expected a consistent but unclosed candidate.");
    }
    expect(
      inspection.closure.steps.map(({ conclusion }) => conclusion),
    ).toEqual(["delta", "a", "b", "c"]);
  });

  it("recognizes an entailment-closed consistent selection as a state", () => {
    expect(
      inspectStateCandidate(entailmentChain, ["c", "a", "delta", "b", "a"]),
    ).toMatchObject({
      kind: "state",
      candidate: ["a", "b", "c", "delta"],
      closure: { state: ["a", "b", "c", "delta"] },
    });
  });

  it("reports a deterministic inconsistency witness before computing closure", () => {
    expect(inspectStateCandidate(flatBoolean, ["true", "false"])).toEqual({
      kind: "inconsistent",
      candidate: ["false", "true"],
      witness: ["false", "true"],
    });
  });

  it("rejects unknown candidate tokens", () => {
    expect.hasAssertions();
    expectSemanticError(
      () => inspectStateCandidate(flatBoolean, ["missing"]),
      "unknownTokenReference",
      ["missing"],
    );
  });
});

describe("closureSteps", () => {
  it("makes every transition in a transitive closure inspectable", () => {
    const computation = closureSteps(entailmentChain, ["a"]);

    expect(computation.input).toEqual(["a"]);
    expect(computation.state).toEqual(["a", "b", "c", "delta"]);
    expect(computation.steps).toEqual([
      {
        index: 0,
        before: [],
        premises: [],
        conclusion: "delta",
        after: ["delta"],
        reason: { kind: "distinguishedToken" },
      },
      {
        index: 1,
        before: ["delta"],
        premises: ["a"],
        conclusion: "a",
        after: ["a", "delta"],
        reason: { kind: "reflexivity" },
      },
      {
        index: 2,
        before: ["a", "delta"],
        premises: ["a"],
        conclusion: "b",
        after: ["a", "b", "delta"],
        reason: { kind: "declaredRule", ruleId: "a-entails-b" },
      },
      {
        index: 3,
        before: ["a", "b", "delta"],
        premises: ["b"],
        conclusion: "c",
        after: ["a", "b", "c", "delta"],
        reason: { kind: "declaredRule", ruleId: "b-entails-c" },
      },
    ]);
  });

  it("drives the compatible computeClosure result from the same trace", () => {
    const computation = closureSteps(entailmentChain, ["a"]);

    expect(computeClosure(entailmentChain, ["a"])).toEqual({
      input: computation.input,
      state: computation.state,
      events: computation.events,
    });
    expect(
      computation.events.filter(({ kind }) => kind === "tokenEntailed"),
    ).toHaveLength(computation.steps.length);
  });

  it("normalizes input and produces deterministic step ordering", () => {
    expect(closureSteps(entailmentChain, ["c", "a", "a"])).toEqual(
      closureSteps(entailmentChain, ["a", "c"]),
    );
  });

  it("rejects unknown and inconsistent closure inputs with witnesses", () => {
    expect.hasAssertions();
    expectSemanticError(
      () => closureSteps(flatBoolean, ["missing"]),
      "unknownTokenReference",
      ["missing"],
    );
    expectSemanticError(
      () => closureSteps(flatBoolean, ["true", "false"]),
      "minimalInconsistentSet",
      ["false", "true"],
    );
  });
});

describe("explainEntailment", () => {
  it("returns the causal two-rule derivation of a transitive result", () => {
    const explanation = explainEntailment(entailmentChain, ["a"], "c");

    expect(explanation).toMatchObject({
      entailed: true,
      input: ["a"],
      token: "c",
      state: ["a", "b", "c", "delta"],
      step: {
        index: 3,
        premises: ["b"],
        conclusion: "c",
        reason: { kind: "declaredRule", ruleId: "b-entails-c" },
      },
    });
    if (!explanation.entailed) {
      throw new Error("Expected c to be entailed.");
    }
    expect(explanation.derivation.map(({ conclusion }) => conclusion)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(explanation.derivation.at(-1)).toBe(explanation.step);
  });

  it("explains distinguished-token and reflexive entailments", () => {
    const delta = explainEntailment(entailmentChain, ["a"], "delta");
    const a = explainEntailment(entailmentChain, ["a"], "a");

    expect(delta).toMatchObject({
      entailed: true,
      step: { reason: { kind: "distinguishedToken" } },
    });
    expect(a).toMatchObject({
      entailed: true,
      step: { reason: { kind: "reflexivity" } },
    });
  });

  it("returns a clear result when a known token is not entailed", () => {
    expect(explainEntailment(flatBoolean, ["true"], "false")).toEqual({
      entailed: false,
      input: ["true"],
      token: "false",
      state: ["delta", "true"],
      reason: "notEntailed",
    });
  });

  it("rejects unknown input and query tokens", () => {
    expect.hasAssertions();
    expectSemanticError(
      () => explainEntailment(flatBoolean, ["missing"], "true"),
      "unknownTokenReference",
      ["missing"],
    );
    expectSemanticError(
      () => explainEntailment(flatBoolean, [], "missing"),
      "unknownTokenReference",
      ["missing"],
    );
  });
});

describe("computeBottom", () => {
  it("computes and explains the flat-Boolean bottom state", () => {
    const result = computeBottom(flatBoolean);

    expect(result.state).toEqual(["delta"]);
    expect(result.deltaToken).toMatchObject({ id: "delta", symbol: "Δ" });
    expect(result.events).toEqual([
      { kind: "bottomComputed", delta: "delta", state: ["delta"] },
      { kind: "stateValidated", state: ["delta"] },
    ]);
  });

  it("includes tokens entailed without a specific observation", () => {
    const result = computeBottom({
      ...flatBoolean,
      tokens: [
        ...flatBoolean.tokens,
        { id: "a", label: "a", description: "First consequence." },
        { id: "b", label: "b", description: "Second consequence." },
      ],
      entailmentRules: [
        { id: "always-a", premises: [], conclusion: "a" },
        { id: "a-entails-b", premises: ["a"], conclusion: "b" },
      ],
    });

    expect(result.state).toEqual(["a", "b", "delta"]);
  });

  it("reports a concrete witness when bottom is inconsistent", () => {
    expect.hasAssertions();
    const invalidSystem: InformationSystemDefinition = {
      ...flatBoolean,
      entailmentRules: [
        { id: "entail-false", premises: [], conclusion: "false" },
        { id: "entail-true", premises: [], conclusion: "true" },
      ],
    };

    expectSemanticError(
      () => computeBottom(invalidSystem),
      "inconsistentBottom",
      ["false", "true"],
    );
  });
});

describe("computeClosure", () => {
  it("adds true to the flat-Boolean bottom with a deterministic trace", () => {
    const result = computeClosure(flatBoolean, ["true"]);

    expect(result.state).toEqual(["delta", "true"]);
    expect(result.events).toEqual([
      { kind: "closureStarted", input: ["true"] },
      {
        kind: "tokenEntailed",
        premises: [],
        conclusion: "delta",
        reason: { kind: "distinguishedToken" },
      },
      {
        kind: "tokenEntailed",
        premises: ["true"],
        conclusion: "true",
        reason: { kind: "reflexivity" },
      },
      {
        kind: "closureCompleted",
        input: ["true"],
        result: ["delta", "true"],
      },
      { kind: "stateValidated", state: ["delta", "true"] },
    ]);
  });

  it("handles the false branch symmetrically", () => {
    expect(computeClosure(flatBoolean, ["false"]).state).toEqual([
      "delta",
      "false",
    ]);
  });

  it("rejects incompatible Boolean observations with their witness", () => {
    expect(() => computeClosure(flatBoolean, ["true", "false"])).toThrowError(
      expect.objectContaining<Partial<SemanticError>>({
        category: "minimalInconsistentSet",
        witness: ["false", "true"],
      }),
    );
  });
});

describe("enumerateStates", () => {
  it("derives exactly the three flat-Boolean states", () => {
    expect(enumerateStates(flatBoolean).states).toEqual([
      ["delta"],
      ["delta", "false"],
      ["delta", "true"],
    ]);
  });

  it("includes a fourth state when true and false are compatible", () => {
    const compatibleBooleanTokens: InformationSystemDefinition = {
      ...flatBoolean,
      minimalInconsistentSets: [],
    };

    expect(enumerateStates(compatibleBooleanTokens).states).toEqual([
      ["delta"],
      ["delta", "false"],
      ["delta", "true"],
      ["delta", "false", "true"],
    ]);
  });
});

describe("computeCoverRelation", () => {
  it("derives the two flat-Boolean cover edges", () => {
    const result = computeCoverRelation(flatBoolean);

    expect(result.edges).toEqual([
      { lower: ["delta"], upper: ["delta", "false"] },
      { lower: ["delta"], upper: ["delta", "true"] },
    ]);
    expect(result.events).toEqual([
      {
        kind: "coverRelationComputed",
        edges: result.edges,
      },
    ]);
  });

  it("omits transitive edges", () => {
    const result = computeCoverRelation({
      ...flatBoolean,
      minimalInconsistentSets: [],
    });

    expect(result.edges).toEqual([
      { lower: ["delta"], upper: ["delta", "false"] },
      { lower: ["delta"], upper: ["delta", "true"] },
      {
        lower: ["delta", "false"],
        upper: ["delta", "false", "true"],
      },
      {
        lower: ["delta", "true"],
        upper: ["delta", "false", "true"],
      },
    ]);
  });
});

describe("tryAddObservation", () => {
  it("accepts a consistent refinement", () => {
    const result = tryAddObservation(flatBoolean, ["delta"], "true");

    expect(result).toMatchObject({
      ok: true,
      closure: { state: ["delta", "true"] },
    });
  });

  it("rejects false after true and preserves the current state", () => {
    const result = tryAddObservation(
      flatBoolean,
      ["delta", "true"],
      "false",
    );

    expect(result).toEqual({
      ok: false,
      state: ["delta", "true"],
      event: {
        kind: "inconsistencyFound",
        category: "minimalInconsistentSet",
        candidate: ["delta", "false", "true"],
        witness: ["false", "true"],
      },
    });
  });

  it("rejects true after false with the same witness", () => {
    const result = tryAddObservation(
      flatBoolean,
      ["delta", "false"],
      "true",
    );

    expect(result).toMatchObject({
      ok: false,
      state: ["delta", "false"],
      event: {
        candidate: ["delta", "false", "true"],
        witness: ["false", "true"],
      },
    });
  });
});
