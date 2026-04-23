import type { LLMClient, ScenarioMetrics, RadarChartData } from "./models";
import { generateTemplateInsights } from "./template-fallback";

export class InsightGenerator {
  constructor(private llmClient?: LLMClient) {}

  async generate(scenarioMetrics: ScenarioMetrics[], chartData: RadarChartData): Promise<string> {
    if (!this.llmClient) return generateTemplateInsights(scenarioMetrics);

    try {
      const prompt = `Compare these scenarios:\n${JSON.stringify({ scenarioMetrics, chartData })}\nProvide insights on strengths, weaknesses, and trade-offs.`;
      const result = await this.llmClient.generate(prompt);
      if (result.success && result.content.length > 0) return result.content;
    } catch {
      // fall through to template
    }

    return generateTemplateInsights(scenarioMetrics);
  }
}
