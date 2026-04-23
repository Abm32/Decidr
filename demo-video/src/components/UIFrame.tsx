import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS } from '../config';

export const UIFrame: React.FC<{ children: React.ReactNode; fadeIn?: number }> = ({ children, fadeIn = 60 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, fadeIn], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        opacity,
        width: 1000,
        minHeight: 500,
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid rgba(255,255,255,0.1)`,
        borderRadius: 24,
        padding: 40,
        boxShadow: `0 0 60px ${COLORS.glow}`,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};
