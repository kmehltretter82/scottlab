import { describe, expect, it } from "vitest";

import {
  computeBottom,
  SemanticError,
  type InformationSystemDefinition,
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
    const invalidSystem: InformationSystemDefinition = {
      ...flatBoolean,
      tokens: [
        ...flatBoolean.tokens,
        {
          id: "always",
          label: "always",
          description: "An unconditional observation.",
        },
      ],
      minimalInconsistentSets: [["always", "delta"]],
      entailmentRules: [
        { id: "entail-always", premises: [], conclusion: "always" },
      ],
    };

    expect(() => computeBottom(invalidSystem)).toThrowError(
      expect.objectContaining<Partial<SemanticError>>({
        category: "inconsistentBottom",
        witness: ["always", "delta"],
      }),
    );
  });
});
