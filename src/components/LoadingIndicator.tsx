'use client';

export function LoadingIndicator({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
      {message && <p className="text-sm text-gray-300">{message}</p>}
    </div>
  );
}
