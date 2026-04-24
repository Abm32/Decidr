import { randomUUID } from "node:crypto";
import type {
  Agent,
  Session,
  ConversationMessage,
  ConversationHistory,
  SessionCreationResult,
  SessionCloseResult,
  ReconnectionResult,
  AddMessageResult,
} from "./models";

export interface SessionManagerConfig {
  timeoutMs: number;
  maxConcurrentSessions: number;
}

const DEFAULT_CONFIG: SessionManagerConfig = { timeoutMs: 300_000, maxConcurrentSessions: 4 };

export class SessionManager {
  private sessions = new Map<string, Session>();
  private config: SessionManagerConfig;

  constructor(config: Partial<SessionManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  createSession(agent: Agent): SessionCreationResult {
    const active = [...this.sessions.values()].filter((s) => s.status === "active").length;
    if (active >= this.config.maxConcurrentSessions) {
      return { success: false, error: "Maximum concurrent sessions reached" };
    }
    const now = new Date();
    const session: Session = {
      sessionId: randomUUID(),
      agentId: agent.agentId,
      status: "active",
      createdAt: now,
      lastActivityAt: now,
      conversationHistory: [],
    };
    this.sessions.set(session.sessionId, session);
    return { success: true, session };
  }

  getSession(sessionId: string): Session | null {
    return this.sessions.get(sessionId) ?? null;
  }

  closeSession(sessionId: string): SessionCloseResult {
    const session = this.sessions.get(sessionId);
    if (!session) return { success: false, error: `Session not found: ${sessionId}` };
    session.status = "closed";
    return { success: true };
  }

  reconnect(sessionId: string): ReconnectionResult {
    const session = this.sessions.get(sessionId);
    if (!session) return { success: false, error: `Session not found: ${sessionId}` };
    if (session.status === "closed") return { success: false, error: "Cannot reconnect to closed session" };
    if (session.status === "expired") return { success: false, error: "Cannot reconnect to expired session" };
    session.lastActivityAt = new Date();
    return { success: true, session, history: session.conversationHistory };
  }

  addMessage(sessionId: string, message: ConversationMessage): AddMessageResult {
    const session = this.sessions.get(sessionId);
    if (!session) return { success: false, error: `Session not found: ${sessionId}` };
    if (session.status !== "active") return { success: false, error: "Session is not active" };
    session.conversationHistory.push(message);
    session.lastActivityAt = new Date();
    return { success: true };
  }

  getHistory(sessionId: string): ConversationHistory | null {
    const session = this.sessions.get(sessionId);
    return session ? session.conversationHistory : null;
  }

  checkTimeouts(): void {
    const now = Date.now();
    for (const session of this.sessions.values()) {
      if (session.status === "active" && now - session.lastActivityAt.getTime() > this.config.timeoutMs) {
        session.status = "expired";
      }
    }
  }

  closeAllActive(): void {
    for (const session of this.sessions.values()) {
      if (session.status === "active") session.status = "closed";
    }
  }
}
