'use client';

import { STEP_ORDER, type Step } from '@/types';

const STEP_LABELS: Record<Step, string> = {
  'decision-input': 'Input',
  'scenario-view': 'Scenarios',
  'audio-experience': 'Audio',
  'conversation': 'Conversation',
  'comparison': 'Comparison',
};

const STEPS = STEP_ORDER;

interface Props {
  currentStep: Step;
  completedSteps: Set<Step>;
  onStepChange: (step: Step) => void;
}

export function StepNavigator({ currentStep, completedSteps, onStepChange }: Props) {
  const currentIdx = STEPS.indexOf(currentStep);

  return (
    <nav className="flex items-center gap-2 overflow-x-auto px-2 py-4" aria-label="Progress">
      {STEPS.map((step, i) => {
        const isCurrent = step === currentStep;
        const isCompleted = completedSteps.has(step);
        const canNavigate = isCompleted || (i === currentIdx + 1 && completedSteps.has(currentStep));
        const isLocked = !isCurrent && !canNavigate;

        return (
          <button
            key={step}
            onClick={() => canNavigate && onStepChange(step)}
            aria-current={isCurrent ? 'step' : undefined}
            aria-disabled={isLocked}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors ${
              isCurrent
                ? 'bg-blue-600 text-white'
                : isCompleted
                  ? 'bg-gray-700 text-green-400 hover:bg-gray-600 cursor-pointer'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs">
              {isCompleted ? '✓' : i + 1}
            </span>
            <span className="hidden sm:inline">{STEP_LABELS[step]}</span>
          </button>
        );
      })}
    </nav>
  );
}
