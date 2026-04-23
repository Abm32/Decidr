import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { COLORS } from '../config';
import { UIFrame } from '../components';

const TEXT = 'Should I start a startup... or take the job?';

export const Input: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Frame 0-60: slide up
  const slideY = interpolate(frame, [0, 60], [600, 0], { extrapolateRight: 'clamp' });
  // Frame 240-300: fade out
  const opacity = interpolate(frame, [240, 300], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Typing: frame 60-180
  const charIndex = Math.min(Math.floor(Math.max(frame - 60, 0) / 3), TEXT.length);
  const typed = TEXT.slice(0, charIndex);
  const cursorOpacity = Math.floor(frame / 15) % 2 === 0 ? 1 : 0;

  // Submit button: frame 180-240 scale pulse
  const btnScale = frame >= 180 && frame < 240
    ? spring({ frame: frame - 180, fps, config: { damping: 8, stiffness: 200 } }) * 0.15 + 1
    : 1;
  const btnGlow = interpolate(frame, [180, 210, 240], [0, 1, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Particles (frame 240-300)
  const particles = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const dist = interpolate(frame, [240, 300], [0, 400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const pOpacity = interpolate(frame, [240, 280, 300], [1, 0.5, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return (
      <div key={i} style={{
        position: 'absolute', width: 8, height: 8, borderRadius: '50%',
        background: COLORS.primary, left: '50%', top: '50%',
        transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`,
        opacity: pOpacity,
      }} />
    );
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ opacity, transform: `translateY(${slideY}px)`, width: 800, position: 'relative' }}>
        <UIFrame>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <span style={{ color: COLORS.textMuted, fontSize: 18 }}>What decision are you facing?</span>
            <div style={{
              background: '#111', border: '1px solid #333', borderRadius: 12,
              padding: '16px 20px', fontSize: 32, color: COLORS.text, minHeight: 52,
              fontFamily: 'monospace', position: 'relative',
            }}>
              {typed}
              <span style={{ opacity: cursorOpacity, color: COLORS.primary }}>|</span>
            </div>
            <button style={{
              alignSelf: 'flex-end', padding: '12px 32px', borderRadius: 12,
              background: COLORS.primary, color: COLORS.text, fontSize: 18,
              border: 'none', cursor: 'pointer',
              transform: `scale(${btnScale})`,
              boxShadow: `0 0 ${btnGlow * 30}px ${COLORS.glow}`,
            }}>
              Submit
            </button>
          </div>
        </UIFrame>
        {particles}
      </div>
    </AbsoluteFill>
  );
};
