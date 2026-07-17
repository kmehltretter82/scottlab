import type {
  PersistedApproximableMappingDefinition,
  PersistedInformationSystemDefinition,
} from "@scottlab/core";

import accessPermissionsDocument from "../access-permissions.system.json";
import booleanNegationDocument from "../boolean-negation.mapping.json";
import boundedLazyNaturalsDocument from "../bounded-lazy-naturals.system.json";
import consOneDocument from "../cons-one.mapping.json";
import coquandDocument from "../coquand.system.json";
import editingPolicyDocument from "../editing-policy.system.json";
import flatBooleanDocument from "../flat-boolean.system.json";
import oneMoreStepDocument from "../one-more-step.mapping.json";
import retrogradeAnalysisDocument from "../retrograde-analysis.mapping.json";
import streamPrefixesDocument from "../stream-prefixes.system.json";
import takeAwayGameDocument from "../take-away-game.system.json";

export const accessPermissionsSystem =
  accessPermissionsDocument as PersistedInformationSystemDefinition;

export const booleanNegationMapping =
  booleanNegationDocument as PersistedApproximableMappingDefinition;

export const boundedLazyNaturalsSystem =
  boundedLazyNaturalsDocument as PersistedInformationSystemDefinition;

export const consOneMapping =
  consOneDocument as PersistedApproximableMappingDefinition;

export const coquandSystem =
  coquandDocument as PersistedInformationSystemDefinition;

export const editingPolicySystem =
  editingPolicyDocument as PersistedInformationSystemDefinition;

export const flatBooleanSystem =
  flatBooleanDocument as PersistedInformationSystemDefinition;

export const oneMoreStepMapping =
  oneMoreStepDocument as PersistedApproximableMappingDefinition;

export const retrogradeAnalysisMapping =
  retrogradeAnalysisDocument as PersistedApproximableMappingDefinition;

export const streamPrefixesSystem =
  streamPrefixesDocument as PersistedInformationSystemDefinition;

export const takeAwayGameSystem =
  takeAwayGameDocument as PersistedInformationSystemDefinition;
