import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { COLORS } from '../config';

interface CaptionProps {
  words: string[];
  /** frames per word (controls reveal speed) */
  fpw?: number;
  /** frame to start revealing */
  startAt?: number;
}

export const Caption: React.FC<CaptionProps> = ({ words, fpw = 5, startAt = 0 }) => {
  const frame = useCurrentFrame();
  const f = frame - startAt;
  if (f < 0) return null;

  const visibleCount = Math.min(Math.floor(f / fpw) + 1, words.length);
  const allVisible = visibleCount >= words.length;
  const fadeOut = allVisible
    ? interpolate(f, [words.length * fpw + 30, words.length * fpw + 60], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

  return (
    <div style={{
      position: 'absolute',
      bottom: 80,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      opacity: fadeOut,
      pointerEvents: 'none',
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        borderRadius: 12,
        padding: '12px 24px',
        maxWidth: 900,
        textAlign: 'center',
      }}>
        {words.map((word, i) => {
          const visible = i < visibleCount;
          const isCurrent = i === visibleCount - 1 && !allVisible;
          return (
            <span key={i} style={{
              fontSize: 28,
              fontFamily: 'sans-serif',
              fontWeight: isCurrent ? 700 : 400,
              color: isCurrent ? COLORS.text : visible ? 'rgba(255,255,255,0.85)' : 'transparent',
              marginRight: 6,
              transition: 'color 0.1s',
            }}>
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
