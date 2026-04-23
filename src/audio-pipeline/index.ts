// Models & schemas
export {
  EmotionalToneSchema,
  TimelineEntrySchema,
  PathTypeSchema,
  ScenarioSchema,
  ScriptSegmentSchema,
  NarrationScriptSchema,
  VoiceStyleSchema,
  AudioStyleParamsSchema,
  EmotionAudioMapSchema,
  AudioFormatSchema,
  AudioTrackSchema,
  AudioSegmentSchema,
  AudioExperienceSchema,
  AudioStreamSchema,
  AudioPipelineConfigSchema,
} from "./models.js";

export type {
  EmotionalTone,
  TimelineEntry,
  PathType,
  Scenario,
  ScriptSegment,
  NarrationScript,
  VoiceStyle,
  AudioStyleParams,
  EmotionAudioMap,
  AudioFormat,
  AudioTrack,
  AudioSegment,
  AudioExperience,
  AudioStream,
  AudioPipelineConfig,
  TTSResult,
  SFXResult,
  MusicResult,
  AudioPipelineResult,
} from "./models.js";

// Narration script generator
export { generateNarrationScript } from "./narration-script-generator.js";

// Emotion-audio mapper
export { mapEmotion, getAllMappings } from "./emotion-audio-mapper.js";

// Client interfaces
export type { TTSClient, SFXClient, MusicProvider } from "./clients.js";

// Audio merger
export { mergeSegment, stitchSegments } from "./audio-merger.js";
export type { AudioLayers } from "./audio-merger.js";

// Stream handler
export { createStream, pushSegment, endStream, errorStream } from "./stream-handler.js";

// Pipeline orchestrator
export { AudioPipeline } from "./audio-pipeline.js";
