import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validateInput } from "../input-validator.js";
import { renderTemplate, DEFAULT_TEMPLATE } from "../prompt-template-renderer.js";
import { validateSchema } from "../schema-validator.js";
import { selectPathTypes, verifyDiversity } from "../variation-engine.js";
import { parseResponse } from "../response-parser.js";
import { serializeScenario, deserializeScenario } from "../scenario-serializer.js";
import { SimulationEngine } from "../simulation-engine.js";
import type { LLMClient } from "../llm-client.js";
import type { Scenario, PathType } from "../models.js";

// Helper: make a valid scenario
function makeScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    scenario_id: "s1", title: "Test", path_type: "optimistic",
    timeline: [
      { year: "2025", event: "e1", emotion: "hopeful" },
      { year: "2026", event: "e2", emotion: "excited" },
      { year: "2027", event: "e3", emotion: "triumphant" },
    ],
    summary: "A good outcome", confidence_score: 0.8, ...overrides,
  };
}

// Mock LLM that returns valid scenarios with distinct path types, summaries, and final emotions
function mockLLM(): LLMClient {
  const emotions = ["hopeful", "anxious", "triumphant", "melancholic"] as const;
  let callIndex = 0;
  return {
    async generate(prompt: string) {
      const i = callIndex++;
      const pathTypes: PathType[] = ["optimistic", "pessimistic", "pragmatic", "wildcard"];
      const pt = pathTypes[i % 4];
      return {
        success: true as const,
        content: JSON.stringify(makeScenario({
          scenario_id: `s${i}`, path_type: pt, summary: `Summary ${i}`,
          timeline: [
            { year: "2025", event: "e1", emotion: emotions[i % 4] },
            { year: "2026", event: "e2", emotion: "neutral" },
            { year: "2027", event: "e3", emotion: emotions[(i + 1) % 4] },
          ],
        })),
      };
    },
  };
}

// --- InputValidator ---
describe("Feature: simulation-engine, Property 1: Valid input acceptance", () => {
  it("accepts non-empty, non-whitespace strings ≤ 2000 chars", () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 2000 }).filter((s) => s.trim().length > 0),
      (s) => { const r = validateInput(s); expect(r.valid).toBe(true); },
    ), { numRuns: 100 });
  });
});

describe("Feature: simulation-engine, Property 2: Invalid input rejection", () => {
  it("rejects empty strings", () => { expect(validateInput("").valid).toBe(false); });
  it("rejects whitespace-only strings", () => { expect(validateInput("   \t\n").valid).toBe(false); });
  it("rejects strings over 2000 chars", () => {
    fc.assert(fc.property(
      fc.string({ minLength: 2001, maxLength: 3000 }).filter((s) => s.trim().length > 2000),
      (s) => { expect(validateInput(s).valid).toBe(false); },
    ), { numRuns: 100 });
  });
});

// --- PromptTemplateRenderer ---
describe("Feature: simulation-engine, Property 8: Template rendering replaces all placeholders", () => {
  it("no {{...}} tokens remain after rendering", () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 200 }),
      fc.constantFrom("optimistic", "pessimistic", "pragmatic", "wildcard") as fc.Arbitrary<PathType>,
      (prompt, pt) => {
        const result = renderTemplate(DEFAULT_TEMPLATE, { decisionPrompt: prompt, pathType: pt });
        expect(result).not.toMatch(/\{\{.*?\}\}/);
      },
    ), { numRuns: 100 });
  });
});

describe("Feature: simulation-engine, Property 9: Template rendering is deterministic", () => {
  it("same inputs produce identical output", () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 200 }),
      fc.constantFrom("optimistic", "pessimistic", "pragmatic", "wildcard") as fc.Arbitrary<PathType>,
      (prompt, pt) => {
        const vars = { decisionPrompt: prompt, pathType: pt };
        expect(renderTemplate(DEFAULT_TEMPLATE, vars)).toBe(renderTemplate(DEFAULT_TEMPLATE, vars));
      },
    ), { numRuns: 100 });
  });
});

// --- SchemaValidator ---
describe("Feature: simulation-engine, Property 6: Valid scenarios pass schema validation", () => {
  it("well-formed scenario is accepted", () => {
    const r = validateSchema(makeScenario());
    expect(r.valid).toBe(true);
  });
});

describe("Feature: simulation-engine, Property 7: Invalid scenarios fail with field-level errors", () => {
  it("rejects confidence_score > 1", () => {
    const r = validateSchema({ ...makeScenario(), confidence_score: 1.5 });
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.errors.some((e) => e.field.includes("confidence_score"))).toBe(true);
  });
  it("rejects empty timeline", () => {
    const r = validateSchema({ ...makeScenario(), timeline: [] });
    expect(r.valid).toBe(false);
  });
  it("rejects missing title", () => {
    const r = validateSchema({ ...makeScenario(), title: "" });
    expect(r.valid).toBe(false);
  });
});

// --- ResponseParser ---
describe("ResponseParser", () => {
  it("parses valid JSON", () => {
    const r = parseResponse(JSON.stringify(makeScenario()));
    expect(r.success).toBe(true);
  });
  it("parses JSON in code fences", () => {
    const r = parseResponse("```json\n" + JSON.stringify(makeScenario()) + "\n```");
    expect(r.success).toBe(true);
  });
  it("parses JSON with surrounding text", () => {
    const r = parseResponse("Here is the scenario:\n" + JSON.stringify(makeScenario()) + "\nDone.");
    expect(r.success).toBe(true);
  });
  it("returns error for invalid text", () => {
    const r = parseResponse("not json at all");
    expect(r.success).toBe(false);
  });
});

// --- ScenarioSerializer ---
describe("Feature: simulation-engine, Property 10: Scenario serialization round-trip", () => {
  it("deserialize(serialize(scenario)) equals original", () => {
    const s = makeScenario();
    const r = deserializeScenario(serializeScenario(s));
    expect(r.success).toBe(true);
    if (r.success) expect(r.scenario).toEqual(s);
  });
});

describe("Feature: simulation-engine, Property 11: Invalid JSON deserialization returns errors", () => {
  it("invalid JSON returns error", () => {
    expect(deserializeScenario("{bad").success).toBe(false);
  });
  it("valid JSON but invalid schema returns error", () => {
    expect(deserializeScenario('{"title":"x"}').success).toBe(false);
  });
});

// --- VariationEngine ---
describe("VariationEngine", () => {
  it("selectPathTypes returns requested count of unique types", () => {
    for (let n = 2; n <= 4; n++) {
      const types = selectPathTypes(n);
      expect(types).toHaveLength(n);
      expect(new Set(types).size).toBe(n);
    }
  });

  it("verifyDiversity accepts diverse scenarios", () => {
    const scenarios = [
      makeScenario({ path_type: "optimistic", summary: "s1", timeline: [{ year: "2025", event: "e", emotion: "hopeful" }, { year: "2026", event: "e", emotion: "hopeful" }, { year: "2027", event: "e", emotion: "hopeful" }] }),
      makeScenario({ path_type: "pessimistic", summary: "s2", timeline: [{ year: "2025", event: "e", emotion: "anxious" }, { year: "2026", event: "e", emotion: "anxious" }, { year: "2027", event: "e", emotion: "anxious" }] }),
    ];
    expect(verifyDiversity(scenarios)).toEqual({ diverse: true });
  });

  it("verifyDiversity rejects duplicate path types", () => {
    const scenarios = [makeScenario({ path_type: "optimistic", summary: "s1" }), makeScenario({ path_type: "optimistic", summary: "s2" })];
    const r = verifyDiversity(scenarios);
    expect(r.diverse).toBe(false);
  });

  it("verifyDiversity rejects duplicate summaries", () => {
    const scenarios = [
      makeScenario({ path_type: "optimistic", summary: "same", timeline: [{ year: "2025", event: "e", emotion: "hopeful" }, { year: "2026", event: "e", emotion: "hopeful" }, { year: "2027", event: "e", emotion: "hopeful" }] }),
      makeScenario({ path_type: "pessimistic", summary: "same", timeline: [{ year: "2025", event: "e", emotion: "anxious" }, { year: "2026", event: "e", emotion: "anxious" }, { year: "2027", event: "e", emotion: "anxious" }] }),
    ];
    const r = verifyDiversity(scenarios);
    expect(r.diverse).toBe(false);
  });
});

// --- SimulationEngine orchestrator ---
describe("Feature: simulation-engine, Property 3: Scenario count invariant", () => {
  it("produces exactly N scenarios for count 2-4", async () => {
    for (const n of [2, 3, 4]) {
      const engine = new SimulationEngine(mockLLM());
      const result = await engine.simulate("Should I change careers?", { scenarioCount: n });
      expect(result.success).toBe(true);
      if (result.success) expect(result.scenarios).toHaveLength(n);
    }
  });
});

describe("Feature: simulation-engine, Property 12: LLM errors produce graceful failure", () => {
  it("returns error result on LLM failure", async () => {
    const failingLLM: LLMClient = { async generate() { return { success: false, error: "timeout" }; } };
    const engine = new SimulationEngine(failingLLM);
    const result = await engine.simulate("test prompt");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain("Failed to generate");
  });
});

describe("SimulationEngine retry behavior", () => {
  it("retries on malformed LLM output then succeeds", async () => {
    let calls = 0;
    const llm: LLMClient = {
      async generate() {
        calls++;
        if (calls === 1) return { success: true, content: "not json" };
        const pathTypes: PathType[] = ["optimistic", "pessimistic", "pragmatic"];
        const emotions = ["hopeful", "anxious", "triumphant"] as const;
        const i = calls - 2;
        return {
          success: true as const,
          content: JSON.stringify(makeScenario({
            scenario_id: `s${i}`, path_type: pathTypes[i % 3], summary: `Summary ${i}`,
            timeline: [
              { year: "2025", event: "e1", emotion: emotions[i % 3] },
              { year: "2026", event: "e2", emotion: "neutral" },
              { year: "2027", event: "e3", emotion: emotions[(i + 1) % 3] },
            ],
          })),
        };
      },
    };
    const engine = new SimulationEngine(llm);
    const result = await engine.simulate("test", { scenarioCount: 3 });
    expect(result.success).toBe(true);
    expect(calls).toBeGreaterThan(3); // at least one retry happened
  });
});
