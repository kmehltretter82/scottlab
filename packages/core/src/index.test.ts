import { describe, expect, it } from "vitest";

import {
  computeBottom,
  computeClosure,
  SemanticError,
  tryAddObservation,
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
