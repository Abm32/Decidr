import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { EntitySerializer } from "../serializer";
import { DeserializationError } from "../errors";
import type { Prompt, Scenario } from "../schemas";

const uuid = () => fc.uuid().filter((u) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(u));
const isoDate = () => fc.integer({ min: 0, max: 4102444800000 }).map((ms) => new Date(ms).toISOString());
const emotionalTone = () =>
  fc.constantFrom("hopeful", "anxious", "triumphant", "melancholic", "neutral", "excited", "fearful", "content", "desperate", "relieved") as fc.Arbitrary<Scenario["timeline"][0]["emotion"]>;
const pathType = () => fc.constantFrom("optimistic", "pessimistic", "pragmatic", "wildcard") as fc.Arbitrary<Scenario["pathType"]>;

const promptArb = (): fc.Arbitrary<Prompt> =>
  fc.record({ id: uuid(), decisionText: fc.string({ minLength: 1, maxLength: 200 }), createdAt: isoDate(), updatedAt: isoDate() });

const scenarioArb = (): fc.Arbitrary<Scenario> =>
  fc.record({
    id: uuid(), promptId: uuid(), title: fc.string({ minLength: 1, maxLength: 100 }), pathType: pathType(),
    timeline: fc.array(fc.record({ year: fc.string({ minLength: 1, maxLength: 10 }), event: fc.string({ minLength: 1, maxLength: 100 }), emotion: emotionalTone() }), { minLength: 3, maxLength: 6 }),
    summary: fc.string({ minLength: 1, maxLength: 200 }), confidenceScore: fc.double({ min: 0, max: 1, noNaN: true }), createdAt: isoDate(), updatedAt: isoDate(),
  });

describe("Feature: data-model, Property 10: Serialization round-trip", () => {
  it("Prompt: serialize then deserialize produces equivalent object", () => {
    fc.assert(fc.property(promptArb(), (p) => {
      expect(EntitySerializer.deserializePrompt(EntitySerializer.serializePrompt(p))).toEqual(p);
    }), { numRuns: 100 });
  });

  it("Scenario: serialize then deserialize produces equivalent object", () => {
    fc.assert(fc.property(scenarioArb(), (s) => {
      expect(EntitySerializer.deserializeScenario(EntitySerializer.serializeScenario(s))).toEqual(s);
    }), { numRuns: 100 });
  });
});

describe("Feature: data-model, Property 11: Invalid JSON deserialization returns errors", () => {
  it("invalid JSON throws DeserializationError", () => {
    expect(() => EntitySerializer.deserializePrompt("{bad json")).toThrow(DeserializationError);
  });
  it("valid JSON but invalid schema throws DeserializationError", () => {
    expect(() => EntitySerializer.deserializePrompt('{"id": "not-uuid"}')).toThrow(DeserializationError);
  });
  it("random non-JSON strings throw DeserializationError", () => {
    fc.assert(fc.property(
      fc.string().filter((s) => { try { JSON.parse(s); return false; } catch { return true; } }),
      (s) => { expect(() => EntitySerializer.deserializePrompt(s)).toThrow(DeserializationError); },
    ), { numRuns: 100 });
  });
});
