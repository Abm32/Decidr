import type { LLMResponse } from "./models.js";

export interface LLMClient {
  generate(prompt: string): Promise<LLMResponse>;
}
