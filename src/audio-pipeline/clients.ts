import type { VoiceStyle, TTSResult, SFXResult, MusicResult } from "./models.js";

export interface TTSClient {
  synthesize(text: string, voiceStyle: VoiceStyle): Promise<TTSResult>;
}

export interface SFXClient {
  generate(descriptor: string, durationMs: number): Promise<SFXResult>;
}

export interface MusicProvider {
  getTrack(mood: string, durationMs: number): Promise<MusicResult>;
}
