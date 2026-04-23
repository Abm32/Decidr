import type {
  Session,
  VoiceConnectionResult,
  VoiceResponseResult,
  VoiceDisconnectResult,
} from "./models.js";

export interface VoiceClient {
  connect(session: Session, systemPrompt: string): Promise<VoiceConnectionResult>;
  sendAudio(sessionId: string, audioBuffer: Buffer): Promise<VoiceResponseResult>;
  disconnect(sessionId: string): Promise<VoiceDisconnectResult>;
}
