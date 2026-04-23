import type { AudioAsset } from "../schemas.js";
import type { AudioAssetRepository } from "../repositories.js";
import { AudioAssetSchema } from "../schemas.js";
import { EntityNotFoundError } from "../errors.js";

export class InMemoryAudioAssetRepo implements AudioAssetRepository {
  private store = new Map<string, AudioAsset>();

  async create(entity: AudioAsset): Promise<AudioAsset> {
    const validated = AudioAssetSchema.parse(entity);
    this.store.set(validated.id, validated);
    return validated;
  }

  async getById(id: string): Promise<AudioAsset | null> {
    return this.store.get(id) ?? null;
  }

  async update(id: string, data: Partial<AudioAsset>): Promise<AudioAsset> {
    const existing = this.store.get(id);
    if (!existing) throw new EntityNotFoundError("AudioAsset", id);
    const updated = AudioAssetSchema.parse({
      ...existing,
      ...data,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    });
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async getByScenarioId(scenarioId: string): Promise<AudioAsset[]> {
    return [...this.store.values()].filter((a) => a.scenarioId === scenarioId);
  }
}
