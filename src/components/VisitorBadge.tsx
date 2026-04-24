'use client';

import { useEffect, useState } from 'react';

export function VisitorBadge() {
  const [stats, setStats] = useState<{ total: number; unique: number } | null>(null);

  useEffect(() => {
    fetch('/api/visitors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: window.location.pathname }) })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-full border border-gray-800 bg-gray-900/90 px-4 py-2 text-xs backdrop-blur-sm">
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
        <span className="text-gray-400">{stats.total} visits</span>
      </span>
      <span className="h-3 w-px bg-gray-700" />
      <span className="text-gray-500">{stats.unique} unique</span>
    </div>
  );
}
