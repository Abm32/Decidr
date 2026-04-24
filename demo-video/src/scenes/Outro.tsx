import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, staticFile } from 'remotion';
import { COLORS } from '../config';

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();

  // Tagline: fade in 0-40, hold, fade out 70-90
  const taglineOpacity = interpolate(frame, [0, 40, 70, 90], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const taglineY = interpolate(frame, [0, 40], [20, 0], { extrapolateRight: 'clamp' });

  // Logo: fade in 80-110, stays
  const logoOpacity = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const logoScale = interpolate(frame, [80, 110], [0.6, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const logoY = interpolate(frame, [80, 110], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Text "DECIDR": fade in 110-130, slides up
  const textOpacity = interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const textY = interpolate(frame, [110, 130], [15, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Glow pulse after everything is in
  const glow = frame >= 130
    ? interpolate(Math.sin((frame - 130) * 0.12), [-1, 1], [15, 40])
    : interpolate(frame, [110, 130], [0, 15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      {/* Tagline */}
      <div style={{
        position: 'absolute',
        opacity: taglineOpacity,
        transform: `translateY(${taglineY}px)`,
        fontSize: 46,
        fontWeight: 600,
        color: COLORS.textMuted,
        fontFamily: 'sans-serif',
        textAlign: 'center',
        letterSpacing: 1,
      }}>
        You don't choose blindly anymore.
      </div>

      {/* Logo + Text group */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        opacity: frame >= 80 ? 1 : 0,
      }}>
        <img
          src={staticFile('logo/app-logo.png')}
          alt="Decidr"
          style={{
            width: 200,
            height: 200,
            objectFit: 'contain',
            opacity: logoOpacity,
            transform: `translateY(${logoY}px) scale(${logoScale})`,
            filter: `drop-shadow(0 0 ${glow}px ${COLORS.primary}) drop-shadow(0 0 ${glow * 1.5}px ${COLORS.glow})`,
          }}
        />
        <div style={{
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          fontSize: 64,
          fontWeight: 800,
          color: COLORS.text,
          fontFamily: 'sans-serif',
          letterSpacing: 12,
          textShadow: `0 0 ${glow}px ${COLORS.primary}, 0 0 ${glow * 2}px ${COLORS.glow}`,
        }}>
          DECIDR
        </div>
      </div>
    </AbsoluteFill>
  );
};
