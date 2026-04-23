import type { AudioStream, AudioSegment } from "./models";

export function createStream(scenarioId: string): AudioStream {
  return { scenarioId, state: "open", chunks: [] };
}

export function pushSegment(stream: AudioStream, segment: AudioSegment): void {
  if (stream.state !== "open") {
    console.warn(`Cannot push to stream in state "${stream.state}"`);
    return;
  }
  stream.chunks.push(segment.audioBuffer);
}

export function endStream(stream: AudioStream): void {
  if (stream.state !== "open") {
    console.warn(`Cannot end stream in state "${stream.state}"`);
    return;
  }
  stream.state = "completed";
}

export function errorStream(stream: AudioStream, error: string): void {
  if (stream.state !== "open") {
    console.warn(`Cannot error stream in state "${stream.state}"`);
    return;
  }
  stream.state = "error";
}
