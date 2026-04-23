import { create } from "zustand";
import type { Scenario } from "@/simulation-engine/models";
import type {
  Step,
  AudioPlaybackState,
  ConversationSessionState,
  ComparisonData,
  ApiRequestState,
  ConversationMessage,
} from "@/types";

interface AppState {
  currentStep: Step;
  completedSteps: Set<Step>;
  decisionPrompt: string;
  scenarioSet: Scenario[] | null;
  selectedScenarioId: string | null;
  audioState: AudioPlaybackState;
  conversationSession: ConversationSessionState;
  comparisonData: ComparisonData | null;
  apiStates: Record<string, ApiRequestState>;
}

interface AppActions {
  setDecisionPrompt: (prompt: string) => void;
  setScenarioSet: (prompt: string, scenarios: Scenario[]) => void;
  selectScenario: (id: string) => void;
  setCurrentStep: (step: Step) => void;
  completeStep: (step: Step) => void;
  setApiState: (key: string, state: ApiRequestState) => void;
  updateAudioState: (state: Partial<AudioPlaybackState>) => void;
  addConversationMessage: (message: ConversationMessage) => void;
  setComparisonData: (data: ComparisonData) => void;
  resetConversation: () => void;
}

const initialAudioState: AudioPlaybackState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  audioUrl: null,
};

const initialConversationSession: ConversationSessionState = {
  sessionId: null,
  isActive: false,
  messages: [],
};

export const useAppStore = create<AppState & AppActions>()((set, get) => ({
  currentStep: "decision-input",
  completedSteps: new Set(),
  decisionPrompt: "",
  scenarioSet: null,
  selectedScenarioId: null,
  audioState: initialAudioState,
  conversationSession: initialConversationSession,
  comparisonData: null,
  apiStates: {},

  setDecisionPrompt: (prompt) => set({ decisionPrompt: prompt }),

  setScenarioSet: (prompt, scenarios) =>
    set({ decisionPrompt: prompt, scenarioSet: scenarios }),

  selectScenario: (id) => set({ selectedScenarioId: id }),

  setCurrentStep: (step) => set({ currentStep: step }),

  completeStep: (step) =>
    set((s) => ({ completedSteps: new Set(s.completedSteps).add(step) })),

  setApiState: (key, state) =>
    set((s) => ({ apiStates: { ...s.apiStates, [key]: state } })),

  updateAudioState: (partial) =>
    set((s) => ({ audioState: { ...s.audioState, ...partial } })),

  addConversationMessage: (message) =>
    set((s) => ({
      conversationSession: {
        ...s.conversationSession,
        messages: [...s.conversationSession.messages, message],
      },
    })),

  setComparisonData: (data) => set({ comparisonData: data }),

  resetConversation: () =>
    set({ conversationSession: initialConversationSession }),
}));

// Selectors
export const getSelectedScenario = (state: AppState): Scenario | undefined =>
  state.scenarioSet?.find((s) => s.scenario_id === state.selectedScenarioId);

export const isStepCompleted = (state: AppState, step: Step): boolean =>
  state.completedSteps.has(step);

export const getApiState = (
  state: AppState,
  key: string,
): ApiRequestState => state.apiStates[key] ?? { status: "idle" };
