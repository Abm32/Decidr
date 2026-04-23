import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { createDataAccessService } from "../index";
import { ReferentialIntegrityError } from "../errors";
import type { Prompt, Scenario, AudioAsset, Conversation } from "../schemas";

const now = () => new Date().toISOString();
const makePrompt = (o: Partial<Prompt> = {}): Prompt => ({ id: randomUUID(), decisionText: "test", createdAt: now(), updatedAt: now(), ...o });
const makeScenario = (promptId: string, o: Partial<Scenario> = {}): Scenario => ({
  id: randomUUID(), promptId, title: "Test", pathType: "optimistic",
  timeline: [{ year: "2025", event: "e1", emotion: "hopeful" }, { year: "2026", event: "e2", emotion: "excited" }, { year: "2027", event: "e3", emotion: "triumphant" }],
  summary: "summary", confidenceScore: 0.8, createdAt: now(), updatedAt: now(), ...o,
});
const makeAudioAsset = (scenarioId: string, o: Partial<AudioAsset> = {}): AudioAsset => ({ id: randomUUID(), scenarioId, status: "pending", createdAt: now(), updatedAt: now(), ...o });
const makeConversation = (scenarioId: string, o: Partial<Conversation> = {}): Conversation => ({ id: randomUUID(), scenarioId, messages: [], createdAt: now(), updatedAt: now(), ...o });

describe("Feature: data-model, Property 5: Referential integrity rejection", () => {
  it("rejects Scenario with non-existent promptId", async () => {
    const svc = createDataAccessService();
    await expect(svc.createScenario(makeScenario(randomUUID()))).rejects.toThrow(ReferentialIntegrityError);
  });
  it("rejects AudioAsset with non-existent scenarioId", async () => {
    const svc = createDataAccessService();
    await expect(svc.createAudioAsset(makeAudioAsset(randomUUID()))).rejects.toThrow(ReferentialIntegrityError);
  });
  it("rejects Conversation with non-existent scenarioId", async () => {
    const svc = createDataAccessService();
    await expect(svc.createConversation(makeConversation(randomUUID()))).rejects.toThrow(ReferentialIntegrityError);
  });
});

describe("Feature: data-model, Property 6: Cascade delete removes all descendants", () => {
  it("deleting a Prompt cascades to Scenarios, AudioAssets, and Conversations", async () => {
    const svc = createDataAccessService();
    const prompt = await svc.createPrompt(makePrompt());
    const s1 = await svc.createScenario(makeScenario(prompt.id));
    const s2 = await svc.createScenario(makeScenario(prompt.id));
    const a1 = await svc.createAudioAsset(makeAudioAsset(s1.id));
    const c1 = await svc.createConversation(makeConversation(s1.id));
    const a2 = await svc.createAudioAsset(makeAudioAsset(s2.id));
    await svc.deletePrompt(prompt.id);
    expect(await svc.getPrompt(prompt.id)).toBeNull();
    expect(await svc.getScenario(s1.id)).toBeNull();
    expect(await svc.getScenario(s2.id)).toBeNull();
    expect(await svc.getAudioAsset(a1.id)).toBeNull();
    expect(await svc.getAudioAsset(a2.id)).toBeNull();
    expect(await svc.getConversation(c1.id)).toBeNull();
  });

  it("deleting a Scenario cascades to its AudioAssets and Conversations", async () => {
    const svc = createDataAccessService();
    const prompt = await svc.createPrompt(makePrompt());
    const scenario = await svc.createScenario(makeScenario(prompt.id));
    const asset = await svc.createAudioAsset(makeAudioAsset(scenario.id));
    const convo = await svc.createConversation(makeConversation(scenario.id));
    await svc.deleteScenario(scenario.id);
    expect(await svc.getScenario(scenario.id)).toBeNull();
    expect(await svc.getAudioAsset(asset.id)).toBeNull();
    expect(await svc.getConversation(convo.id)).toBeNull();
    expect(await svc.getPrompt(prompt.id)).not.toBeNull();
  });
});
