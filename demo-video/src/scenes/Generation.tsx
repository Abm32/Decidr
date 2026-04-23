import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { COLORS } from '../config';
import { SplitScreen } from '../components';

const LEFT_ENTRIES = [
  { year: '2025', event: 'Launch MVP', delay: 60 },
  { year: '2027', event: 'First funding', delay: 110 },
  { year: '2029', event: 'IPO', delay: 160 },
];
const RIGHT_ENTRIES = [
  { year: '2025', event: 'Senior role', delay: 90 },
  { year: '2027', event: 'Team lead', delay: 140 },
  { year: '2029', event: 'Director', delay: 190 },
];

const TimelineEntry: React.FC<{ year: string; event: string; frame: number; delay: number; fromRight?: boolean; color: string }> = ({
  year, event, frame, delay, fromRight, color,
}) => {
  const progress = interpolate(frame, [delay, delay + 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const x = (fromRight ? 60 : -60) * (1 - progress);
  return (
    <div style={{ opacity: progress, transform: `translateX(${x}px)`, marginBottom: 24, padding: '12px 16px', borderLeft: `3px solid ${color}`, paddingLeft: 16 }}>
      <span style={{ fontWeight: 'bold', fontSize: 22, color }}>{year}: </span>
      <span style={{ fontSize: 20, color: COLORS.text }}>{event}</span>
    </div>
  );
};

export const Generation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftSlide = interpolate(frame, [0, 60], [-960, 0], { extrapolateRight: 'clamp' });
  const rightSlide = interpolate(frame, [30, 90], [960, 0], { extrapolateRight: 'clamp' });
  const float = frame >= 200 ? Math.sin((frame - 200) * 0.04) * 6 : 0;

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <SplitScreen
        left={
          <div style={{
            height: '100%', padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center',
            background: `linear-gradient(135deg, ${COLORS.warmOrange}22, ${COLORS.bg})`,
            transform: `translateX(${leftSlide}px) translateY(${float}px)`,
          }}>
            <h2 style={{ fontSize: 36, color: COLORS.warmOrange, marginBottom: 40 }}>Startup Future</h2>
            {LEFT_ENTRIES.map((e) => (
              <TimelineEntry key={e.year} {...e} frame={frame} color={COLORS.warmOrange} />
            ))}
          </div>
        }
        right={
          <div style={{
            height: '100%', padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center',
            background: `linear-gradient(225deg, ${COLORS.coolBlue}22, ${COLORS.bg})`,
            transform: `translateX(${rightSlide}px) translateY(${-float}px)`,
          }}>
            <h2 style={{ fontSize: 36, color: COLORS.coolBlue, marginBottom: 40 }}>Job Future</h2>
            {RIGHT_ENTRIES.map((e) => (
              <TimelineEntry key={e.year} {...e} frame={frame} fromRight color={COLORS.coolBlue} />
            ))}
          </div>
        }
      />
    </AbsoluteFill>
  );
};
