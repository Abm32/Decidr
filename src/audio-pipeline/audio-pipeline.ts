import type {
  Scenario,
  AudioPipelineConfig,
  AudioPipelineResult,
  AudioSegment,
  AudioTrack,
  TTSResult,
  SFXResult,
  MusicResult,
} from "./models.js";
import { AudioPipelineConfigSchema } from "./models.js";
import type { TTSClient, SFXClient, MusicProvider } from "./clients.js";
import { generateNarrationScript } from "./narration-script-generator.js";
import { mapEmotion } from "./emotion-audio-mapper.js";
import { mergeSegment, stitchSegments } from "./audio-merger.js";
import { createStream, pushSegment, endStream, errorStream } from "./stream-handler.js";

async function withRetry<T extends { success: boolean }>(
  fn: () => Promise<T>,
  retries: number,
): Promise<T> {
  let result = await fn();
  for (let i = 0; i < retries && !result.success; i++) {
    result = await fn();
  }
  return result;
}

export class AudioPipeline {
  constructor(
    private ttsClient: TTSClient,
    private sfxClient: SFXClient,
    private musicProvider: MusicProvider,
  ) {}

  async process(
    scenario: Scenario,
    config?: Partial<AudioPipelineConfig>,
  ): Promise<AudioPipelineResult> {
    const cfg = AudioPipelineConfigSchema.parse(config ?? {});
    const script = generateNarrationScript(scenario);
    const stream = cfg.streamingEnabled ? createStream(scenario.scenario_id) : undefined;
    const audioSegments: AudioSegment[] = [];

    try {
      for (const seg of script.segments) {
        const style = mapEmotion(seg.emotionalTone);

        const [ttsResult, sfxResult, musicResult] = await Promise.all([
          withRetry(() => this.ttsClient.synthesize(seg.narrationText, style.voiceStyle), cfg.maxRetries),
          withRetry(() => this.sfxClient.generate(style.ambientDescriptor, 10000), cfg.maxRetries),
          this.musicProvider.getTrack(style.musicMood, 10000).catch((e): MusicResult => {
            console.warn(`Music generation failed: ${e}`);
            return { success: false, error: String(e) };
          }),
        ]);

        if (!ttsResult.success) {
          if (stream) errorStream(stream, ttsResult.error);
          return { success: false, error: `TTS failed for segment ${seg.index}: ${ttsResult.error}` };
        }
        if (!sfxResult.success) {
          if (stream) errorStream(stream, sfxResult.error);
          return { success: false, error: `SFX failed for segment ${seg.index}: ${sfxResult.error}` };
        }

        const narration: AudioTrack = { audioBuffer: ttsResult.audioBuffer, durationMs: ttsResult.durationMs, format: ttsResult.format };
        const ambient: AudioTrack | undefined = sfxResult.success
          ? { audioBuffer: sfxResult.audioBuffer, durationMs: sfxResult.durationMs, format: sfxResult.format }
          : undefined;
        const music: AudioTrack | undefined = musicResult.success
          ? { audioBuffer: musicResult.audioBuffer, durationMs: musicResult.durationMs, format: musicResult.format }
          : undefined;

        if (!musicResult.success) {
          console.warn(`Continuing without music for segment ${seg.index}`);
        }

        const merged = mergeSegment({ narration, ambient, music }, seg.index);
        audioSegments.push(merged);

        if (stream) pushSegment(stream, merged);
      }

      const experience = stitchSegments(audioSegments, cfg.crossfadeMs, scenario.scenario_id);
      if (stream) endStream(stream);

      return { success: true, experience, stream: stream ?? undefined };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (stream) errorStream(stream, msg);
      return { success: false, error: msg };
    }
  }
}
