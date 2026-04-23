import type { Scenario } from "../simulation-engine/models.js";
import type { DimensionConfig, RawMetrics } from "./models.js";

export function extractMetrics(scenario: Scenario, dimensions: DimensionConfig[]): RawMetrics {
  return {
    scenarioId: scenario.scenario_id,
    values: dimensions.map((dim) => {
      try {
        return { dimension: dim.name, rawValue: dim.extract(scenario) };
      } catch {
        return { dimension: dim.name, rawValue: (dim.min + dim.max) / 2 };
      }
    }),
  };
}
