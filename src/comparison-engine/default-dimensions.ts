import type { Scenario } from "../simulation-engine/models.js";
import type { DimensionConfig, NormalizerConfig } from "./models.js";

const POSITIVE_TONES = new Set(["hopeful", "triumphant", "excited", "content", "relieved"]);
const NEGATIVE_TONES = new Set(["anxious", "melancholic", "fearful", "desperate"]);
const POSITIVE_FINANCIAL = ["wealth", "salary", "investment", "profit", "promotion", "raise", "savings"];
const NEGATIVE_FINANCIAL = ["debt", "bankrupt", "loss", "fired", "unemployed"];
const GROWTH_KEYWORDS = ["learned", "mastered", "promoted", "achieved", "developed", "grew", "improved", "graduated"];

function countTones(scenario: Scenario, tones: Set<string>): number {
  return scenario.timeline.filter((e) => tones.has(e.emotion)).length;
}

function keywordScore(text: string, positive: string[], negative: string[]): number {
  const lower = text.toLowerCase();
  const pos = positive.filter((k) => lower.includes(k)).length;
  const neg = negative.filter((k) => lower.includes(k)).length;
  const total = pos + neg;
  return total === 0 ? 50 : (pos / total) * 100;
}

export const DEFAULT_DIMENSIONS: DimensionConfig[] = [
  {
    name: "Happiness",
    min: 0,
    max: 100,
    extract: (s: Scenario) => {
      const total = s.timeline.length;
      return total === 0 ? 50 : (countTones(s, POSITIVE_TONES) / total) * 100;
    },
  },
  {
    name: "Risk",
    min: 0,
    max: 100,
    extract: (s: Scenario) => {
      const total = s.timeline.length;
      return total === 0 ? 50 : (countTones(s, NEGATIVE_TONES) / total) * 100;
    },
  },
  {
    name: "Financial Outcome",
    min: 0,
    max: 100,
    extract: (s: Scenario) => {
      const text = s.timeline.map((e) => e.event).join(" ") + " " + s.summary;
      return keywordScore(text, POSITIVE_FINANCIAL, NEGATIVE_FINANCIAL);
    },
  },
  {
    name: "Personal Growth",
    min: 0,
    max: 100,
    extract: (s: Scenario) => {
      const text = s.timeline.map((e) => e.event).join(" ");
      const matches = GROWTH_KEYWORDS.filter((k) => text.toLowerCase().includes(k)).length;
      return Math.min((matches / GROWTH_KEYWORDS.length) * 100, 100);
    },
  },
];

export const DEFAULT_NORMALIZER_CONFIGS: NormalizerConfig[] = DEFAULT_DIMENSIONS.map((d) => ({
  dimension: d.name,
  min: d.min,
  max: d.max,
}));
