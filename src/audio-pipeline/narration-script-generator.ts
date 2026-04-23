import type { Scenario, NarrationScript, ScriptSegment } from "./models";

export function generateNarrationScript(scenario: Scenario): NarrationScript {
  const { scenario_id, title, path_type, timeline, summary } = scenario;
  const segments: ScriptSegment[] = [];

  segments.push({
    index: 0,
    type: "intro",
    narrationText: `${title}. This is a ${path_type} scenario.`,
    emotionalTone: timeline[0].emotion,
  });

  timeline.forEach((entry, i) => {
    segments.push({
      index: i + 1,
      type: "timeline",
      narrationText: `In ${entry.year}, ${title}: ${entry.event}`,
      emotionalTone: entry.emotion,
    });
  });

  segments.push({
    index: timeline.length + 1,
    type: "outro",
    narrationText: summary,
    emotionalTone: timeline[timeline.length - 1].emotion,
  });

  return { scenarioId: scenario_id, segments };
}
