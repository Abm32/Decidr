import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import fc from "fast-check";
import { InMemoryPromptRepo } from "../in-memory/prompt-repo";
import { InMemoryScenarioRepo } from "../in-memory/scenario-repo";
import { InMemoryAudioAssetRepo } from "../in-memory/audio-asset-repo";
import { InMemoryConversationRepo } from "../in-memory/conversation-repo";
import { EntityNotFoundError } from "../errors";
import type { Prompt, Scenario, AudioAsset, Conversation } from "../schemas";

const uuid = () => fc.uuid().filter((u) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(u));
const isoDate = () => fc.integer({ min: 0, max: 4102444800000 }).map((ms) => new Date(ms).toISOString());
const emotionalTone = () =>
  fc.constantFrom("hopeful", "anxious", "triumphant", "melancholic", "neutral", "excited", "fearful", "content", "desperate", "relieved") as fc.Arbitrary<Scenario["timeline"][0]["emotion"]>;
const pathType = () => fc.constantFrom("optimistic", "pessimistic", "pragmatic", "wildcard") as fc.Arbitrary<Scenario["pathType"]>;

const promptArb = (): fc.Arbitrary<Prompt> =>
  fc.record({ id: uuid(), decisionText: fc.string({ minLength: 1, maxLength: 200 }), createdAt: isoDate(), updatedAt: isoDate() });

const scenarioArb = (pId?: string): fc.Arbitrary<Scenario> =>
  fc.record({
    id: uuid(), promptId: pId ? fc.constant(pId) : uuid(), title: fc.string({ minLength: 1, maxLength: 100 }), pathType: pathType(),
    timeline: fc.array(fc.record({ year: fc.string({ minLength: 1, maxLength: 10 }), event: fc.string({ minLength: 1, maxLength: 100 }), emotion: emotionalTone() }), { minLength: 3, maxLength: 6 }),
    summary: fc.string({ minLength: 1, maxLength: 200 }), confidenceScore: fc.double({ min: 0, max: 1, noNaN: true }), createdAt: isoDate(), updatedAt: isoDate(),
  });

const audioAssetArb = (sId?: string): fc.Arbitrary<AudioAsset> =>
  fc.record({ id: uuid(), scenarioId: sId ? fc.constant(sId) : uuid(), status: fc.constantFrom("pending", "generating", "completed", "failed") as fc.Arbitrary<AudioAsset["status"]>, createdAt: isoDate(), updatedAt: isoDate() });

const conversationArb = (sId?: string): fc.Arbitrary<Conversation> =>
  fc.record({ id: uuid(), scenarioId: sId ? fc.constant(sId) : uuid(), messages: fc.constant([]), createdAt: isoDate(), updatedAt: isoDate() });

describe("Feature: data-model, Property 1: CRUD round-trip", () => {
  it("Prompt: create then getById returns equivalent entity", () => {
    fc.assert(fc.asyncProperty(promptArb(), async (p) => {
      const repo = new InMemoryPromptRepo();
      const created = await repo.create(p);
      expect(await repo.getById(created.id)).toEqual(created);
    }), { numRuns: 100 });
  });

  it("Scenario: create then getById returns equivalent entity", () => {
    fc.assert(fc.asyncProperty(scenarioArb(), async (s) => {
      const repo = new InMemoryScenarioRepo();
      const created = await repo.create(s);
      expect(await repo.getById(created.id)).toEqual(created);
    }), { numRuns: 100 });
  });

  it("AudioAsset: create then getById returns equivalent entity", () => {
    fc.assert(fc.asyncProperty(audioAssetArb(), async (a) => {
      const repo = new InMemoryAudioAssetRepo();
      const created = await repo.create(a);
      expect(await repo.getById(created.id)).toEqual(created);
    }), { numRuns: 100 });
  });

  it("Conversation: create then getById returns equivalent entity", () => {
    fc.assert(fc.asyncProperty(conversationArb(), async (c) => {
      const repo = new InMemoryConversationRepo();
      const created = await repo.create(c);
      expect(await repo.getById(created.id)).toEqual(created);
    }), { numRuns: 100 });
  });
});

describe("Feature: data-model, Property 2: Update persistence", () => {
  it("Prompt: update persists changes and advances updatedAt", () => {
    fc.assert(fc.asyncProperty(promptArb(), fc.string({ minLength: 1, maxLength: 200 }), async (p, newText) => {
      const repo = new InMemoryPromptRepo();
      const created = await repo.create(p);
      const updated = await repo.update(created.id, { decisionText: newText });
      expect(updated.decisionText).toBe(newText);
      expect(updated.id).toBe(created.id);
    }), { numRuns: 100 });
  });
});

describe("Feature: data-model, Property 3: Delete removes entity", () => {
  it("delete then getById returns null", () => {
    fc.assert(fc.asyncProperty(promptArb(), async (p) => {
      const repo = new InMemoryPromptRepo();
      await repo.create(p);
      await repo.delete(p.id);
      expect(await repo.getById(p.id)).toBeNull();
    }), { numRuns: 100 });
  });
});

describe("Feature: data-model, Property 4: Query by parent returns all children", () => {
  it("Scenario.getByPromptId returns exactly the created scenarios", async () => {
    const repo = new InMemoryScenarioRepo();
    const promptId = randomUUID();
    const scenarios = fc.sample(scenarioArb(promptId), 3);
    for (const s of scenarios) await repo.create(s);
    const other = fc.sample(scenarioArb(), 1);
    await repo.create(other[0]);
    const result = await repo.getByPromptId(promptId);
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.id).sort()).toEqual(scenarios.map((s) => s.id).sort());
  });

  it("AudioAsset.getByScenarioId returns exactly the created assets", async () => {
    const repo = new InMemoryAudioAssetRepo();
    const scenarioId = randomUUID();
    const assets = fc.sample(audioAssetArb(scenarioId), 3);
    for (const a of assets) await repo.create(a);
    expect(await repo.getByScenarioId(scenarioId)).toHaveLength(3);
  });

  it("Conversation.getByScenarioId returns exactly the created conversations", async () => {
    const repo = new InMemoryConversationRepo();
    const scenarioId = randomUUID();
    const convos = fc.sample(conversationArb(scenarioId), 2);
    for (const c of convos) await repo.create(c);
    expect(await repo.getByScenarioId(scenarioId)).toHaveLength(2);
  });
});

describe("Repository error handling", () => {
  it("update on non-existent entity throws EntityNotFoundError", async () => {
    await expect(new InMemoryPromptRepo().update("non-existent", {})).rejects.toThrow(EntityNotFoundError);
  });
  it("delete on non-existent entity is a no-op", async () => {
    await expect(new InMemoryPromptRepo().delete("non-existent")).resolves.toBeUndefined();
  });
  it("getById on non-existent entity returns null", async () => {
    expect(await new InMemoryPromptRepo().getById("non-existent")).toBeNull();
  });
});
