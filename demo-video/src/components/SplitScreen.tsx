import React from 'react';
import { AbsoluteFill } from 'remotion';

export const SplitScreen: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
  leftStyle?: React.CSSProperties;
  rightStyle?: React.CSSProperties;
}> = ({ left, right, leftStyle, rightStyle }) => (
  <AbsoluteFill style={{ flexDirection: 'row', display: 'flex' }}>
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', ...leftStyle }}>{left}</div>
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', ...rightStyle }}>{right}</div>
  </AbsoluteFill>
);
