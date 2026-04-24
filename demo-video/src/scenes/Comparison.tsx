import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { COLORS } from '../config';

const METRICS = [
  { label: 'Happiness', startup: 78, job: 65 },
  { label: 'Risk', startup: 72, job: 28 },
  { label: 'Growth', startup: 89, job: 54 },
];

const MetricBar: React.FC<{
  label: string; startup: number; job: number; startFrame: number;
}> = ({ label, startup, job, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sProgress = spring({ frame: Math.max(0, frame - startFrame), fps, config: { damping: 15, mass: 0.8 } });
  const jProgress = spring({ frame: Math.max(0, frame - startFrame - 10), fps, config: { damping: 15, mass: 0.8 } });
  const shimmer = frame >= 240
    ? interpolate(Math.sin((frame - 240) * 0.1), [-1, 1], [0.85, 1])
    : 1;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontFamily: 'sans-serif' }}>
        <span style={{ color: COLORS.text, fontSize: 22, fontWeight: 600 }}>{label}</span>
      </div>
      {[
        { label: 'Startup', value: startup, progress: sProgress, color: COLORS.warmOrange },
        { label: 'Job', value: job, progress: jProgress, color: COLORS.coolBlue },
      ].map((bar) => (
        <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <span style={{ color: COLORS.textMuted, fontSize: 16, width: 60, fontFamily: 'sans-serif' }}>{bar.label}</span>
          <div style={{ flex: 1, height: 28, background: 'rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{
              width: `${bar.value * bar.progress * shimmer}%`,
              height: '100%', borderRadius: 14, background: bar.color,
              boxShadow: `0 0 12px ${bar.color}44`,
            }} />
          </div>
          <span style={{ color: COLORS.text, fontSize: 18, width: 48, textAlign: 'right', fontFamily: 'sans-serif', fontWeight: 600 }}>
            {Math.round(bar.value * bar.progress)}%
          </span>
        </div>
      ))}
    </div>
  );
};

export const Comparison: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 900, padding: '0 60px' }}>
        <h2 style={{
          opacity: titleOpacity, color: COLORS.text, fontSize: 44, fontWeight: 700,
          textAlign: 'center', marginBottom: 50, fontFamily: 'sans-serif',
        }}>
          Scenario Comparison
        </h2>
        {METRICS.map((m, i) => (
          <MetricBar key={m.label} {...m} startFrame={60 + i * 30} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
