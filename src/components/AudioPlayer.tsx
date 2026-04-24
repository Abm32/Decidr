'use client';

import { useRef, useState, useEffect } from 'react';
import type { AppError } from '@/types';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorDisplay } from './ErrorDisplay';

interface Props {
  audioUrl: string | null;
  isLoading: boolean;
  error: AppError | null;
  onRetry: () => void;
  onComplete?: () => void;
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ audioUrl, isLoading, error, onRetry, onComplete }: Props) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onTime = () => setCurrent(el.currentTime);
    const onMeta = () => setDuration(el.duration);
    const onEnd = () => { setPlaying(false); onComplete?.(); };
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('ended', onEnd);
    return () => { el.removeEventListener('timeupdate', onTime); el.removeEventListener('loadedmetadata', onMeta); el.removeEventListener('ended', onEnd); };
  }, [onComplete]);

  if (isLoading) return <LoadingIndicator message="Generating narration with ElevenLabs..." />;
  if (error) return <ErrorDisplay error={error} onRetry={onRetry} />;
  if (!audioUrl) return <p className="text-sm text-gray-500">No audio available</p>;

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-6">
      <audio ref={ref} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-500 mb-3 sm:mb-4">
        <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
        Immersive scenario narration
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={() => { playing ? ref.current?.pause() : ref.current?.play(); setPlaying(!playing); }}
          className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base sm:text-lg text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
        >
          {playing ? '⏸' : '▶'}
        </button>

        <div className="flex-1">
          <div className="relative h-1.5 rounded-full bg-gray-800 cursor-pointer" onClick={(e) => {
            if (!ref.current || !duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            ref.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
          }}>
            <div className="absolute inset-y-0 left-0 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[11px] tabular-nums text-gray-500">
            <span>{fmt(current)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 flex justify-end">
        <button
          onClick={onComplete}
          className="rounded-full border border-gray-700 px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
        >
          Skip to conversation →
        </button>
      </div>
    </div>
  );
}
