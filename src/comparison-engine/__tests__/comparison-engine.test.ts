import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validateInput } from "../input-validator.js";
import { extractMetrics } from "../metric-extractor.js";
import { normalize, getLabel, normalizeBatch } from "../normalizer.js";
import { generateChartData } from "../chart-generator.js";
import { generateTemplateInsights } from "../template-fallback.js";
import { ComparisonEngine } from "../comparison-engine.js";
import { DEFAULT_DIMENSIONS, DEFAULT_NORMALIZER_CONFIGS } from "../default-dimensions.js";
import type { Scenario } from "../models.js";
import type { ScenarioMetrics, DimensionConfig, NormalizerConfig } from "../models.js";

function mkScenario(id: string, title: string, emotions: string[]): Scenario {
  return {
    scenario_id: id, title, path_type: "optimistic",
    timeline: emotions.map((e, i) => ({ year: `${2025+i}`, event: `Event ${i}`, emotion: e as any })),
    summary: "Summary", confidence_score: 0.8,
  };
}
const s1 = () => mkScenario("s1", "Optimistic Future", ["hopeful","excited","triumphant"]);
const s2 = () => mkScenario("s2", "Pessimistic Future", ["anxious","fearful","desperate"]);

describe("Property 1: Valid scenario set acceptance", () => {
  it("accepts 2-4 valid scenarios", () => {
    for (const n of [2,3,4]) {
      const scenarios = Array.from({length:n}, (_,i) => mkScenario(`s${i}`, `T${i}`, ["hopeful","neutral","content"]));
      expect(validateInput(scenarios).valid).toBe(true);
    }
  });
});

describe("Property 2: Invalid scenario count rejection", () => {
  it("rejects < 2", () => { expect(validateInput([s1()]).valid).toBe(false); });
  it("rejects > 4", () => { expect(validateInput([s1(),s2(),s1(),s2(),s1()]).valid).toBe(false); });
});

describe("Property 4: Metric extraction completeness", () => {
  it("one value per dimension", () => {
    const raw = extractMetrics(s1(), DEFAULT_DIMENSIONS);
    expect(raw.values).toHaveLength(DEFAULT_DIMENSIONS.length);
    expect(raw.values.map(v => v.dimension)).toEqual(DEFAULT_DIMENSIONS.map(d => d.name));
  });
});

describe("Property 5: Metric extraction determinism", () => {
  it("same input = same output", () => {
    const a = extractMetrics(s1(), DEFAULT_DIMENSIONS);
    const b = extractMetrics(s1(), DEFAULT_DIMENSIONS);
    expect(a).toEqual(b);
  });
});

describe("Property 6: Normalization range invariant", () => {
  it("output in [0,100], min->0, max->100", () => {
    fc.assert(fc.property(fc.double({min:-1000,max:1000,noNaN:true}), fc.double({min:-500,max:0,noNaN:true}), fc.double({min:1,max:500,noNaN:true}), (raw,mn,mx) => {
      const score = normalize(raw, {dimension:"d",min:mn,max:mn+mx});
      expect(score).toBeGreaterThanOrEqual(0); expect(score).toBeLessThanOrEqual(100);
    }), { numRuns: 100 });
  });
  it("min->0, max->100", () => {
    expect(normalize(0, {dimension:"d",min:0,max:100})).toBe(0);
    expect(normalize(100, {dimension:"d",min:0,max:100})).toBe(100);
  });
  it("min===max returns 50", () => { expect(normalize(5, {dimension:"d",min:5,max:5})).toBe(50); });
});

describe("Property 7: Normalization ordering", () => {
  it("a <= b => normalize(a) <= normalize(b)", () => {
    fc.assert(fc.property(fc.double({min:0,max:100,noNaN:true}), fc.double({min:0,max:100,noNaN:true}), (a,b) => {
      const cfg: NormalizerConfig = {dimension:"d",min:0,max:100};
      const [lo,hi] = a<=b ? [a,b] : [b,a];
      expect(normalize(lo,cfg)).toBeLessThanOrEqual(normalize(hi,cfg));
    }), { numRuns: 100 });
  });
});

describe("Property 8: Chart data structure", () => {
  it("correct dimensions and series count", () => {
    const metrics: ScenarioMetrics[] = [
      { scenarioId: "s1", title: "T1", metrics: [{dimension:"A",score:50,label:"Moderate"},{dimension:"B",score:80,label:"High"}] },
      { scenarioId: "s2", title: "T2", metrics: [{dimension:"A",score:30,label:"Low"},{dimension:"B",score:90,label:"Very High"}] },
    ];
    const chart = generateChartData(metrics);
    expect(chart.dimensions).toEqual(["A","B"]);
    expect(chart.series).toHaveLength(2);
    expect(chart.series[0].values).toEqual([50,80]);
    expect(chart.series[1].values).toEqual([30,90]);
  });
});

describe("Property 10: Template fallback", () => {
  it("produces non-empty string with titles and dimensions", () => {
    const metrics: ScenarioMetrics[] = [
      { scenarioId: "s1", title: "Good", metrics: [{dimension:"Happiness",score:90,label:"Very High"},{dimension:"Risk",score:10,label:"Very Low"}] },
      { scenarioId: "s2", title: "Bad", metrics: [{dimension:"Happiness",score:20,label:"Very Low"},{dimension:"Risk",score:80,label:"High"}] },
    ];
    const text = generateTemplateInsights(metrics);
    expect(text.length).toBeGreaterThan(0);
    expect(text).toContain("Good"); expect(text).toContain("Bad");
    expect(text).toContain("Happiness");
  });
});

describe("Property 17: Default score on extraction failure", () => {
  it("failing extractor returns midpoint", () => {
    const dims: DimensionConfig[] = [{ name: "Broken", min: 0, max: 100, extract: () => { throw new Error("fail"); } }];
    const raw = extractMetrics(s1(), dims);
    expect(raw.values[0].rawValue).toBe(50);
  });
});

describe("getLabel", () => {
  it("maps score ranges correctly", () => {
    expect(getLabel(10)).toBe("Very Low"); expect(getLabel(30)).toBe("Low");
    expect(getLabel(50)).toBe("Moderate"); expect(getLabel(70)).toBe("High");
    expect(getLabel(90)).toBe("Very High");
  });
});

describe("ComparisonEngine full pipeline", () => {
  it("compares 2 scenarios successfully", async () => {
    const engine = new ComparisonEngine();
    const r = await engine.compare([s1(), s2()]);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.result.scenarios).toHaveLength(2);
      expect(r.result.chartData.series).toHaveLength(2);
      expect(r.result.insights.length).toBeGreaterThan(0);
    }
  });
  it("rejects invalid input", async () => {
    const r = await new ComparisonEngine().compare([s1()]);
    expect(r.success).toBe(false);
  });
});
