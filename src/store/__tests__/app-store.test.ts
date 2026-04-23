import { describe, it, expect, beforeEach } from "vitest";
import fc from "fast-check";
import { useAppStore, getSelectedScenario, isStepCompleted, getApiState } from "../app-store.js";
import type { Step, ConversationMessage } from "@/types";
import type { Scenario } from "@/simulation-engine/models";

const STEPS: Step[] = ["decision-input", "scenario-view", "audio-experience", "conversation", "comparison"];

function mkScenario(id: string): Scenario {
  return {
    scenario_id: id, title: `Scenario ${id}`, path_type: "optimistic",
    timeline: [{ year: "2025", event: "e1", emotion: "hopeful" }, { year: "2026", event: "e2", emotion: "excited" }, { year: "2027", event: "e3", emotion: "triumphant" }],
    summary: "summary", confidence_score: 0.8,
  };
}

beforeEach(() => {
  useAppStore.setState({
    currentStep: "decision-input", completedSteps: new Set(), decisionPrompt: "",
    scenarioSet: null, selectedScenarioId: null,
    audioState: { isPlaying: false, currentTime: 0, duration: 0, audioUrl: null },
    conversationSession: { sessionId: null, isActive: false, messages: [] },
    comparisonData: null, apiStates: {},
  });
});

describe("Property 13: Atomic state update on prompt submission", () => {
  it("setScenarioSet updates prompt and scenarios atomically", () => {
    fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 200 }), (prompt) => {
      const scenarios = [mkScenario("s1"), mkScenario("s2")];
      useAppStore.getState().setScenarioSet(prompt, scenarios);
      const state = useAppStore.getState();
      expect(state.decisionPrompt).toBe(prompt);
      expect(state.scenarioSet).toEqual(scenarios);
    }), { numRuns: 100 });
  });
});

describe("Store actions", () => {
  it("setCurrentStep changes step", () => {
    useAppStore.getState().setCurrentStep("scenario-view");
    expect(useAppStore.getState().currentStep).toBe("scenario-view");
  });

  it("completeStep adds to completedSteps", () => {
    useAppStore.getState().completeStep("decision-input");
    expect(useAppStore.getState().completedSteps.has("decision-input")).toBe(true);
  });

  it("selectScenario sets selectedScenarioId", () => {
    useAppStore.getState().selectScenario("s1");
    expect(useAppStore.getState().selectedScenarioId).toBe("s1");
  });

  it("setApiState tracks per-operation state", () => {
    useAppStore.getState().setApiState("gen", { status: "loading" });
    expect(useAppStore.getState().apiStates["gen"]).toEqual({ status: "loading" });
  });

  it("updateAudioState merges partial state", () => {
    useAppStore.getState().updateAudioState({ isPlaying: true, duration: 5000 });
    const audio = useAppStore.getState().audioState;
    expect(audio.isPlaying).toBe(true);
    expect(audio.duration).toBe(5000);
    expect(audio.currentTime).toBe(0);
  });

  it("addConversationMessage appends in order", () => {
    const msg1: ConversationMessage = { id: "1", role: "user", content: "hi", timestamp: new Date() };
    const msg2: ConversationMessage = { id: "2", role: "agent", content: "hello", timestamp: new Date() };
    useAppStore.getState().addConversationMessage(msg1);
    useAppStore.getState().addConversationMessage(msg2);
    expect(useAppStore.getState().conversationSession.messages).toHaveLength(2);
    expect(useAppStore.getState().conversationSession.messages[0].content).toBe("hi");
  });

  it("resetConversation clears session", () => {
    useAppStore.getState().addConversationMessage({ id: "1", role: "user", content: "hi", timestamp: new Date() });
    useAppStore.getState().resetConversation();
    expect(useAppStore.getState().conversationSession.messages).toHaveLength(0);
    expect(useAppStore.getState().conversationSession.sessionId).toBeNull();
  });
});

describe("Selectors", () => {
  it("getSelectedScenario returns matching scenario", () => {
    const scenarios = [mkScenario("s1"), mkScenario("s2")];
    useAppStore.setState({ scenarioSet: scenarios, selectedScenarioId: "s2" });
    expect(getSelectedScenario(useAppStore.getState())?.scenario_id).toBe("s2");
  });

  it("getSelectedScenario returns undefined when no match", () => {
    expect(getSelectedScenario(useAppStore.getState())).toBeUndefined();
  });

  it("isStepCompleted returns correct state", () => {
    useAppStore.getState().completeStep("decision-input");
    expect(isStepCompleted(useAppStore.getState(), "decision-input")).toBe(true);
    expect(isStepCompleted(useAppStore.getState(), "scenario-view")).toBe(false);
  });

  it("getApiState returns idle for unknown keys", () => {
    expect(getApiState(useAppStore.getState(), "unknown")).toEqual({ status: "idle" });
  });
});
