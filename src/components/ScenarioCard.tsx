'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Scenario } from '@/types';

const THEME: Record<string, { accent: string; glow: string; badge: string; icon: string; bar: string }> = {
  optimistic: { accent: 'from-emerald-500/15 to-transparent', glow: 'group-hover:shadow-emerald-500/8', badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400', icon: '🚀', bar: 'bg-emerald-500' },
  pessimistic: { accent: 'from-red-500/15 to-transparent', glow: 'group-hover:shadow-red-500/8', badge: 'border-red-500/30 bg-red-500/10 text-red-400', icon: '⚡', bar: 'bg-red-500' },
  pragmatic: { accent: 'from-blue-500/15 to-transparent', glow: 'group-hover:shadow-blue-500/8', badge: 'border-blue-500/30 bg-blue-500/10 text-blue-400', icon: '🧭', bar: 'bg-blue-500' },
  wildcard: { accent: 'from-violet-500/15 to-transparent', glow: 'group-hover:shadow-violet-500/8', badge: 'border-violet-500/30 bg-violet-500/10 text-violet-400', icon: '✨', bar: 'bg-violet-500' },
};

const DOT: Record<string, string> = {
  hopeful: 'bg-green-400', anxious: 'bg-amber-400', triumphant: 'bg-emerald-400',
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
  const [expanded, setExpanded] = useState(false);
  const t = THEME[scenario.path_type] ?? THEME.pragmatic;
  const conf = Math.round(scenario.confidence_score * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.35 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 ${
        isSelected
          ? 'border-blue-500/50 bg-gray-900 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/20'
          : `border-gray-800 bg-gray-900/70 hover:border-gray-700 hover:shadow-xl ${t.glow}`
      }`}
    >
      {/* Top accent */}
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${t.accent} pointer-events-none`} />

      <div className="relative p-5">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <span className="text-xl">{t.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold leading-snug text-white">{scenario.title}</h3>
            <span className={`mt-1 inline-block rounded-full border px-2 py-px text-[10px] font-semibold uppercase tracking-wider ${t.badge}`}>
              {scenario.path_type}
            </span>
          </div>
          {/* Confidence pill */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="h-1.5 w-10 rounded-full bg-gray-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${conf}%` }}
                transition={{ delay: animationDelay + 0.3, duration: 0.5 }}
                className={`h-full rounded-full ${t.bar}`}
              />
            </div>
            <span className="text-[11px] font-bold tabular-nums text-white">{conf}%</span>
          </div>
        </div>

        {/* Summary */}
        <p className="mt-3 text-[13px] leading-relaxed text-gray-400 line-clamp-2">{scenario.summary}</p>

        {/* Emotional arc dots */}
        <div className="mt-3 flex items-center gap-1">
          <span className="text-[10px] text-gray-600 mr-1">Arc</span>
          {scenario.timeline.map((entry, i) => (
            <span key={i} className={`h-2 w-2 rounded-full ${DOT[entry.emotion] ?? 'bg-gray-600'}`} title={`${entry.year} — ${entry.emotion}`} />
          ))}
        </div>

        {/* Timeline toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="mt-3 flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-300 transition"
        >
          <span className={`transition-transform ${expanded ? 'rotate-90' : ''}`}>▸</span>
          {expanded ? 'Hide' : 'Show'} timeline ({scenario.timeline.length} events)
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-0 border-l border-gray-800 ml-1 pl-3">
                {scenario.timeline.map((entry, i) => (
                  <div key={i} className="relative pb-2 last:pb-0">
                    <div className="absolute -left-[15px] top-1.5 h-[7px] w-[7px] rounded-full ring-2 ring-gray-900" style={{ backgroundColor: 'currentColor' }}>
                      <span className={`block h-full w-full rounded-full ${DOT[entry.emotion] ?? 'bg-gray-500'}`} />
                    </div>
                    <p className="text-[11px]">
                      <span className="font-semibold text-gray-300">{entry.year}</span>
                      <span className="text-gray-500"> — {entry.event}</span>
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <div
          role="button"
          tabIndex={0}
          onClick={onSelect}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
          className={`mt-4 flex items-center justify-center rounded-xl py-2 text-xs font-medium transition-all ${
            isSelected
              ? 'bg-blue-600/20 text-blue-400'
              : 'bg-gray-800/60 text-gray-500 group-hover:bg-gray-800 group-hover:text-gray-300'
          }`}
        >
          {isSelected ? '✓ Selected' : 'Explore this future →'}
        </div>
      </div>
    </motion.div>
  );
}
