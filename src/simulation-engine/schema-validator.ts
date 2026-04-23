import { ScenarioSchema } from "./models";
import type { Scenario, SchemaValidationResult } from "./models";

export function validateSchema(scenario: unknown): SchemaValidationResult {
  const result = ScenarioSchema.safeParse(scenario);
  if (result.success) return { valid: true, scenario: result.data };
  return {
    valid: false,
    errors: result.error.errors.map((e) => ({
      field: e.path.join(".") || "(root)",
      message: e.message,
    })),
  };
}
