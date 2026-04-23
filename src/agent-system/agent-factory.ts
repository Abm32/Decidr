import { randomUUID } from "node:crypto";
import { validatePersona } from "./persona-validator";
import { validateScenarioContext } from "./scenario-context-validator";
import { buildSystemPrompt } from "./system-prompt-builder";
import { PersonaSchema } from "./models";
import type {
  Persona,
  Scenario,
  AgentCreationResult,
  PersonaParseResult,
  ValidationError,
} from "./models";

export function createAgent(scenario: Scenario, persona: Persona): AgentCreationResult {
  const errors: ValidationError[] = [];

  const personaResult = validatePersona(persona);
  if (!personaResult.valid) errors.push(...personaResult.errors);

  const scenarioResult = validateScenarioContext(scenario);
  if (!scenarioResult.valid) errors.push(...scenarioResult.errors);

  if (errors.length > 0) return { success: false, errors };

  return {
    success: true,
    agent: {
      agentId: randomUUID(),
      persona,
      scenarioId: scenario.scenario_id,
      systemPrompt: buildSystemPrompt(persona, scenario),
      status: "idle",
      createdAt: new Date(),
    },
  };
}

export function serializePersona(persona: Persona): string {
  return JSON.stringify(persona);
}

export function deserializePersona(json: string): PersonaParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    return { success: false, error: `Invalid JSON: ${(e as Error).message}` };
  }
  const result = PersonaSchema.safeParse(parsed);
  if (result.success) return { success: true, persona: result.data };
  const fields = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  return { success: false, error: `Schema validation failed: ${fields}` };
}
