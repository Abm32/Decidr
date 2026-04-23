'use client';

import { motion } from 'framer-motion';
import type { Scenario } from '@/types';

const BADGE_COLORS: Record<string, string> = {
  optimistic: 'bg-green-700 text-green-200',
  pessimistic: 'bg-red-700 text-red-200',
  pragmatic: 'bg-blue-700 text-blue-200',
  wildcard: 'bg-purple-700 text-purple-200',
};

const EMOTION_COLORS: Record<string, string> = {
  hopeful: 'bg-green-400', anxious: 'bg-yellow-400', triumphant: 'bg-emerald-400',
  melancholic: 'bg-indigo-400', neutral: 'bg-gray-400', excited: 'bg-orange-400',
  fearful: 'bg-red-400', content: 'bg-teal-400', desperate: 'bg-rose-400', relieved: 'bg-cyan-400',
};

interface Props {
  scenario: Scenario;
  isSelected: boolean;
  onSelect: () => void;
  animationDelay?: number;
}

export function ScenarioCard({ scenario, isSelected, onSelect, animationDelay = 0 }: Props) {
  const first = scenario.timeline[0];
  const last = scenario.timeline[scenario.timeline.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      className={`cursor-pointer rounded-lg border p-4 transition-colors ${
        isSelected ? 'border-blue-500 bg-gray-700' : 'border-gray-700 bg-gray-800 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-100">{scenario.title}</h3>
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs ${BADGE_COLORS[scenario.path_type] ?? 'bg-gray-700 text-gray-300'}`}>
          {scenario.path_type}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-xs text-gray-400">
        <p>{first.year}: {first.event}</p>
        <p>{last.year}: {last.event}</p>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Confidence</span>
          <span>{Math.round(scenario.confidence_score * 100)}%</span>
        </div>
        <div className="mt-1 h-1.5 rounded-full bg-gray-700">
          <div className="h-full rounded-full bg-blue-500" style={{ width: `${scenario.confidence_score * 100}%` }} />
        </div>
      </div>

      <div className="mt-3 flex gap-1">
        {scenario.timeline.map((entry, i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${EMOTION_COLORS[entry.emotion] ?? 'bg-gray-400'}`} title={entry.emotion} />
        ))}
      </div>
    </motion.div>
  );
}
