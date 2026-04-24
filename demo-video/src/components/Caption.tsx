import React from 'react';
import { useCurrentFrame } from 'remotion';

interface CaptionProps {
  words: string[];
  fpw: number;
  startAt?: number;
}

const WORDS_PER_LINE = 7;

export const Caption: React.FC<CaptionProps> = ({ words, fpw, startAt = 0 }) => {
  const frame = useCurrentFrame();
  const f = frame - startAt;
  if (f < 0) return null;

  const visibleCount = Math.min(Math.floor(f / fpw) + 1, words.length);
  if (visibleCount === 0) return null;

  // Show only the current line chunk (group of WORDS_PER_LINE)
  const currentLineIndex = Math.floor((visibleCount - 1) / WORDS_PER_LINE);
  const lineStart = currentLineIndex * WORDS_PER_LINE;
  const lineEnd = Math.min(lineStart + WORDS_PER_LINE, words.length);
  const lineWords = words.slice(lineStart, lineEnd);
  const visibleInLine = visibleCount - lineStart;

  return (
    <div style={{
      position: 'absolute',
      bottom: 70,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: 14,
        padding: '14px 28px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0 8px',
        maxWidth: 800,
      }}>
        {lineWords.map((word, i) => {
          const visible = i < visibleInLine;
          const isCurrent = i === visibleInLine - 1;
          return (
            <span key={`${currentLineIndex}-${i}`} style={{
              fontSize: 30,
              lineHeight: 1.5,
              fontFamily: 'system-ui, sans-serif',
              fontWeight: isCurrent ? 700 : 500,
              color: visible
                ? isCurrent ? '#FFFFFF' : 'rgba(255,255,255,0.7)'
                : 'rgba(255,255,255,0.15)',
            }}>
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
