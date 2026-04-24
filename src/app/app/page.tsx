'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore, getApiState } from '@/store/app-store';
import { createApiClient } from '@/api/api-client';
import { STEP_ORDER, type Step, type ApiRequestState } from '@/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StepNavigator } from '@/components/StepNavigator';
import { InputPanel } from '@/components/InputPanel';
import { ScenarioCard } from '@/components/ScenarioCard';
import { AudioPlayer } from '@/components/AudioPlayer';
import { ConversationInterface } from '@/components/ConversationInterface';
import { ComparisonView } from '@/components/ComparisonView';

const apiClient = createApiClient();

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.25 } };

const STEP_TITLES: Record<Step, string> = {
  'decision-input': 'What decision are you facing?',
  'scenario-view': 'Choose a future to explore',
  'audio-experience': 'Listen to your future',
  'conversation': 'Talk to your future self',
  'comparison': 'Compare all futures',
};

const STEP_SUBTITLES: Record<Step, string> = {
  'decision-input': 'Be specific — the more context you give, the richer your scenarios.',
  'scenario-view': 'Click any card to dive into that timeline. Expand to see the full journey.',
  'audio-experience': 'An AI-narrated walkthrough of your chosen scenario.',
  'conversation': 'Ask questions, get perspective from the future version of you.',
  'comparison': 'Side-by-side analysis across every dimension that matters.',
};

function errFrom(s: ApiRequestState) {
  return s.status === 'error' ? s.error : null;
}

export default function AppPage() {
  const store = useAppStore();
  const { currentStep, completedSteps, scenarioSet, selectedScenarioId, audioState, conversationSession, comparisonData } = store;

  const apiScenarios = getApiState(store, 'generateScenarios');
  const apiAudio = getApiState(store, 'generateAudio');
  const apiConversation = getApiState(store, 'sendMessage');
  const apiStartConvo = getApiState(store, 'startConversation');
  const apiComparison = getApiState(store, 'getComparison');

  const advance = useCallback(() => {
    const idx = STEP_ORDER.indexOf(currentStep);
    if (idx < STEP_ORDER.length - 1) store.setCurrentStep(STEP_ORDER[idx + 1]);
  }, [currentStep, store]);

  const handleSubmit = useCallback(async (prompt: string) => {
    store.setApiState('generateScenarios', { status: 'loading' });
    const result = await apiClient.generateScenarios(prompt);
    if (result.success) {
      store.setScenarioSet(prompt, result.data);
      store.setApiState('generateScenarios', { status: 'success' });
      store.completeStep('decision-input');
      advance();
    } else {
      store.setApiState('generateScenarios', { status: 'error', error: result.error });
    }
  }, [store, advance]);

  const handleSelectScenario = useCallback((id: string) => {
    store.selectScenario(id);
    store.completeStep('scenario-view');
    advance();
  }, [store, advance]);

  useEffect(() => {
    if (currentStep !== 'audio-experience' || !selectedScenarioId || apiAudio.status === 'loading' || apiAudio.status === 'success') return;
    const scenario = scenarioSet?.find((s) => s.scenario_id === selectedScenarioId);
    (async () => {
      store.setApiState('generateAudio', { status: 'loading' });
      const result = await apiClient.generateAudio(selectedScenarioId, scenario ?? undefined);
      if (result.success) {
        store.updateAudioState({ audioUrl: result.data.audioUrl, duration: result.data.totalDurationMs / 1000 });
        store.setApiState('generateAudio', { status: 'success' });
      } else {
        store.setApiState('generateAudio', { status: 'error', error: result.error });
      }
    })();
  }, [currentStep, selectedScenarioId, apiAudio.status, store, scenarioSet]);

  const handleAudioComplete = useCallback(() => {
    store.completeStep('audio-experience');
    advance();
  }, [store, advance]);

  useEffect(() => {
    if (currentStep !== 'conversation' || !selectedScenarioId || conversationSession.sessionId || apiStartConvo.status === 'loading') return;
    const scenario = scenarioSet?.find((s) => s.scenario_id === selectedScenarioId);
    (async () => {
      store.setApiState('startConversation', { status: 'loading' });
      const result = await apiClient.startConversation(selectedScenarioId, scenario ?? undefined);
      if (result.success) {
        store.setConversationSessionId(result.data.sessionId);
        store.addConversationMessage({ id: 'system-start', role: 'agent', content: `I'm the future version of you from the "${scenario?.title ?? 'selected'}" timeline. Ask me anything about this journey.`, timestamp: new Date() });
        store.setApiState('startConversation', { status: 'success' });
      } else {
        store.setApiState('startConversation', { status: 'error', error: result.error });
      }
    })();
  }, [currentStep, selectedScenarioId, conversationSession.sessionId, apiStartConvo.status, store, scenarioSet]);

  const handleSendMessage = useCallback(async (content: string) => {
    const sid = conversationSession.sessionId ?? 'default';
    store.addConversationMessage({ id: `user-${Date.now()}`, role: 'user', content, timestamp: new Date() });
    store.setApiState('sendMessage', { status: 'loading' });
    const result = await apiClient.sendMessage(sid, content);
    if (result.success) {
      store.addConversationMessage(result.data);
      store.setApiState('sendMessage', { status: 'success' });
    } else {
      store.setApiState('sendMessage', { status: 'error', error: result.error });
    }
  }, [conversationSession.sessionId, store]);

  useEffect(() => {
    if (currentStep !== 'comparison' || !scenarioSet || apiComparison.status === 'loading' || apiComparison.status === 'success') return;
    (async () => {
      store.setApiState('getComparison', { status: 'loading' });
      const ids = scenarioSet.map((s) => s.scenario_id);
      const result = await apiClient.getComparison(ids);
      if (result.success) {
        store.setComparisonData(result.data);
        store.setApiState('getComparison', { status: 'success' });
      } else {
        store.setApiState('getComparison', { status: 'error', error: result.error });
      }
    })();
  }, [currentStep, scenarioSet, apiComparison.status, store]);

  const retryAudio = useCallback(() => { store.setApiState('generateAudio', { status: 'idle' }); }, [store]);
  const retryComparison = useCallback(() => { store.setApiState('getComparison', { status: 'idle' }); }, [store]);
  const retryConversation = useCallback(() => { store.setApiState('startConversation', { status: 'idle' }); }, [store]);

  const selectedScenario = scenarioSet?.find((s) => s.scenario_id === selectedScenarioId);

  const stepContent: Record<Step, React.ReactNode> = {
    'decision-input': (
      <div className="mx-auto max-w-2xl">
        <InputPanel
          onSubmit={handleSubmit}
          isLoading={apiScenarios.status === 'loading'}
          error={errFrom(apiScenarios)}
          onRetry={() => store.setApiState('generateScenarios', { status: 'idle' })}
        />
      </div>
    ),
    'scenario-view': (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {scenarioSet?.map((s, i) => (
          <ScenarioCard key={s.scenario_id} scenario={s} isSelected={s.scenario_id === selectedScenarioId} onSelect={() => handleSelectScenario(s.scenario_id)} animationDelay={i * 0.12} />
        ))}
      </div>
    ),
    'audio-experience': (
      <div className="mx-auto max-w-2xl">
        {selectedScenario && (
          <div className="mb-4 rounded-xl bg-gray-900/40 border border-gray-800/50 px-4 py-3">
            <p className="text-xs text-gray-500">Now playing</p>
            <p className="text-sm font-medium text-white mt-0.5">{selectedScenario.title}</p>
          </div>
        )}
        <AudioPlayer audioUrl={audioState.audioUrl} isLoading={apiAudio.status === 'loading'} error={errFrom(apiAudio)} onRetry={retryAudio} onComplete={handleAudioComplete} />
      </div>
    ),
    'conversation': (
      <div className="mx-auto max-w-2xl">
        <ConversationInterface messages={conversationSession.messages} isActive={conversationSession.isActive} isConnecting={apiStartConvo.status === 'loading'} error={errFrom(apiStartConvo) ?? errFrom(apiConversation)} onSendMessage={handleSendMessage} onRetry={retryConversation} onDone={() => { store.completeStep('conversation'); advance(); }} />
      </div>
    ),
    'comparison': (
      <ComparisonView scenarios={scenarioSet ?? []} comparisonData={comparisonData} isLoading={apiComparison.status === 'loading'} error={errFrom(apiComparison)} onRetry={retryComparison} />
    ),
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="text-lg font-bold tracking-tight text-white transition hover:text-blue-400">
            <span className="text-blue-400">◆</span> Decidr
          </Link>
          <StepNavigator currentStep={currentStep} completedSteps={completedSteps} onStepChange={store.setCurrentStep} />
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <motion.h2
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold tracking-tight text-white"
          >
            {STEP_TITLES[currentStep]}
          </motion.h2>
          <p className="mt-1 text-sm text-gray-500">{STEP_SUBTITLES[currentStep]}</p>
        </div>

        <ErrorBoundary fallback={<p className="p-4 text-red-400">Something went wrong. Please refresh.</p>}>
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} {...fade}>
              {stepContent[currentStep]}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
    </div>
  );
}
