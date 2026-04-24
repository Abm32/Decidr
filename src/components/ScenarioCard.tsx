'use client';

import { motion } from 'framer-motion';
import type { Scenario } from '@/types';

const BADGE: Record<string, string> = {
  optimistic: 'border-green-500/30 bg-green-500/10 text-green-400',
  pessimistic: 'border-red-500/30 bg-red-500/10 text-red-400',
  pragmatic: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  wildcard: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
};

const DOT: Record<string, string> = {
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.35 }}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      className={`group cursor-pointer rounded-2xl border p-5 transition-all ${
        isSelected
          ? 'border-blue-500/50 bg-blue-500/5 shadow-lg shadow-blue-500/10'
          : 'border-gray-800 bg-gray-900/60 hover:border-gray-700 hover:bg-gray-900/80'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-semibold leading-snug text-white">{scenario.title}</h3>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${BADGE[scenario.path_type] ?? 'border-gray-700 bg-gray-800 text-gray-400'}`}>
          {scenario.path_type}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-400 line-clamp-2">{scenario.summary}</p>

      <div className="mt-4 space-y-2">
        {scenario.timeline.slice(0, 3).map((entry, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${DOT[entry.emotion] ?? 'bg-gray-500'}`} />
            <span className="text-gray-500">{entry.year}</span>
            <span className="text-gray-400 line-clamp-1">{entry.event}</span>
          </div>
        ))}
        {scenario.timeline.length > 3 && (
          <p className="pl-3.5 text-[11px] text-gray-600">+{scenario.timeline.length - 3} more events</p>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span>Confidence</span>
          <span className="tabular-nums">{Math.round(scenario.confidence_score * 100)}%</span>
        </div>
        <div className="mt-1.5 h-1 rounded-full bg-gray-800">
          <div className="h-full rounded-full bg-blue-500/70 transition-all" style={{ width: `${scenario.confidence_score * 100}%` }} />
        </div>
      </div>
    </motion.div>
  );
}
