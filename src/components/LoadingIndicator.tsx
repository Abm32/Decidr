'use client';

export function LoadingIndicator({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-blue-500" />
      {message && <p className="text-sm text-gray-400">{message}</p>}
    </div>
  );
}
