export * from "./schemas.js";
export * from "./errors.js";
export * from "./repositories.js";
export { AudioAssetCache } from "./audio-cache.js";
export { DataAccessService } from "./data-access-service.js";
export { EntitySerializer } from "./serializer.js";
export { InMemoryPromptRepo } from "./in-memory/prompt-repo.js";
export { InMemoryScenarioRepo } from "./in-memory/scenario-repo.js";
export { InMemoryAudioAssetRepo } from "./in-memory/audio-asset-repo.js";
export { InMemoryConversationRepo } from "./in-memory/conversation-repo.js";

import { InMemoryPromptRepo } from "./in-memory/prompt-repo.js";
import { InMemoryScenarioRepo } from "./in-memory/scenario-repo.js";
import { InMemoryAudioAssetRepo } from "./in-memory/audio-asset-repo.js";
import { InMemoryConversationRepo } from "./in-memory/conversation-repo.js";
import { AudioAssetCache } from "./audio-cache.js";
import { DataAccessService } from "./data-access-service.js";

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
