import type { ParseResult } from "./models";
import { ScenarioSchema } from "./models";

export function parseResponse(raw: string): ParseResult {
  // Extract JSON from possible markdown code fences or surrounding text
  let jsonStr = raw.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();

  // Try to find a JSON object if there's surrounding text
  if (!jsonStr.startsWith("{")) {
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objMatch) jsonStr = objMatch[0];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return { success: false, error: `Invalid JSON: ${jsonStr.slice(0, 100)}` };
  }

  const result = ScenarioSchema.safeParse(parsed);
  if (result.success) return { success: true, scenario: result.data };
  return {
    success: false,
    error: `Schema validation failed: ${result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
  };
}
