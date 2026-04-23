import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

export const TextReveal: React.FC<{
	text: string;
	startFrame: number;
	duration?: number;
	fontSize?: number;
	color?: string;
	style?: React.CSSProperties;
}> = ({text, startFrame, duration = 60, fontSize, color, style}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [startFrame, startFrame + duration * 0.4], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
	const blur = interpolate(frame, [startFrame, startFrame + duration * 0.5], [8, 0], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});

	return (
		<div style={{opacity, filter: `blur(${blur}px)`, fontSize, color, ...style}}>
			{text}
		</div>
	);
};
