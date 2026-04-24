'use client';

import { useState } from 'react';
import type { AppError } from '@/types';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorDisplay } from './ErrorDisplay';

const MAX_CHARS = 2000;

interface Props {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  error: AppError | null;
  onRetry: () => void;
}

export function InputPanel({ onSubmit, isLoading, error, onRetry }: Props) {
  const [text, setText] = useState('');
  const canSubmit = text.trim().length > 0 && !isLoading;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
      <p className="text-sm text-gray-400">
        Describe the decision you&apos;re facing. Be specific — the more context you give, the richer your scenarios will be.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
        placeholder="e.g. Should I quit my job to start a startup, or stay and push for a promotion?"
        rows={5}
        className="w-full resize-none rounded-xl border border-gray-800 bg-gray-950 p-4 text-[15px] leading-relaxed text-gray-100 placeholder-gray-600 transition focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs tabular-nums text-gray-500">{text.length}/{MAX_CHARS}</span>
        <button
          onClick={() => canSubmit && onSubmit(text.trim())}
          disabled={!canSubmit}
          className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-blue-500"
        >
          Generate Scenarios →
        </button>
      </div>
      {isLoading && <LoadingIndicator message="Generating scenarios with GPT-5.4..." />}
      {error && <ErrorDisplay error={error} onRetry={onRetry} />}
      <p className="text-[10px] text-gray-600">Scenarios are AI-generated for exploration only, not professional advice.</p>
    </div>
  );
}
