import type { LLMResponse } from "./models";

export interface LLMClient {
  generate(prompt: string): Promise<LLMResponse>;
}
