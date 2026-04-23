import { z } from "zod";

export const EmotionalToneSchema = z.enum([
  "hopeful", "anxious", "triumphant", "melancholic",
  "neutral", "excited", "fearful", "content",
  "desperate", "relieved",
]);

export const TimelineEntrySchema = z.object({
  year: z.string().min(1),
  event: z.string().min(1),
  emotion: EmotionalToneSchema,
});

export const PathTypeSchema = z.enum([
  "optimistic", "pessimistic", "pragmatic", "wildcard",
]);

export const AudioStatusSchema = z.enum([
  "pending", "generating", "completed", "failed",
]);

export const MessageRoleSchema = z.enum(["user", "assistant", "system"]);

export const MessageSchema = z.object({
  role: MessageRoleSchema,
  content: z.string().min(1),
  timestamp: z.string().datetime(),
});

export const PromptSchema = z.object({
  id: z.string().uuid(),
  decisionText: z.string().min(1),
  userId: z.string().min(1).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ScenarioSchema = z.object({
  id: z.string().uuid(),
  promptId: z.string().uuid(),
  title: z.string().min(1),
  pathType: PathTypeSchema,
  timeline: z.array(TimelineEntrySchema).min(3),
  summary: z.string().min(1),
  confidenceScore: z.number().min(0).max(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const AudioAssetSchema = z.object({
  id: z.string().uuid(),
  scenarioId: z.string().uuid(),
  fileUrl: z.string().url().optional(),
  mimeType: z.string().min(1).optional(),
  durationMs: z.number().int().nonnegative().optional(),
  status: AudioStatusSchema,
  errorMessage: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  scenarioId: z.string().uuid(),
  messages: z.array(MessageSchema),
  agentContext: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type EmotionalTone = z.infer<typeof EmotionalToneSchema>;
export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;
export type PathType = z.infer<typeof PathTypeSchema>;
export type AudioStatus = z.infer<typeof AudioStatusSchema>;
export type MessageRole = z.infer<typeof MessageRoleSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Prompt = z.infer<typeof PromptSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;
export type AudioAsset = z.infer<typeof AudioAssetSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
