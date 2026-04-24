import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img, staticFile } from 'remotion';
import { COLORS } from '../config';
import { TextReveal } from '../components';

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeToBlack = interpolate(frame, [0, 60], [0.3, 0], { extrapolateRight: 'clamp' });
  const taglineOpacity = interpolate(frame, [60, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const taglineFade = interpolate(frame, [120, 150], [1, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const logoOpacity = interpolate(frame, [150, 180], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const logoScale = interpolate(frame, [150, 180], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glowIntensity = frame >= 150
    ? interpolate(frame, [150, 180], [0, 30], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;
  const pulse = frame >= 180
    ? interpolate(Math.sin((frame - 180) * 0.15), [-1, 1], [0.95, 1.05])
    : 1;

  return (
    <AbsoluteFill style={{ background: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      <AbsoluteFill style={{ background: COLORS.bg, opacity: 1 - fadeToBlack }} />

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 50,
        opacity: frame >= 60 ? 1 : 0,
      }}>
        <div style={{ opacity: taglineOpacity * taglineFade }}>
          <TextReveal text="You don't choose blindly anymore." startFrame={60} fontSize={48} />
        </div>

        <div style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale * pulse})`,
          filter: `drop-shadow(0 0 ${glowIntensity}px ${COLORS.primary}) drop-shadow(0 0 ${glowIntensity * 2}px ${COLORS.glow})`,
        }}>
          <Img
            src={staticFile('logo/Decidr.png')}
            style={{ height: 120, objectFit: 'contain' }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
