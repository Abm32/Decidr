import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  PromptSchema,
  ScenarioSchema,
  AudioAssetSchema,
  ConversationSchema,
} from "../schemas";

const uuid = () => fc.uuid().filter((u) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(u));
const isoDate = () =>
  fc.integer({ min: 0, max: 4102444800000 }).map((ms) => new Date(ms).toISOString());
const emotionalTone = () =>
  fc.constantFrom(
    "hopeful", "anxious", "triumphant", "melancholic",
    "neutral", "excited", "fearful", "content",
    "desperate", "relieved",
  );
const pathType = () => fc.constantFrom("optimistic", "pessimistic", "pragmatic", "wildcard");
const audioStatus = () => fc.constantFrom("pending", "generating", "completed", "failed");

const timelineEntry = () =>
  fc.record({
    year: fc.string({ minLength: 1, maxLength: 10 }),
    event: fc.string({ minLength: 1, maxLength: 100 }),
    emotion: emotionalTone(),
  });

const promptArb = () =>
  fc.record({ id: uuid(), decisionText: fc.string({ minLength: 1, maxLength: 200 }), createdAt: isoDate(), updatedAt: isoDate() });

const scenarioArb = () =>
  fc.record({
    id: uuid(), promptId: uuid(), title: fc.string({ minLength: 1, maxLength: 100 }), pathType: pathType(),
    timeline: fc.array(timelineEntry(), { minLength: 3, maxLength: 6 }),
    summary: fc.string({ minLength: 1, maxLength: 200 }),
    confidenceScore: fc.double({ min: 0, max: 1, noNaN: true }),
    createdAt: isoDate(), updatedAt: isoDate(),
  });

const audioAssetArb = () =>
  fc.record({ id: uuid(), scenarioId: uuid(), status: audioStatus(), createdAt: isoDate(), updatedAt: isoDate() });

const conversationArb = () =>
  fc.record({
    id: uuid(), scenarioId: uuid(),
    messages: fc.array(
      fc.record({ role: fc.constantFrom("user", "assistant", "system"), content: fc.string({ minLength: 1, maxLength: 100 }), timestamp: isoDate() }),
      { minLength: 0, maxLength: 3 },
    ),
    createdAt: isoDate(), updatedAt: isoDate(),
  });

describe("Feature: data-model, Property 12: Schema validation rejects invalid entities", () => {
  it("rejects Prompt with empty decisionText", () => {
    fc.assert(fc.property(promptArb(), (p) => {
      expect(PromptSchema.safeParse({ ...p, decisionText: "" }).success).toBe(false);
    }), { numRuns: 100 });
  });

  it("rejects Prompt with invalid UUID", () => {
    fc.assert(fc.property(promptArb(), (p) => {
      expect(PromptSchema.safeParse({ ...p, id: "not-a-uuid" }).success).toBe(false);
    }), { numRuns: 100 });
  });

  it("rejects Scenario with confidenceScore > 1", () => {
    fc.assert(fc.property(scenarioArb(), (s) => {
      expect(ScenarioSchema.safeParse({ ...s, confidenceScore: 1.5 }).success).toBe(false);
    }), { numRuns: 100 });
  });

  it("rejects Scenario with fewer than 3 timeline entries", () => {
    fc.assert(fc.property(scenarioArb(), (s) => {
      expect(ScenarioSchema.safeParse({ ...s, timeline: s.timeline.slice(0, 2) }).success).toBe(false);
    }), { numRuns: 100 });
  });

  it("accepts valid Prompt", () => {
    fc.assert(fc.property(promptArb(), (p) => {
      expect(PromptSchema.safeParse(p).success).toBe(true);
    }), { numRuns: 100 });
  });

  it("accepts valid Scenario", () => {
    fc.assert(fc.property(scenarioArb(), (s) => {
      expect(ScenarioSchema.safeParse(s).success).toBe(true);
    }), { numRuns: 100 });
  });

  it("accepts valid AudioAsset", () => {
    fc.assert(fc.property(audioAssetArb(), (a) => {
      expect(AudioAssetSchema.safeParse(a).success).toBe(true);
    }), { numRuns: 100 });
  });

  it("accepts valid Conversation", () => {
    fc.assert(fc.property(conversationArb(), (c) => {
      expect(ConversationSchema.safeParse(c).success).toBe(true);
    }), { numRuns: 100 });
  });
});
