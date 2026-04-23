import type { Scenario } from "../schemas";
import type { ScenarioRepository } from "../repositories";
import { ScenarioSchema } from "../schemas";
import { EntityNotFoundError } from "../errors";

export class InMemoryScenarioRepo implements ScenarioRepository {
  private store = new Map<string, Scenario>();

  async create(entity: Scenario): Promise<Scenario> {
    const validated = ScenarioSchema.parse(entity);
    this.store.set(validated.id, validated);
    return validated;
  }

  async getById(id: string): Promise<Scenario | null> {
    return this.store.get(id) ?? null;
  }

  async update(id: string, data: Partial<Scenario>): Promise<Scenario> {
    const existing = this.store.get(id);
    if (!existing) throw new EntityNotFoundError("Scenario", id);
    const updated = ScenarioSchema.parse({
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

  async getByPromptId(promptId: string): Promise<Scenario[]> {
    return [...this.store.values()].filter((s) => s.promptId === promptId);
  }
}
