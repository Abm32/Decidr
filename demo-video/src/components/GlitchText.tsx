import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

export const GlitchText: React.FC<{
	text: string;
	startFrame?: number;
	style?: React.CSSProperties;
}> = ({text, startFrame = 0, style}) => {
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [startFrame, startFrame + 30], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
	const glitchX = progress < 1 ? Math.sin(frame * 3) * (1 - progress) * 10 : 0;
	const glitchY = progress < 1 ? Math.cos(frame * 5) * (1 - progress) * 5 : 0;
	const clipProgress = interpolate(frame, [startFrame, startFrame + 40], [0, 100], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});

	return (
		<div style={{position: 'relative', ...style}}>
			<div style={{
				transform: `translate(${glitchX}px, ${glitchY}px)`,
				clipPath: `inset(0 ${100 - clipProgress}% 0 0)`,
			}}>
				{text}
			</div>
			{progress < 1 && (
				<>
					<div style={{position: 'absolute', top: 0, left: glitchX * 2, color: '#7C3AED', opacity: 0.7, clipPath: `inset(0 ${100 - clipProgress}% 0 0)`}}>{text}</div>
					<div style={{position: 'absolute', top: 0, left: -glitchX * 2, color: '#06B6D4', opacity: 0.5, clipPath: `inset(0 ${100 - clipProgress}% 0 0)`}}>{text}</div>
				</>
			)}
		</div>
	);
};
