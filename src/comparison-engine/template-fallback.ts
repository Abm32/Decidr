import type { ScenarioMetrics } from "./models";

export function generateTemplateInsights(scenarioMetrics: ScenarioMetrics[]): string {
  const lines: string[] = [];

  for (const sm of scenarioMetrics) {
    const sorted = [...sm.metrics].sort((a, b) => b.score - a.score);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    lines.push(`${sm.title}: Best in ${best.dimension} (${best.score}), Worst in ${worst.dimension} (${worst.score}).`);
  }

  const dimensions = scenarioMetrics[0].metrics.map((m) => m.dimension);
  for (const dim of dimensions) {
    const leader = scenarioMetrics.reduce((best, sm) => {
      const score = sm.metrics.find((m) => m.dimension === dim)?.score ?? 0;
      const bestScore = best.metrics.find((m) => m.dimension === dim)?.score ?? 0;
      return score > bestScore ? sm : best;
    });
    lines.push(`${dim}: ${leader.title} leads.`);
  }

  return lines.join("\n");
}
