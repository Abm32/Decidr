import type { AudioAsset } from "./schemas";
import type { AudioAssetRepository } from "./repositories";

export class AudioAssetCache {
  private cache = new Map<string, AudioAsset>();

  constructor(private repo: AudioAssetRepository) {}

  async getById(id: string): Promise<AudioAsset | null> {
    const cached = this.cache.get(id);
    if (cached) return cached;
    const result = await this.repo.getById(id);
    if (result) this.cache.set(id, result);
    return result;
  }

  async getByScenarioId(scenarioId: string): Promise<AudioAsset[]> {
    const results = await this.repo.getByScenarioId(scenarioId);
    for (const asset of results) this.cache.set(asset.id, asset);
    return results;
  }

  invalidate(id: string): void {
    this.cache.delete(id);
  }

  clear(): void {
    this.cache.clear();
  }
}
