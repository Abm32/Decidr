import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { COLORS } from '../config';
import { UIFrame } from '../components';

const TypingDots: React.FC<{ visible: boolean }> = ({ visible }) => {
  const frame = useCurrentFrame();
  if (!visible) return null;
  return (
    <div style={{ display: 'flex', gap: 6, padding: '12px 16px' }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: '50%',
          background: COLORS.textMuted,
          opacity: interpolate(Math.sin((frame + i * 8) * 0.15), [-1, 1], [0.3, 1]),
        }} />
      ))}
    </div>
  );
};

export const Interaction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const userSlide = interpolate(frame, [60, 120], [80, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const userOpacity = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const showTyping = frame >= 120 && frame < 200;
  const aiSlide = interpolate(frame, [200, 260], [-80, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const aiOpacity = interpolate(frame, [200, 230], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glowPulse = frame >= 280
    ? interpolate(Math.sin((frame - 280) * 0.3), [-1, 1], [0.4, 1])
    : 0.4;

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <UIFrame fadeIn={60}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center' }}>
          {/* User message */}
          <div style={{
            opacity: userOpacity,
            transform: `translateX(${userSlide}px)`,
            display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 12,
          }}>
            <div style={{
              background: '#FFF', color: '#111', padding: '14px 20px',
              borderRadius: '20px 20px 4px 20px', fontSize: 22, maxWidth: 400, fontFamily: 'sans-serif',
            }}>
              Was it the right choice?
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: COLORS.textMuted,
              flexShrink: 0,
            }} />
          </div>

          {/* Typing indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {showTyping && (
              <>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: COLORS.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFF', fontSize: 16, fontWeight: 700, fontFamily: 'sans-serif',
                }}>D</div>
                <TypingDots visible />
              </>
            )}
          </div>

          {/* AI response */}
          {frame >= 200 && (
            <div style={{
              opacity: aiOpacity,
              transform: `translateX(${aiSlide}px)`,
              display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: COLORS.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFF', fontSize: 16, fontWeight: 700, fontFamily: 'sans-serif', flexShrink: 0,
              }}>D</div>
              <div style={{
                background: 'rgba(255,255,255,0.05)', color: COLORS.text,
                padding: '14px 20px', borderRadius: '20px 20px 20px 4px',
                fontSize: 20, maxWidth: 600, lineHeight: 1.5, fontFamily: 'sans-serif',
                border: `1px solid ${COLORS.primary}`,
                boxShadow: `0 0 ${20 * glowPulse}px ${COLORS.glow}`,
              }}>
                Based on your timeline, the startup path shows 73% higher growth potential, but comes with 2.4x more risk. The choice depends on what you value most.
              </div>
            </div>
          )}
        </div>
      </UIFrame>
    </AbsoluteFill>
  );
};
