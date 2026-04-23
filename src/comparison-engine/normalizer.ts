import type { NormalizerConfig, RawMetrics, NormalizedMetrics } from "./models.js";

export function normalize(rawValue: number, config: NormalizerConfig): number {
  if (config.min === config.max) return 50;
  const score = ((rawValue - config.min) / (config.max - config.min)) * 100;
  return Math.round(Math.min(100, Math.max(0, score)) * 100) / 100;
}

export function getLabel(score: number): string {
  if (score <= 20) return "Very Low";
  if (score <= 40) return "Low";
  if (score <= 60) return "Moderate";
  if (score <= 80) return "High";
  return "Very High";
}

export function normalizeBatch(rawMetrics: RawMetrics, configs: NormalizerConfig[]): NormalizedMetrics {
  return {
    scenarioId: rawMetrics.scenarioId,
    values: rawMetrics.values.map((v) => {
      const cfg = configs.find((c) => c.dimension === v.dimension);
      const score = cfg ? normalize(v.rawValue, cfg) : 50;
      return { dimension: v.dimension, score, label: getLabel(score) };
    }),
  };
}
