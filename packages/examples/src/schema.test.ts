/// <reference types="vite/client" />

import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import {
  applyMapping,
  enumerateStates,
  iterateFromBottom,
  validateMapping,
  validateSystem,
} from "@scottlab/core";
import { describe, expect, it } from "vitest";

import approximableMappingSchema from "../../../schemas/approximable-mapping.v1.schema.json";
import informationSystemSchema from "../../../schemas/information-system.v1.schema.json";
import {
  accessPermissionsSystem,
  booleanNegationMapping,
  boundedLazyNaturalsSystem,
  consOneMapping,
  coquandSystem,
  editingPolicySystem,
  flatBooleanSystem,
  oneMoreStepMapping,
  retrogradeAnalysisMapping,
  streamPrefixesSystem,
  takeAwayGameSystem,
} from "./index";

const informationSystemDocuments = import.meta.glob("../*.system.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

const approximableMappingDocuments = import.meta.glob("../*.mapping.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

function compileSchemas(): {
  validateInformationSystem: ValidateFunction;
  validateApproximableMapping: ValidateFunction;
} {
  const ajv = new Ajv2020({ allErrors: true, strict: true });

  return {
    validateInformationSystem: ajv.compile(informationSystemSchema),
    validateApproximableMapping: ajv.compile(approximableMappingSchema),
  };
}

function formatErrors(errors: ErrorObject[] | null | undefined): string {
  if (errors === null || errors === undefined || errors.length === 0) {
    return "No JSON Schema error details were reported.";
  }

  return errors
    .map((error) => {
      const location = error.instancePath === "" ? "/" : error.instancePath;
      return `${location} ${error.message ?? error.keyword}`;
    })
    .join("\n");
}

function expectValid(
  filename: string,
  document: unknown,
  validate: ValidateFunction,
): void {
  const valid = validate(document);
  expect(
    valid,
    `${filename} failed JSON Schema validation:\n${formatErrors(validate.errors)}`,
  ).toBe(true);
}

function firstDocument(
  documents: Record<string, unknown>,
  kind: string,
): Record<string, unknown> {
  const document = Object.values(documents)[0];
  expect(document, `Expected at least one persisted ${kind} fixture.`).toBeDefined();
  expect(document).toBeTypeOf("object");
  expect(document).not.toBeNull();
  return document as Record<string, unknown>;
}

describe("persisted JSON fixtures", () => {
  const { validateInformationSystem, validateApproximableMapping } =
    compileSchemas();

  it("validates every information-system fixture against Draft 2020-12", () => {
    expect(Object.keys(informationSystemDocuments).length).toBeGreaterThan(0);

    for (const [filename, document] of Object.entries(
      informationSystemDocuments,
    )) {
      expectValid(filename, document, validateInformationSystem);
    }
  });

  it("validates every approximable-mapping fixture against Draft 2020-12", () => {
    expect(Object.keys(approximableMappingDocuments).length).toBeGreaterThan(0);

    for (const [filename, document] of Object.entries(
      approximableMappingDocuments,
    )) {
      expectValid(filename, document, validateApproximableMapping);
    }
  });

  it("rejects a malformed information-system fixture", () => {
    const malformedDocument = {
      ...firstDocument(informationSystemDocuments, "information-system"),
      schemaVersion: "2",
    };

    expect(validateInformationSystem(malformedDocument)).toBe(false);
    expect(formatErrors(validateInformationSystem.errors)).toContain(
      "/schemaVersion must be equal to constant",
    );
  });

  it("rejects a malformed approximable-mapping fixture", () => {
    const malformedDocument = {
      ...firstDocument(approximableMappingDocuments, "approximable-mapping"),
      sourceSystemId: "Not a valid identifier",
    };

    expect(validateApproximableMapping(malformedDocument)).toBe(false);
    expect(formatErrors(validateApproximableMapping.errors)).toContain(
      "/sourceSystemId must match pattern",
    );
  });
});

describe("persisted information systems", () => {
  it("semantically validates every exported system fixture", () => {
    expect(validateSystem(flatBooleanSystem)).toEqual({
      ok: true,
      checkedConsistentSets: 6,
    });
    expect(validateSystem(accessPermissionsSystem).ok).toBe(true);
    expect(validateSystem(editingPolicySystem).ok).toBe(true);
    expect(validateSystem(boundedLazyNaturalsSystem).ok).toBe(true);
    expect(validateSystem(streamPrefixesSystem).ok).toBe(true);
    expect(validateSystem(coquandSystem).ok).toBe(true);
    expect(validateSystem(takeAwayGameSystem).ok).toBe(true);
  });

  it("derives the seven non-flat states of the Coquand system", () => {
    expect(enumerateStates(coquandSystem).states).toEqual([
      ["delta"],
      ["delta", "epsilon"],
      ["delta", "left"],
      ["delta", "right"],
      ["delta", "epsilon", "left"],
      ["delta", "epsilon", "right"],
      ["delta", "epsilon", "left", "right"],
    ]);
  });
});

describe("persisted fixed-point endomaps", () => {
  it("climbs the bounded lazy naturals to their bound", () => {
    expect(
      validateMapping(
        boundedLazyNaturalsSystem,
        boundedLazyNaturalsSystem,
        oneMoreStepMapping,
      ).ok,
    ).toBe(true);

    const computation = iterateFromBottom(
      boundedLazyNaturalsSystem,
      oneMoreStepMapping,
    );
    expect(computation.iterates).toEqual([
      ["delta"],
      ["at-least-1", "delta"],
      ["at-least-1", "at-least-2", "delta"],
      ["at-least-1", "at-least-2", "at-least-3", "delta"],
    ]);
    expect(computation.stabilizedAfter).toBe(3);
  });

  it("iterates cons-one from bottom to the bounded ones stream", () => {
    expect(
      validateMapping(streamPrefixesSystem, streamPrefixesSystem, consOneMapping)
        .ok,
    ).toBe(true);

    const computation = iterateFromBottom(streamPrefixesSystem, consOneMapping);
    expect(computation.iterates).toEqual([
      ["delta"],
      ["delta", "starts-1"],
      ["delta", "starts-1", "starts-11"],
      ["delta", "starts-1", "starts-11", "starts-111"],
    ]);
    expect(computation.fixedPoint).toEqual([
      "delta",
      "starts-1",
      "starts-11",
      "starts-111",
    ]);
    expect(computation.stabilizedAfter).toBe(3);

    const zeroInput = applyMapping(
      streamPrefixesSystem,
      streamPrefixesSystem,
      consOneMapping,
      ["delta", "starts-0"],
    );
    expect(zeroInput.targetState).toEqual(["delta", "starts-1"]);
  });

  it("solves the take-away game by iterated retrograde analysis", () => {
    expect(
      validateMapping(
        takeAwayGameSystem,
        takeAwayGameSystem,
        retrogradeAnalysisMapping,
      ).ok,
    ).toBe(true);

    const computation = iterateFromBottom(
      takeAwayGameSystem,
      retrogradeAnalysisMapping,
    );
    expect(computation.iterates).toEqual([
      ["delta"],
      ["delta", "loss-0"],
      ["delta", "loss-0", "win-1", "win-2"],
      ["delta", "loss-0", "loss-3", "win-1", "win-2"],
      ["delta", "loss-0", "loss-3", "win-1", "win-2", "win-4"],
    ]);
    expect(computation.stabilizedAfter).toBe(4);

    // The false claims stay outside the least fixed point.
    expect(computation.fixedPoint).not.toContain("win-3");
    expect(computation.fixedPoint).not.toContain("loss-4");
    expect(computation.fixedPoint).not.toContain("win-0");
  });
});

describe("persisted approximable mappings", () => {
  it("semantically validates and applies exact Boolean negation", () => {
    expect(
      validateMapping(
        flatBooleanSystem,
        flatBooleanSystem,
        booleanNegationMapping,
      ),
    ).toEqual({ ok: true, checkedConsistentSourceSets: 6 });

    expect(
      applyMapping(
        flatBooleanSystem,
        flatBooleanSystem,
        booleanNegationMapping,
        ["delta"],
      ),
    ).toEqual({
      sourceState: ["delta"],
      targetState: ["delta"],
      activations: [],
    });

    expect(
      applyMapping(
        flatBooleanSystem,
        flatBooleanSystem,
        booleanNegationMapping,
        ["delta", "false"],
      ),
    ).toEqual({
      sourceState: ["delta", "false"],
      targetState: ["delta", "true"],
      activations: [
        {
          ruleId: "false-maps-to-true",
          premises: ["false"],
          conclusion: "true",
        },
      ],
    });

    expect(
      applyMapping(
        flatBooleanSystem,
        flatBooleanSystem,
        booleanNegationMapping,
        ["delta", "true"],
      ),
    ).toEqual({
      sourceState: ["delta", "true"],
      targetState: ["delta", "false"],
      activations: [
        {
          ruleId: "true-maps-to-false",
          premises: ["true"],
          conclusion: "false",
        },
      ],
    });
  });
});
