export type {
  Scenario,
  TimelineEntry,
  PathType,
  EmotionalTone,
} from "@/simulation-engine/models";

export type Step =
  | "decision-input"
  | "scenario-view"
  | "audio-experience"
  | "conversation"
  | "comparison";

export const STEP_ORDER: Step[] = [
  "decision-input",
  "scenario-view",
  "audio-experience",
  "conversation",
  "comparison",
];

export interface AppError {
  message: string;
  code?: string;
  isNetworkError: boolean;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

export type ApiRequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; error: AppError };

export interface ConversationMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

export interface AudioPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioUrl: string | null;
}

export interface ConversationSessionState {
  sessionId: string | null;
  isActive: boolean;
  messages: ConversationMessage[];
}

export interface ComparisonMetric {
  name: string;
  values: { scenarioId: string; value: number; label: string }[];
}

export interface ComparisonData {
  metrics: ComparisonMetric[];
  summary: string;
}
