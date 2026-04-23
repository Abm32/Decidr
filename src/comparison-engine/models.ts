import { z } from "zod";

export type { Scenario } from "../simulation-engine/models.js";

export const DimensionScoreSchema = z.object({
  dimension: z.string().min(1),
  score: z.number().min(0).max(100),
  label: z.string().min(1),
});

export const ScenarioMetricsSchema = z.object({
  scenarioId: z.string().min(1),
  title: z.string().min(1),
  metrics: z.array(DimensionScoreSchema).min(1),
});

export const RadarChartSeriesSchema = z.object({
  scenarioId: z.string().min(1),
  values: z.array(z.number().min(0).max(100)),
});

export const RadarChartDataSchema = z.object({
  dimensions: z.array(z.string().min(1)).min(1),
  series: z.array(RadarChartSeriesSchema).min(2).max(4),
});

export const ComparisonOutputSchema = z.object({
  scenarios: z.array(ScenarioMetricsSchema),
  chartData: RadarChartDataSchema,
  insights: z.string().min(1),
});

export type DimensionScore = z.infer<typeof DimensionScoreSchema>;
export type ScenarioMetrics = z.infer<typeof ScenarioMetricsSchema>;
export type RadarChartSeries = z.infer<typeof RadarChartSeriesSchema>;
export type RadarChartData = z.infer<typeof RadarChartDataSchema>;
export type ComparisonOutput = z.infer<typeof ComparisonOutputSchema>;

export interface InputValidationError {
  scenarioIndex?: number;
  field?: string;
  message: string;
}

export type InputValidationResult =
  | { valid: true; scenarios: import("../simulation-engine/models.js").Scenario[] }
  | { valid: false; errors: InputValidationError[] };

export interface RawMetrics {
  scenarioId: string;
  values: { dimension: string; rawValue: number }[];
}

export interface NormalizedMetrics {
  scenarioId: string;
  values: { dimension: string; score: number; label: string }[];
}

export type ComparisonResult =
  | { success: true; result: ComparisonOutput }
  | { success: false; error: string };

export interface DimensionConfig {
  name: string;
  min: number;
  max: number;
  extract: (scenario: import("../simulation-engine/models.js").Scenario) => number;
}

export interface NormalizerConfig {
  dimension: string;
  min: number;
  max: number;
}

export interface LLMClient {
  generate(prompt: string): Promise<{ success: true; content: string } | { success: false; error: string }>;
}
