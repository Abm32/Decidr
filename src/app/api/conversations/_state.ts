import { SessionManager } from "@/agent-system/session-manager";

export const sessionManager = new SessionManager();
export const scenarioStore = new Map<string, { agentId: string; systemPrompt: string }>();
