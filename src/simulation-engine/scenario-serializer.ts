import { ScenarioSchema } from "./models";
import type { Scenario, ParseResult } from "./models";

export function serializeScenario(scenario: Scenario): string {
  return JSON.stringify(scenario);
}

export function deserializeScenario(json: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    return { success: false, error: `Invalid JSON: ${(e as Error).message}` };
  }
  const result = ScenarioSchema.safeParse(parsed);
  if (result.success) return { success: true, scenario: result.data };
  return {
    success: false,
    error: `Schema validation failed: ${result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
  };
}
