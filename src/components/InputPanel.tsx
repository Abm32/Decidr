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
    <div className="flex flex-col gap-4 rounded-lg bg-gray-800 p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
        placeholder="Describe your decision..."
        rows={4}
        className="w-full resize-none rounded bg-gray-900 p-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{text.length}/{MAX_CHARS}</span>
        <button
          onClick={() => canSubmit && onSubmit(text.trim())}
          disabled={!canSubmit}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-blue-500"
        >
          Generate Scenarios
        </button>
      </div>
      {isLoading && <LoadingIndicator message="Generating scenarios..." />}
      {error && <ErrorDisplay error={error} onRetry={onRetry} />}
    </div>
  );
}
