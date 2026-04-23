import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS } from '../config';
import { TextReveal } from '../components';

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeToBlack = interpolate(frame, [0, 60], [0.3, 0], { extrapolateRight: 'clamp' });
  const taglineOpacity = interpolate(frame, [60, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const taglineFade = interpolate(frame, [120, 150], [1, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const brandOpacity = interpolate(frame, [150, 180], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glowIntensity = frame >= 150
    ? interpolate(frame, [150, 180], [10, 40], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;
  const pulse = frame >= 180
    ? interpolate(Math.sin((frame - 180) * 0.2), [-1, 1], [0.9, 1])
    : 1;

  return (
    <AbsoluteFill style={{ background: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      {/* Fade remnant from previous scene */}
      <AbsoluteFill style={{ background: COLORS.bg, opacity: 1 - fadeToBlack }} />

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40,
        opacity: frame >= 60 ? 1 : 0,
      }}>
        <div style={{ opacity: taglineOpacity * taglineFade }}>
          <TextReveal text="You don't choose blindly anymore." startFrame={60} fontSize={48} />
        </div>

        <div style={{
          opacity: brandOpacity * pulse,
          fontSize: 80, fontWeight: 800, color: COLORS.text,
          fontFamily: 'sans-serif', letterSpacing: 8,
          textShadow: `0 0 ${glowIntensity}px ${COLORS.primary}, 0 0 ${glowIntensity * 2}px ${COLORS.glow}`,
        }}>
          DECIDR
        </div>
      </div>
    </AbsoluteFill>
  );
};
