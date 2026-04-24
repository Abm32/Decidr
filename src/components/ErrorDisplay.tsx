'use client';

import type { AppError } from '@/types';

export function ErrorDisplay({ error, onRetry }: { error: AppError; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
      <p className="text-sm font-medium text-red-400">
        {error.isNetworkError ? '🌐 Network Error' : '⚠️ Something went wrong'}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-gray-400">{error.message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-full border border-red-500/30 px-4 py-1.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
      >
        Try again
      </button>
    </div>
  );
}
