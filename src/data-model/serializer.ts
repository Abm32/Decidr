import {
  PromptSchema,
  ScenarioSchema,
  AudioAssetSchema,
  ConversationSchema,
} from "./schemas.js";
import type { Prompt, Scenario, AudioAsset, Conversation } from "./schemas.js";
import { DeserializationError } from "./errors.js";
import { ZodError, type ZodSchema } from "zod";

function deserialize<T>(json: string, schema: ZodSchema<T>, entityType: string): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    throw new DeserializationError(`Invalid JSON for ${entityType}: ${(e as Error).message}`);
  }
  try {
    return schema.parse(parsed);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new DeserializationError(
        `Schema validation failed for ${entityType}: ${e.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")}`,
      );
    }
    throw e;
  }
}

export class EntitySerializer {
  static serializePrompt(prompt: Prompt): string {
    return JSON.stringify(prompt);
  }
  static deserializePrompt(json: string): Prompt {
    return deserialize(json, PromptSchema, "Prompt");
  }

  static serializeScenario(scenario: Scenario): string {
    return JSON.stringify(scenario);
  }
  static deserializeScenario(json: string): Scenario {
    return deserialize(json, ScenarioSchema, "Scenario");
  }

  static serializeAudioAsset(asset: AudioAsset): string {
    return JSON.stringify(asset);
  }
  static deserializeAudioAsset(json: string): AudioAsset {
    return deserialize(json, AudioAssetSchema, "AudioAsset");
  }

  static serializeConversation(conversation: Conversation): string {
    return JSON.stringify(conversation);
  }
  static deserializeConversation(json: string): Conversation {
    return deserialize(json, ConversationSchema, "Conversation");
  }
}
