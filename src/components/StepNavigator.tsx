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
    <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none" aria-label="Progress">
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
            className={`flex shrink-0 items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium transition-all ${
              isCurrent
                ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30'
                : isDone
                  ? 'text-green-400/80 hover:bg-gray-800 cursor-pointer'
                  : 'text-gray-600 cursor-not-allowed'
            }`}
          >
            <span className={`flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full text-[9px] sm:text-[10px] ${
              isCurrent ? 'bg-blue-600 text-white' : isDone ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-600'
            }`}>
              {isDone ? '✓' : i + 1}
            </span>
            <span className="hidden xs:inline sm:inline">{LABELS[step]}</span>
          </button>
        );
      })}
    </nav>
  );
}
