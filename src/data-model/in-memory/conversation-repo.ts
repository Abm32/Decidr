import type { Conversation } from "../schemas.js";
import type { ConversationRepository } from "../repositories.js";
import { ConversationSchema } from "../schemas.js";
import { EntityNotFoundError } from "../errors.js";

export class InMemoryConversationRepo implements ConversationRepository {
  private store = new Map<string, Conversation>();

  async create(entity: Conversation): Promise<Conversation> {
    const validated = ConversationSchema.parse(entity);
    this.store.set(validated.id, validated);
    return validated;
  }

  async getById(id: string): Promise<Conversation | null> {
    return this.store.get(id) ?? null;
  }

  async update(id: string, data: Partial<Conversation>): Promise<Conversation> {
    const existing = this.store.get(id);
    if (!existing) throw new EntityNotFoundError("Conversation", id);
    const updated = ConversationSchema.parse({
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

  async getByScenarioId(scenarioId: string): Promise<Conversation[]> {
    return [...this.store.values()].filter((c) => c.scenarioId === scenarioId);
  }
}
