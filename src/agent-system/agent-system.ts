import { createAgent } from "./agent-factory";
import { SessionManager } from "./session-manager";
import type { VoiceClient } from "./voice-client";
import type {
  Agent,
  Persona,
  Scenario,
  ConversationHistory,
  AgentCreationResult,
  SessionCreationResult,
  SessionCloseResult,
  ReconnectionResult,
  VoiceResponseResult,
} from "./models";

export interface AgentSystemConfig {
  sessionTimeoutMs: number;
  maxConcurrentSessions: number;
}

export class AgentSystem {
  private agents = new Map<string, Agent>();
  private sessionManager: SessionManager;
  private voiceClient: VoiceClient;

  constructor(voiceClient: VoiceClient, config?: Partial<AgentSystemConfig>) {
    this.voiceClient = voiceClient;
    this.sessionManager = new SessionManager({
      timeoutMs: config?.sessionTimeoutMs,
      maxConcurrentSessions: config?.maxConcurrentSessions,
    });
  }

  initializeAgent(scenario: Scenario, persona: Persona): AgentCreationResult {
    const result = createAgent(scenario, persona);
    if (result.success) this.agents.set(result.agent.agentId, result.agent);
    return result;
  }

  async startConversation(agentId: string): Promise<SessionCreationResult> {
    const agent = this.agents.get(agentId);
    if (!agent) return { success: false, error: `Agent not found: ${agentId}` };
    const result = this.sessionManager.createSession(agent);
    if (!result.success) return result;
    const voiceResult = await this.voiceClient.connect(result.session, agent.systemPrompt);
    if (!voiceResult.success) {
      this.sessionManager.closeSession(result.session.sessionId);
      return { success: false, error: voiceResult.error };
    }
    agent.status = "in_session";
    return result;
  }

  async sendMessage(sessionId: string, audioBuffer: Buffer): Promise<VoiceResponseResult> {
    const session = this.sessionManager.getSession(sessionId);
    if (!session || session.status !== "active") {
      return { success: false, error: `Session not found or not active: ${sessionId}` };
    }
    const result = await this.voiceClient.sendAudio(sessionId, audioBuffer);
    if (result.success) {
      const now = new Date();
      this.sessionManager.addMessage(sessionId, { timestamp: now, role: "user", content: "audio" });
      this.sessionManager.addMessage(sessionId, { timestamp: now, role: "agent", content: result.transcript });
    }
    return result;
  }

  async endConversation(sessionId: string): Promise<SessionCloseResult> {
    const session = this.sessionManager.getSession(sessionId);
    if (!session) return { success: false, error: `Session not found: ${sessionId}` };
    await this.voiceClient.disconnect(sessionId);
    const agent = this.agents.get(session.agentId);
    if (agent) agent.status = "idle";
    return this.sessionManager.closeSession(sessionId);
  }

  async reconnect(sessionId: string): Promise<ReconnectionResult> {
    const result = this.sessionManager.reconnect(sessionId);
    if (!result.success) return result;
    const agent = this.agents.get(result.session.agentId);
    if (agent) {
      const voiceResult = await this.voiceClient.connect(result.session, agent.systemPrompt);
      if (!voiceResult.success) return { success: false, error: voiceResult.error };
    }
    return result;
  }

  getConversationHistory(sessionId: string): ConversationHistory | null {
    return this.sessionManager.getHistory(sessionId);
  }
}
