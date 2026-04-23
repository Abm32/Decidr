import type { AudioTrack, AudioSegment, AudioExperience, AudioFormat } from "./models.js";

export interface AudioLayers {
  narration: AudioTrack;
  ambient?: AudioTrack;
  music?: AudioTrack;
}

export function mergeSegment(layers: AudioLayers, index: number = 0): AudioSegment {
  const { narration, ambient, music } = layers;
  const buffers: Buffer[] = [narration.audioBuffer];

  if (ambient) buffers.push(ambient.audioBuffer);
  if (music) buffers.push(music.audioBuffer);

  return {
    index,
    audioBuffer: Buffer.concat(buffers),
    durationMs: narration.durationMs,
    format: narration.format,
  };
}

export function stitchSegments(
  segments: AudioSegment[],
  crossfadeMs: number,
  scenarioId: string,
): AudioExperience {
  const buffers = segments.map((s) => s.audioBuffer);
  const sumDuration = segments.reduce((acc, s) => acc + s.durationMs, 0);
  const totalDurationMs = sumDuration - Math.max(0, segments.length - 1) * crossfadeMs;
  const format: AudioFormat = segments[0]?.format ?? "mp3";

  return {
    scenarioId,
    audioBuffer: Buffer.concat(buffers),
    totalDurationMs: Math.max(totalDurationMs, 0),
    segmentCount: segments.length,
    format,
  };
}
