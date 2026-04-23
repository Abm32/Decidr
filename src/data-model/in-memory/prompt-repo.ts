import type { Prompt } from "../schemas.js";
import type { PromptRepository } from "../repositories.js";
import { PromptSchema } from "../schemas.js";
import { EntityNotFoundError } from "../errors.js";

export class InMemoryPromptRepo implements PromptRepository {
  private store = new Map<string, Prompt>();

  async create(entity: Prompt): Promise<Prompt> {
    const validated = PromptSchema.parse(entity);
    this.store.set(validated.id, validated);
    return validated;
  }

  async getById(id: string): Promise<Prompt | null> {
    return this.store.get(id) ?? null;
  }

  async update(id: string, data: Partial<Prompt>): Promise<Prompt> {
    const existing = this.store.get(id);
    if (!existing) throw new EntityNotFoundError("Prompt", id);
    const updated = PromptSchema.parse({
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
}
