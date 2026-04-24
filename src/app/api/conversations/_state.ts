import { SessionManager } from "@/agent-system/session-manager";

const g = globalThis as unknown as {
  __decidr_sessionManager?: SessionManager;
  __decidr_scenarioStore?: Map<string, { agentId: string; systemPrompt: string }>;
};

export const sessionManager = g.__decidr_sessionManager ??= new SessionManager();
export const scenarioStore = g.__decidr_scenarioStore ??= new Map();
