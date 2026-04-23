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
} from "./models";

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
} from "./models";

// Narration script generator
export { generateNarrationScript } from "./narration-script-generator";

// Emotion-audio mapper
export { mapEmotion, getAllMappings } from "./emotion-audio-mapper";

// Client interfaces
export type { TTSClient, SFXClient, MusicProvider } from "./clients";

// Audio merger
export { mergeSegment, stitchSegments } from "./audio-merger";
export type { AudioLayers } from "./audio-merger";

// Stream handler
export { createStream, pushSegment, endStream, errorStream } from "./stream-handler";

// Pipeline orchestrator
export { AudioPipeline } from "./audio-pipeline";
