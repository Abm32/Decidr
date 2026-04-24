'use client';

import { motion } from 'framer-motion';
import type { Scenario } from '@/types';

const PATH_THEME: Record<string, { accent: string; glow: string; badge: string; icon: string; bar: string }> = {
  optimistic: {
    accent: 'from-emerald-500/20 to-emerald-500/0',
    glow: 'group-hover:shadow-emerald-500/8',
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    icon: '🚀',
    bar: 'bg-emerald-500',
  },
  pessimistic: {
    accent: 'from-red-500/20 to-red-500/0',
    glow: 'group-hover:shadow-red-500/8',
    badge: 'border-red-500/30 bg-red-500/10 text-red-400',
    icon: '⚡',
    bar: 'bg-red-500',
  },
  pragmatic: {
    accent: 'from-blue-500/20 to-blue-500/0',
    glow: 'group-hover:shadow-blue-500/8',
    badge: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    icon: '🧭',
    bar: 'bg-blue-500',
  },
  wildcard: {
    accent: 'from-violet-500/20 to-violet-500/0',
    glow: 'group-hover:shadow-violet-500/8',
    badge: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
    icon: '✨',
    bar: 'bg-violet-500',
  },
};

const EMOTION_DOT: Record<string, string> = {
  hopeful: 'bg-green-400', anxious: 'bg-amber-400', triumphant: 'bg-emerald-400',
  melancholic: 'bg-indigo-400', neutral: 'bg-gray-400', excited: 'bg-orange-400',
  fearful: 'bg-red-400', content: 'bg-teal-400', desperate: 'bg-rose-400', relieved: 'bg-cyan-400',
};

const EMOTION_LABEL: Record<string, string> = {
  hopeful: '🌱', anxious: '😰', triumphant: '🏆', melancholic: '🌧',
  neutral: '😐', excited: '🎉', fearful: '😨', content: '☀️',
  desperate: '🔥', relieved: '😮‍💨',
};

interface Props {
  scenario: Scenario;
  isSelected: boolean;
  onSelect: () => void;
  animationDelay?: number;
}

export function ScenarioCard({ scenario, isSelected, onSelect, animationDelay = 0 }: Props) {
  const theme = PATH_THEME[scenario.path_type] ?? PATH_THEME.pragmatic;
  const conf = Math.round(scenario.confidence_score * 100);
  const firstEmotion = scenario.timeline[0]?.emotion;
  const lastEmotion = scenario.timeline[scenario.timeline.length - 1]?.emotion;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: animationDelay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 ${
        isSelected
          ? 'border-blue-500/50 bg-gray-900 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/20'
          : `border-gray-800 bg-gray-900/70 hover:border-gray-700 hover:shadow-xl ${theme.glow}`
      }`}
    >
      {/* Top accent gradient */}
      <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${theme.accent} pointer-events-none`} />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-2xl">{theme.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold leading-snug text-white">{scenario.title}</h3>
            </div>
            <span className={`mt-1.5 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${theme.badge}`}>
              {scenario.path_type}
            </span>
          </div>
        </div>

        {/* Summary */}
        <p className="mt-4 text-[13px] leading-relaxed text-gray-400">{scenario.summary}</p>

        {/* Divider */}
        <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-700/60 to-transparent" />

        {/* Timeline */}
        <div className="space-y-0">
          {scenario.timeline.map((entry, i) => (
            <div key={i} className="relative flex gap-3 pb-3 last:pb-0">
              {/* Vertical line */}
              {i < scenario.timeline.length - 1 && (
                <div className="absolute left-[7px] top-4 bottom-0 w-px bg-gray-800" />
              )}
              {/* Dot */}
              <div className="relative z-10 mt-1.5 flex shrink-0">
                <span className={`h-[9px] w-[9px] rounded-full ring-2 ring-gray-900 ${EMOTION_DOT[entry.emotion] ?? 'bg-gray-500'}`} />
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold tabular-nums text-gray-300">{entry.year}</span>
                  <span className="text-xs">{EMOTION_LABEL[entry.emotion] ?? ''}</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{entry.event}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-700/60 to-transparent" />

        {/* Bottom stats */}
        <div className="flex items-center justify-between">
          {/* Emotional arc */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-600">Arc:</span>
            <div className="flex items-center gap-1">
              {scenario.timeline.map((entry, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full transition-transform group-hover:scale-110 ${EMOTION_DOT[entry.emotion] ?? 'bg-gray-600'}`}
                  title={`${entry.year} — ${entry.emotion}`}
                />
              ))}
            </div>
          </div>

          {/* Confidence */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-16 rounded-full bg-gray-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${conf}%` }}
                  transition={{ delay: animationDelay + 0.3, duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${theme.bar}`}
                />
              </div>
              <span className="text-xs font-bold tabular-nums text-white">{conf}%</span>
            </div>
          </div>
        </div>

        {/* Select hint */}
        <div className={`mt-4 flex items-center justify-center rounded-xl py-2 text-xs font-medium transition-all ${
          isSelected
            ? 'bg-blue-600/20 text-blue-400'
            : 'bg-gray-800/50 text-gray-500 group-hover:bg-gray-800 group-hover:text-gray-300'
        }`}>
          {isSelected ? '✓ Selected' : 'Click to explore this future →'}
        </div>
      </div>
    </motion.div>
  );
}
