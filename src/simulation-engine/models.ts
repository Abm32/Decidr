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

export const ScenarioSchema = z.object({
  scenario_id: z.string().min(1),
  title: z.string().min(1),
  path_type: PathTypeSchema,
  timeline: z.array(TimelineEntrySchema).min(3),
  summary: z.string().min(1),
  confidence_score: z.number().min(0).max(1),
});

export const ScenarioSetSchema = z.array(ScenarioSchema).min(2).max(4);

export type EmotionalTone = z.infer<typeof EmotionalToneSchema>;
export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;
export type PathType = z.infer<typeof PathTypeSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;
export type ScenarioSet = z.infer<typeof ScenarioSetSchema>;

export type ValidationResult =
  | { valid: true; sanitizedPrompt: string }
  | { valid: false; error: string };

export type LLMResponse =
  | { success: true; content: string }
  | { success: false; error: string };

export type ParseResult =
  | { success: true; scenario: Scenario }
  | { success: false; error: string };

export type SchemaValidationResult =
  | { valid: true; scenario: Scenario }
  | { valid: false; errors: SchemaError[] };

export interface SchemaError {
  field: string;
  message: string;
}

export type VariationResult =
  | { diverse: true }
  | { diverse: false; reason: string };

export type SimulationResult =
  | { success: true; scenarios: Scenario[] }
  | { success: false; error: string };

export interface SimulationEngineConfig {
  scenarioCount: number;
  maxRetries: number;
}

export interface PromptTemplate {
  templateId: string;
  templateText: string;
}

export interface TemplateVariables {
  decisionPrompt: string;
  pathType: PathType;
}
