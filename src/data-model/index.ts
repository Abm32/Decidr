export * from "./schemas";
export * from "./errors";
export * from "./repositories";
export { AudioAssetCache } from "./audio-cache";
export { DataAccessService } from "./data-access-service";
export { EntitySerializer } from "./serializer";
export { InMemoryPromptRepo } from "./in-memory/prompt-repo";
export { InMemoryScenarioRepo } from "./in-memory/scenario-repo";
export { InMemoryAudioAssetRepo } from "./in-memory/audio-asset-repo";
export { InMemoryConversationRepo } from "./in-memory/conversation-repo";

import { InMemoryPromptRepo } from "./in-memory/prompt-repo";
import { InMemoryScenarioRepo } from "./in-memory/scenario-repo";
import { InMemoryAudioAssetRepo } from "./in-memory/audio-asset-repo";
import { InMemoryConversationRepo } from "./in-memory/conversation-repo";
import { AudioAssetCache } from "./audio-cache";
import { DataAccessService } from "./data-access-service";

export function createDataAccessService(): DataAccessService {
  const audioAssetRepo = new InMemoryAudioAssetRepo();
  return new DataAccessService(
    new InMemoryPromptRepo(),
    new InMemoryScenarioRepo(),
    audioAssetRepo,
    new InMemoryConversationRepo(),
    new AudioAssetCache(audioAssetRepo),
  );
}
