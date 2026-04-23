import type { EmotionalTone, AudioStyleParams, EmotionAudioMap } from "./models";

const MAPPINGS: EmotionAudioMap = {
  hopeful:     { voiceStyle: { stability: 0.7, similarityBoost: 0.8, style: 0.6, speakingRate: 1.0 }, ambientDescriptor: "birds chirping, gentle breeze", musicMood: "uplifting orchestral" },
  anxious:     { voiceStyle: { stability: 0.4, similarityBoost: 0.7, style: 0.8, speakingRate: 1.2 }, ambientDescriptor: "ticking clock, distant thunder", musicMood: "tense strings" },
  triumphant:  { voiceStyle: { stability: 0.8, similarityBoost: 0.9, style: 0.9, speakingRate: 0.9 }, ambientDescriptor: "crowd cheering, fireworks", musicMood: "epic orchestral fanfare" },
  melancholic: { voiceStyle: { stability: 0.6, similarityBoost: 0.8, style: 0.7, speakingRate: 0.8 }, ambientDescriptor: "gentle rain, distant wind", musicMood: "slow piano melody" },
  neutral:     { voiceStyle: { stability: 0.7, similarityBoost: 0.7, style: 0.5, speakingRate: 1.0 }, ambientDescriptor: "soft white noise, office ambiance", musicMood: "minimal ambient" },
  excited:     { voiceStyle: { stability: 0.5, similarityBoost: 0.8, style: 0.9, speakingRate: 1.1 }, ambientDescriptor: "bustling city, energetic crowd", musicMood: "upbeat electronic" },
  fearful:     { voiceStyle: { stability: 0.3, similarityBoost: 0.6, style: 0.8, speakingRate: 1.3 }, ambientDescriptor: "howling wind, creaking doors", musicMood: "dark suspenseful drone" },
  content:     { voiceStyle: { stability: 0.8, similarityBoost: 0.8, style: 0.5, speakingRate: 0.9 }, ambientDescriptor: "crackling fireplace, soft rain", musicMood: "warm acoustic guitar" },
  desperate:   { voiceStyle: { stability: 0.3, similarityBoost: 0.5, style: 0.9, speakingRate: 1.4 }, ambientDescriptor: "sirens, heavy rain, thunder", musicMood: "intense dramatic strings" },
  relieved:    { voiceStyle: { stability: 0.7, similarityBoost: 0.9, style: 0.6, speakingRate: 0.9 }, ambientDescriptor: "ocean waves, birds singing", musicMood: "gentle piano resolution" },
};

export function mapEmotion(tone: EmotionalTone): AudioStyleParams {
  return MAPPINGS[tone] ?? MAPPINGS.neutral!;
}


export function getAllMappings(): EmotionAudioMap {
  return { ...MAPPINGS };
}
