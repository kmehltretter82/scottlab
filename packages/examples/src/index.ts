import type {
  PersistedApproximableMappingDefinition,
  PersistedInformationSystemDefinition,
} from "@scottlab/core";

import accessPermissionsDocument from "../access-permissions.system.json";
import booleanNegationDocument from "../boolean-negation.mapping.json";
import editingPolicyDocument from "../editing-policy.system.json";
import flatBooleanDocument from "../flat-boolean.system.json";

export const accessPermissionsSystem =
  accessPermissionsDocument as PersistedInformationSystemDefinition;

export const booleanNegationMapping =
  booleanNegationDocument as PersistedApproximableMappingDefinition;

export const editingPolicySystem =
  editingPolicyDocument as PersistedInformationSystemDefinition;

export const flatBooleanSystem =
  flatBooleanDocument as PersistedInformationSystemDefinition;
