'use client';

import { useState } from 'react';
import type { Scenario } from '@/types';

const SITE_URL = 'https://decidr.abhimanyurb.com';

function buildShareText(prompt: string, scenarios: Scenario[]) {
  const names = scenarios.map((s) => s.title).join(', ');
  return `I just explored ${scenarios.length} possible futures for my decision using Decidr 🔮\n\n"${prompt}"\n\nScenarios: ${names}\n\nTry it → ${SITE_URL}`;
}

function shareToX(text: string) {
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
}

function shareToLinkedIn(url: string) {
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
}

interface Props {
  prompt: string;
  scenarios: Scenario[];
  selectedScenarioId: string | null;
}

export function ShareCard({ prompt, scenarios, selectedScenarioId }: Props) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const selected = scenarios.find((s) => s.scenario_id === selectedScenarioId);
  const text = buildShareText(prompt, scenarios);

  const copyLink = () => {
    navigator.clipboard.writeText(`${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900/60 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
      >
        🔗 Share your decision
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4 sm:p-6">
      {/* Card preview */}
      <div className="rounded-xl border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-950 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="text-blue-400">◆</span> Decidr — Decision Card
        </div>
        <p className="mt-3 text-sm font-medium text-white">"{prompt}"</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {scenarios.map((s) => (
            <span
              key={s.scenario_id}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                s.scenario_id === selectedScenarioId
                  ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {s.scenario_id === selectedScenarioId ? '✓ ' : ''}{s.title}
            </span>
          ))}
        </div>
        {selected && (
          <p className="mt-3 text-xs text-gray-500">
            Explored the "{selected.title}" path — {selected.path_type}, {Math.round(selected.confidence_score * 100)}% confidence
          </p>
        )}
        <p className="mt-2 text-[10px] text-gray-600">{SITE_URL}</p>
      </div>

      {/* Share buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => shareToX(text)}
          className="flex items-center gap-1.5 rounded-full bg-gray-800 px-4 py-2 text-xs font-medium text-white transition hover:bg-gray-700"
        >
          𝕏 Post
        </button>
        <button
          onClick={() => shareToLinkedIn(SITE_URL)}
          className="flex items-center gap-1.5 rounded-full bg-[#0A66C2]/20 px-4 py-2 text-xs font-medium text-[#0A66C2] transition hover:bg-[#0A66C2]/30"
        >
          LinkedIn
        </button>
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 rounded-full border border-gray-700 px-4 py-2 text-xs font-medium text-gray-400 transition hover:border-gray-500 hover:text-white"
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="ml-auto text-xs text-gray-600 hover:text-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}
