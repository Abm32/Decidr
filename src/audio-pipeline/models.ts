import { z } from "zod";
import {
  EmotionalToneSchema,
  TimelineEntrySchema,
  PathTypeSchema,
  ScenarioSchema,
} from "../simulation-engine/models";

export {
  EmotionalToneSchema,
  TimelineEntrySchema,
  PathTypeSchema,
  ScenarioSchema,
};
export type {
  EmotionalTone,
  TimelineEntry,
  PathType,
  Scenario,
} from "../simulation-engine/models";

export const ScriptSegmentSchema = z.object({
  index: z.number().int().min(0),
  type: z.enum(["intro", "timeline", "outro"]),
  narrationText: z.string().min(1),
  emotionalTone: EmotionalToneSchema,
});

export const NarrationScriptSchema = z.object({
  scenarioId: z.string().min(1),
  segments: z.array(ScriptSegmentSchema).min(3),
});

export const VoiceStyleSchema = z.object({
  stability: z.number().min(0).max(1),
  similarityBoost: z.number().min(0).max(1),
  style: z.number().min(0).max(1),
  speakingRate: z.number().min(0.5).max(2.0),
});

export const AudioStyleParamsSchema = z.object({
  voiceStyle: VoiceStyleSchema,
  ambientDescriptor: z.string().min(1),
  musicMood: z.string().min(1),
});

export const EmotionAudioMapSchema = z.record(
  EmotionalToneSchema,
  AudioStyleParamsSchema,
);

export const AudioFormatSchema = z.enum(["mp3", "pcm"]);

export const AudioTrackSchema = z.object({
  audioBuffer: z.instanceof(Buffer),
  durationMs: z.number().positive(),
  format: AudioFormatSchema,
});

export const AudioSegmentSchema = z.object({
  index: z.number().int().min(0),
  audioBuffer: z.instanceof(Buffer),
  durationMs: z.number().positive(),
  format: AudioFormatSchema,
});

export const AudioExperienceSchema = z.object({
  scenarioId: z.string().min(1),
  audioBuffer: z.instanceof(Buffer),
  totalDurationMs: z.number().positive(),
  segmentCount: z.number().int().positive(),
  format: AudioFormatSchema,
});

export const AudioStreamSchema = z.object({
  scenarioId: z.string().min(1),
  state: z.enum(["open", "completed", "error"]),
  chunks: z.array(z.instanceof(Buffer)),
});

export const AudioPipelineConfigSchema = z.object({
  maxRetries: z.number().int().min(0).default(2),
  crossfadeMs: z.number().min(0).default(500),
  streamingEnabled: z.boolean().default(true),
});

export type ScriptSegment = z.infer<typeof ScriptSegmentSchema>;
export type NarrationScript = z.infer<typeof NarrationScriptSchema>;
export type VoiceStyle = z.infer<typeof VoiceStyleSchema>;
export type AudioStyleParams = z.infer<typeof AudioStyleParamsSchema>;
export type EmotionAudioMap = z.infer<typeof EmotionAudioMapSchema>;
export type AudioFormat = z.infer<typeof AudioFormatSchema>;
export type AudioTrack = z.infer<typeof AudioTrackSchema>;
export type AudioSegment = z.infer<typeof AudioSegmentSchema>;
export type AudioExperience = z.infer<typeof AudioExperienceSchema>;
export type AudioStream = z.infer<typeof AudioStreamSchema>;
export type AudioPipelineConfig = z.infer<typeof AudioPipelineConfigSchema>;

export type TTSResult =
  | { success: true; audioBuffer: Buffer; durationMs: number; format: AudioFormat }
  | { success: false; error: string };

export type SFXResult =
  | { success: true; audioBuffer: Buffer; durationMs: number; format: AudioFormat }
  | { success: false; error: string };

export type MusicResult =
  | { success: true; audioBuffer: Buffer; durationMs: number; format: AudioFormat }
  | { success: false; error: string };

export type AudioPipelineResult =
  | { success: true; experience: AudioExperience; stream?: AudioStream }
  | { success: false; error: string };
