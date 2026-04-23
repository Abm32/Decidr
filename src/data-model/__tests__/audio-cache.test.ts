import { describe, it, expect, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { AudioAssetCache } from "../audio-cache.js";
import { InMemoryAudioAssetRepo } from "../in-memory/audio-asset-repo.js";
import type { AudioAsset } from "../schemas.js";

function makeAsset(overrides: Partial<AudioAsset> = {}): AudioAsset {
  const now = new Date().toISOString();
  return { id: randomUUID(), scenarioId: randomUUID(), status: "completed", createdAt: now, updatedAt: now, ...overrides };
}

describe("Feature: data-model, Property 7: Cache hit avoids store access", () => {
  it("second getById does not call repo", async () => {
    const repo = new InMemoryAudioAssetRepo();
    const cache = new AudioAssetCache(repo);
    const asset = makeAsset();
    await repo.create(asset);
    const spy = vi.spyOn(repo, "getById");
    await cache.getById(asset.id);
    await cache.getById(asset.id);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("Feature: data-model, Property 8: Cache invalidation on mutation", () => {
  it("invalidate forces next getById to hit repo", async () => {
    const repo = new InMemoryAudioAssetRepo();
    const cache = new AudioAssetCache(repo);
    const asset = makeAsset();
    await repo.create(asset);
    await cache.getById(asset.id);
    cache.invalidate(asset.id);
    const spy = vi.spyOn(repo, "getById");
    await cache.getById(asset.id);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("clear forces all subsequent getById to hit repo", async () => {
    const repo = new InMemoryAudioAssetRepo();
    const cache = new AudioAssetCache(repo);
    const a1 = makeAsset();
    const a2 = makeAsset();
    await repo.create(a1);
    await repo.create(a2);
    await cache.getById(a1.id);
    await cache.getById(a2.id);
    cache.clear();
    const spy = vi.spyOn(repo, "getById");
    await cache.getById(a1.id);
    await cache.getById(a2.id);
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

describe("Feature: data-model, Property 9: Cache population from query", () => {
  it("getByScenarioId populates cache for individual getById", async () => {
    const repo = new InMemoryAudioAssetRepo();
    const cache = new AudioAssetCache(repo);
    const scenarioId = randomUUID();
    const a1 = makeAsset({ scenarioId });
    const a2 = makeAsset({ scenarioId });
    await repo.create(a1);
    await repo.create(a2);
    await cache.getByScenarioId(scenarioId);
    const spy = vi.spyOn(repo, "getById");
    expect(await cache.getById(a1.id)).toEqual(a1);
    expect(await cache.getById(a2.id)).toEqual(a2);
    expect(spy).not.toHaveBeenCalled();
  });
});
