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

  if (isLoading) return <LoadingIndicator message="Generating audio..." />;
  if (error) return <ErrorDisplay error={error} onRetry={onRetry} />;
  if (!audioUrl) return <p className="text-sm text-gray-400">No audio available</p>;

  return (
    <div className="flex items-center gap-3 rounded-lg bg-gray-800 p-3">
      <audio ref={ref} src={audioUrl} preload="metadata" />
      <button
        aria-label={playing ? 'Pause' : 'Play'}
        onClick={() => { playing ? ref.current?.pause() : ref.current?.play(); setPlaying(!playing); }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-500"
      >
        {playing ? '⏸' : '▶'}
      </button>
      <input
        type="range"
        aria-label="Seek"
        min={0}
        max={duration || 0}
        value={current}
        onChange={(e) => { if (ref.current) ref.current.currentTime = +e.target.value; }}
        className="flex-1 accent-blue-500"
      />
      <span className="text-xs text-gray-400 tabular-nums">{fmt(current)} / {fmt(duration)}</span>
    </div>
  );
}
