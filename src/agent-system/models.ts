import { z } from "zod";

export {
  ScenarioSchema,
  TimelineEntrySchema,
  EmotionalToneSchema,
  PathTypeSchema,
} from "../simulation-engine/models.js";
import type { Scenario, TimelineEntry, EmotionalTone, PathType } from "../simulation-engine/models.js";
export type { Scenario, TimelineEntry, EmotionalTone, PathType };

export const PersonaSchema = z.object({
  identity: z.string().min(1),
  year: z.string().regex(/^\d{4}$/),
  personality: z.string().min(1),
  knowledge_scope: z.string().min(1),
});

export const AgentStatusSchema = z.enum(["idle", "in_session", "terminated"]);

export const AgentSchema = z.object({
  agentId: z.string().uuid(),
  persona: PersonaSchema,
  scenarioId: z.string().min(1),
  systemPrompt: z.string().min(1),
  status: AgentStatusSchema,
  createdAt: z.date(),
});

export const SessionStatusSchema = z.enum(["active", "closed", "expired"]);

export const ConversationMessageSchema = z.object({
  timestamp: z.date(),
  role: z.enum(["user", "agent"]),
  content: z.string().min(1),
});

export const SessionSchema = z.object({
  sessionId: z.string().uuid(),
  agentId: z.string().uuid(),
  status: SessionStatusSchema,
  createdAt: z.date(),
  lastActivityAt: z.date(),
  conversationHistory: z.array(ConversationMessageSchema),
});

export type Persona = z.infer<typeof PersonaSchema>;
export type AgentStatus = z.infer<typeof AgentStatusSchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type SessionStatus = z.infer<typeof SessionStatusSchema>;
export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;
export type ConversationHistory = ConversationMessage[];
export type Session = z.infer<typeof SessionSchema>;

export interface ValidationError {
  field: string;
  message: string;
}

export type PersonaValidationResult =
  | { valid: true; persona: Persona }
  | { valid: false; errors: ValidationError[] };

export type ScenarioValidationResult =
  | { valid: true; scenario: Scenario }
  | { valid: false; errors: ValidationError[] };

export type AgentCreationResult =
  | { success: true; agent: Agent }
  | { success: false; errors: ValidationError[] };

export type SessionCreationResult =
  | { success: true; session: Session }
  | { success: false; error: string };

export type SessionCloseResult =
  | { success: true }
  | { success: false; error: string };

export type ReconnectionResult =
  | { success: true; session: Session; history: ConversationHistory }
  | { success: false; error: string };

export type AddMessageResult =
  | { success: true }
  | { success: false; error: string };

export type VoiceConnectionResult =
  | { success: true; connectionId: string }
  | { success: false; error: string };

export type VoiceResponseResult =
  | { success: true; audioBuffer: Buffer; transcript: string }
  | { success: false; error: string };

export type VoiceDisconnectResult =
  | { success: true }
  | { success: false; error: string };

export type PersonaParseResult =
  | { success: true; persona: Persona }
  | { success: false; error: string };
