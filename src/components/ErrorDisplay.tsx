'use client';

import type { AppError } from '@/types';

export function ErrorDisplay({ error, onRetry }: { error: AppError; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-800 bg-red-900/30 p-4">
      <p className="text-sm font-medium text-red-300">
        {error.isNetworkError ? '🌐 Network Error' : '⚠️ Error'}
      </p>
      <p className="mt-1 text-sm text-gray-300">{error.message}</p>
      <button
        onClick={onRetry}
        className="mt-3 rounded bg-red-700 px-3 py-1.5 text-sm text-gray-100 hover:bg-red-600"
      >
        Retry
      </button>
    </div>
  );
}
