import type { LLMClient } from "./llm-client";
import type { SimulationResult, SimulationEngineConfig, Scenario } from "./models";
import { validateInput } from "./input-validator";
import { renderTemplate, DEFAULT_TEMPLATE } from "./prompt-template-renderer";
import { parseResponse } from "./response-parser";
import { validateSchema } from "./schema-validator";
import { selectPathTypes, verifyDiversity } from "./variation-engine";

const DEFAULT_CONFIG: SimulationEngineConfig = { scenarioCount: 3, maxRetries: 2 };

export class SimulationEngine {
  constructor(private llmClient: LLMClient) {}

  async simulate(prompt: string, config?: Partial<SimulationEngineConfig>): Promise<SimulationResult> {
    const { scenarioCount, maxRetries } = { ...DEFAULT_CONFIG, ...config };

    const inputResult = validateInput(prompt);
    if (!inputResult.valid) return { success: false, error: inputResult.error };

    const pathTypes = selectPathTypes(scenarioCount);
    const scenarios: Scenario[] = [];

    for (const pathType of pathTypes) {
      const rendered = renderTemplate(DEFAULT_TEMPLATE, { decisionPrompt: inputResult.sanitizedPrompt, pathType });
      let lastError = "";

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const llmResult = await this.llmClient.generate(rendered);
        if (!llmResult.success) { lastError = llmResult.error; continue; }

        const parsed = parseResponse(llmResult.content);
        if (!parsed.success) { lastError = parsed.error; continue; }

        const validated = validateSchema(parsed.scenario);
        if (!validated.valid) { lastError = validated.errors.map((e) => `${e.field}: ${e.message}`).join(", "); continue; }

        scenarios.push(validated.scenario);
        lastError = "";
        break;
      }

      if (lastError) return { success: false, error: `Failed to generate ${pathType} scenario after ${maxRetries + 1} attempts: ${lastError}` };
    }

    const diversity = verifyDiversity(scenarios);
    if (!diversity.diverse) return { success: false, error: diversity.reason };

    return { success: true, scenarios };
  }
}
