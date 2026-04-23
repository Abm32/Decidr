import type { PathType, Scenario, VariationResult } from "./models.js";

const ALL_PATH_TYPES: PathType[] = ["optimistic", "pessimistic", "pragmatic", "wildcard"];

export function selectPathTypes(count: number): PathType[] {
  return ALL_PATH_TYPES.slice(0, Math.min(count, ALL_PATH_TYPES.length));
}

export function verifyDiversity(scenarios: Scenario[]): VariationResult {
  // Check unique path types
  const pathTypes = new Set(scenarios.map((s) => s.path_type));
  if (pathTypes.size !== scenarios.length) return { diverse: false, reason: "Duplicate path types found" };

  // Check emotional tone diversity (at least 2 different final tones)
  if (scenarios.length >= 2) {
    const finalTones = scenarios.map((s) => s.timeline[s.timeline.length - 1].emotion);
    if (new Set(finalTones).size < 2) return { diverse: false, reason: "Insufficient emotional tone diversity" };
  }

  // Check non-duplicate summaries
  const summaries = new Set(scenarios.map((s) => s.summary));
  if (summaries.size !== scenarios.length) return { diverse: false, reason: "Duplicate scenario summaries detected" };

  return { diverse: true };
}
