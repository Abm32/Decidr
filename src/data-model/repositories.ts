import type { Prompt, Scenario, AudioAsset, Conversation } from "./schemas.js";

export interface Repository<T> {
  create(entity: T): Promise<T>;
  getById(id: string): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface PromptRepository extends Repository<Prompt> {}

export interface ScenarioRepository extends Repository<Scenario> {
  getByPromptId(promptId: string): Promise<Scenario[]>;
}

export interface AudioAssetRepository extends Repository<AudioAsset> {
  getByScenarioId(scenarioId: string): Promise<AudioAsset[]>;
}

export interface ConversationRepository extends Repository<Conversation> {
  getByScenarioId(scenarioId: string): Promise<Conversation[]>;
}
