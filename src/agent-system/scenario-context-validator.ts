import { ScenarioSchema } from "./models";
import type { ScenarioValidationResult, ValidationError } from "./models";

export function validateScenarioContext(scenario: unknown): ScenarioValidationResult {
  const result = ScenarioSchema.safeParse(scenario);
  if (result.success) {
    return { valid: true, scenario: result.data };
  }
  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    field: issue.path.join(".") || "unknown",
    message: issue.message,
  }));
  return { valid: false, errors };
}
