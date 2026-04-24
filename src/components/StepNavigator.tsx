'use client';

import { STEP_ORDER, type Step } from '@/types';

const LABELS: Record<Step, string> = {
  'decision-input': 'Input',
  'scenario-view': 'Scenarios',
  'audio-experience': 'Audio',
  'conversation': 'Chat',
  'comparison': 'Compare',
};

interface Props {
  currentStep: Step;
  completedSteps: Set<Step>;
  onStepChange: (step: Step) => void;
}

export function StepNavigator({ currentStep, completedSteps, onStepChange }: Props) {
  const currentIdx = STEP_ORDER.indexOf(currentStep);

  return (
    <nav className="flex items-center gap-1.5" aria-label="Progress">
      {STEP_ORDER.map((step, i) => {
        const isCurrent = step === currentStep;
        const isDone = completedSteps.has(step);
        const canNav = isDone || (i === currentIdx + 1 && completedSteps.has(currentStep));

        return (
          <button
            key={step}
            onClick={() => canNav && onStepChange(step)}
            aria-current={isCurrent ? 'step' : undefined}
            aria-disabled={!isCurrent && !canNav}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              isCurrent
                ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30'
                : isDone
                  ? 'text-green-400/80 hover:bg-gray-800 cursor-pointer'
                  : 'text-gray-600 cursor-not-allowed'
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
              isCurrent ? 'bg-blue-600 text-white' : isDone ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-600'
            }`}>
              {isDone ? '✓' : i + 1}
            </span>
            <span className="hidden sm:inline">{LABELS[step]}</span>
          </button>
        );
      })}
    </nav>
  );
}
