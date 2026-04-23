import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {COLORS} from '../config';
import {TextReveal} from '../components';

const Hook: React.FC = () => {
	const frame = useCurrentFrame();

	const glowOpacity = interpolate(frame, [0, 30, 90], [0, 0, 0.15], {extrapolateRight: 'clamp'});
	const pulseGlow = frame > 90
		? 0.15 + Math.sin((frame - 90) * 0.1) * 0.05
		: glowOpacity;

	const textOpacity = interpolate(frame, [30, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const scale = interpolate(frame, [30, 150], [1.0, 1.05], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const textGlow = frame > 90
		? 20 + Math.sin((frame - 90) * 0.15) * 8
		: interpolate(frame, [30, 90], [0, 20], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{backgroundColor: COLORS.bg}}>
			<div style={{
				position: 'absolute', inset: 0,
				background: `radial-gradient(circle at 50% 50%, ${COLORS.glow}, transparent 70%)`,
				opacity: pulseGlow,
			}} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<TextReveal
					text="What if you could talk to your future..."
					startFrame={30}
					duration={60}
					style={{
						fontSize: 64,
						color: COLORS.text,
						textAlign: 'center',
						fontWeight: 300,
						maxWidth: 900,
						lineHeight: 1.3,
						opacity: textOpacity,
						transform: `scale(${scale})`,
						textShadow: `0 0 ${textGlow}px ${COLORS.glow}`,
					}}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export default Hook;
