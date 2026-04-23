import type {
  PromptRepository,
  ScenarioRepository,
  AudioAssetRepository,
  ConversationRepository,
} from "./repositories";
import type { Prompt, Scenario, AudioAsset, Conversation } from "./schemas";
import type { AudioAssetCache } from "./audio-cache";
import { ReferentialIntegrityError } from "./errors";

export class DataAccessService {
  constructor(
    private prompts: PromptRepository,
    private scenarios: ScenarioRepository,
    private audioAssets: AudioAssetRepository,
    private conversations: ConversationRepository,
    private audioCache: AudioAssetCache,
  ) {}

  // Prompt
  async createPrompt(data: Prompt): Promise<Prompt> {
    return this.prompts.create(data);
  }
  async getPrompt(id: string): Promise<Prompt | null> {
    return this.prompts.getById(id);
  }
  async updatePrompt(id: string, data: Partial<Prompt>): Promise<Prompt> {
    return this.prompts.update(id, data);
  }
  async deletePrompt(id: string): Promise<void> {
    const scenarios = await this.scenarios.getByPromptId(id);
    for (const s of scenarios) await this.deleteScenario(s.id);
    await this.prompts.delete(id);
  }

  // Scenario
  async createScenario(data: Scenario): Promise<Scenario> {
    const parent = await this.prompts.getById(data.promptId);
    if (!parent) throw new ReferentialIntegrityError("Scenario", "Prompt", data.promptId);
    return this.scenarios.create(data);
  }
  async getScenario(id: string): Promise<Scenario | null> {
    return this.scenarios.getById(id);
  }
  async getScenariosByPromptId(promptId: string): Promise<Scenario[]> {
    return this.scenarios.getByPromptId(promptId);
  }
  async updateScenario(id: string, data: Partial<Scenario>): Promise<Scenario> {
    return this.scenarios.update(id, data);
  }
  async deleteScenario(id: string): Promise<void> {
    const [assets, convos] = await Promise.all([
      this.audioAssets.getByScenarioId(id),
      this.conversations.getByScenarioId(id),
    ]);
    for (const a of assets) {
      this.audioCache.invalidate(a.id);
      await this.audioAssets.delete(a.id);
    }
    for (const c of convos) await this.conversations.delete(c.id);
    await this.scenarios.delete(id);
  }

  // AudioAsset
  async createAudioAsset(data: AudioAsset): Promise<AudioAsset> {
    const parent = await this.scenarios.getById(data.scenarioId);
    if (!parent) throw new ReferentialIntegrityError("AudioAsset", "Scenario", data.scenarioId);
    return this.audioAssets.create(data);
  }
  async getAudioAsset(id: string): Promise<AudioAsset | null> {
    return this.audioCache.getById(id);
  }
  async getAudioAssetsByScenarioId(scenarioId: string): Promise<AudioAsset[]> {
    return this.audioCache.getByScenarioId(scenarioId);
  }
  async updateAudioAsset(id: string, data: Partial<AudioAsset>): Promise<AudioAsset> {
    this.audioCache.invalidate(id);
    return this.audioAssets.update(id, data);
  }
  async deleteAudioAsset(id: string): Promise<void> {
    this.audioCache.invalidate(id);
    await this.audioAssets.delete(id);
  }

  // Conversation
  async createConversation(data: Conversation): Promise<Conversation> {
    const parent = await this.scenarios.getById(data.scenarioId);
    if (!parent) throw new ReferentialIntegrityError("Conversation", "Scenario", data.scenarioId);
    return this.conversations.create(data);
  }
  async getConversation(id: string): Promise<Conversation | null> {
    return this.conversations.getById(id);
  }
  async getConversationsByScenarioId(scenarioId: string): Promise<Conversation[]> {
    return this.conversations.getByScenarioId(scenarioId);
  }
  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation> {
    return this.conversations.update(id, data);
  }
  async deleteConversation(id: string): Promise<void> {
    await this.conversations.delete(id);
  }
}
