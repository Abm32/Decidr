import React from 'react';
import { useCurrentFrame } from 'remotion';

export const Waveform: React.FC<{
  color: string;
  intensity?: number;
  style?: React.CSSProperties;
}> = ({ color, intensity = 1, style }) => {
  const frame = useCurrentFrame();
  const bars = 24;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 120, ...style }}>
      {Array.from({ length: bars }).map((_, i) => {
        const h = (Math.sin(frame * 0.15 + i * 0.7) * 0.5 + 0.5) * 80 * intensity + 10;
        return <div key={i} style={{ width: 6, height: h, borderRadius: 3, background: color, transition: 'height 0.05s' }} />;
      })}
    </div>
  );
};
