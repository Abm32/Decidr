import type { Scenario } from "../simulation-engine/models.js";
import type { DimensionConfig, NormalizerConfig, LLMClient, ComparisonResult, ScenarioMetrics } from "./models.js";
import { ComparisonOutputSchema } from "./models.js";
import { validateInput } from "./input-validator.js";
import { extractMetrics } from "./metric-extractor.js";
import { normalizeBatch } from "./normalizer.js";
import { generateChartData } from "./chart-generator.js";
import { InsightGenerator } from "./insight-generator.js";
import { DEFAULT_DIMENSIONS, DEFAULT_NORMALIZER_CONFIGS } from "./default-dimensions.js";

export class ComparisonEngine {
  private dimensions: DimensionConfig[];
  private normalizerConfigs: NormalizerConfig[];
  private insightGenerator: InsightGenerator;

  constructor(config?: { dimensions: DimensionConfig[]; normalizerConfigs: NormalizerConfig[] }, llmClient?: LLMClient) {
    this.dimensions = config?.dimensions ?? DEFAULT_DIMENSIONS;
    this.normalizerConfigs = config?.normalizerConfigs ?? DEFAULT_NORMALIZER_CONFIGS;
    this.insightGenerator = new InsightGenerator(llmClient);
  }

  async compare(scenarios: Scenario[]): Promise<ComparisonResult> {
    try {
      const validation = validateInput(scenarios);
      if (!validation.valid) return { success: false, error: validation.errors.map((e) => e.message).join("; ") };

      const scenarioMetrics: ScenarioMetrics[] = validation.scenarios.map((s) => {
        const raw = extractMetrics(s, this.dimensions);
        const normalized = normalizeBatch(raw, this.normalizerConfigs);
        return { scenarioId: s.scenario_id, title: s.title, metrics: normalized.values };
      });

      const chartData = generateChartData(scenarioMetrics);
      const insights = await this.insightGenerator.generate(scenarioMetrics, chartData);
      const result = { scenarios: scenarioMetrics, chartData, insights };

      ComparisonOutputSchema.parse(result);
      return { success: true, result };
    } catch (e) {
      return { success: false, error: `Comparison failed: ${e instanceof Error ? e.message : String(e)}` };
    }
  }
}
