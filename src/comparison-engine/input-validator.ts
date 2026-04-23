import { ScenarioSchema } from "../simulation-engine/models.js";
import type { InputValidationResult, InputValidationError } from "./models.js";

export function validateInput(scenarios: unknown[]): InputValidationResult {
  const errors: InputValidationError[] = [];

  if (scenarios.length < 2 || scenarios.length > 4) {
    return { valid: false, errors: [{ message: `Scenario set must contain 2 to 4 scenarios, received ${scenarios.length}` }] };
  }

  for (let i = 0; i < scenarios.length; i++) {
    const s = scenarios[i];
    if (!s || typeof s !== "object") {
      errors.push({ scenarioIndex: i, message: "Invalid scenario object" });
      continue;
    }
    const result = ScenarioSchema.safeParse(s);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path.length > 0 ? String(issue.path[0]) : undefined;
        errors.push({ scenarioIndex: i, field, message: issue.message });
      }
    }
  }

  if (errors.length > 0) return { valid: false, errors };

  return { valid: true, scenarios: scenarios.map((s) => ScenarioSchema.parse(s)) };
}
