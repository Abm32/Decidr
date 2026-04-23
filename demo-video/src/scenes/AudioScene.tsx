import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS } from '../config';
import { Waveform } from '../components';

export const AudioScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: 'clamp' });
  const leftQuoteOpacity = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rightQuoteOpacity = interpolate(frame, [150, 180], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const leftQuoteY = interpolate(frame, [60, 90], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rightQuoteY = interpolate(frame, [150, 180], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(90deg, ${COLORS.warmOrange}11, ${COLORS.bg} 50%, ${COLORS.coolBlue}11)`,
      display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 120,
    }}>
      {/* Left */}
      <div style={{ opacity: fadeIn, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        <div style={{
          opacity: leftQuoteOpacity, transform: `translateY(${leftQuoteY}px)`,
          fontStyle: 'italic', fontSize: 22, color: COLORS.warmOrange, maxWidth: 360, textAlign: 'center',
        }}>
          "It wasn't easy... but it was worth it."
        </div>
        <Waveform color={COLORS.warmOrange} intensity={1.4} />
      </div>
      {/* Right */}
      <div style={{ opacity: fadeIn, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        <div style={{
          opacity: rightQuoteOpacity, transform: `translateY(${rightQuoteY}px)`,
          fontStyle: 'italic', fontSize: 22, color: COLORS.coolBlue, maxWidth: 360, textAlign: 'center',
        }}>
          "I found stability... but I wondered what if."
        </div>
        <Waveform color={COLORS.coolBlue} intensity={0.7} />
      </div>
    </AbsoluteFill>
  );
};
