import type { ScenarioMetrics, RadarChartData } from "./models";

export function generateChartData(scenarioMetrics: ScenarioMetrics[]): RadarChartData {
  const dimensions = scenarioMetrics[0].metrics.map((m) => m.dimension);
  return {
    dimensions,
    series: scenarioMetrics.map((sm) => ({
      scenarioId: sm.scenarioId,
      values: dimensions.map((d) => sm.metrics.find((m) => m.dimension === d)?.score ?? 0),
    })),
  };
}
