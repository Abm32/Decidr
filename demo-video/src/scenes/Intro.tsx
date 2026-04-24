import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {COLORS} from '../config';
import {GlitchText} from '../components';

const PARTICLES = Array.from({length: 16}, (_, i) => ({
	angle: (i / 16) * Math.PI * 2,
	size: 3 + (i % 3) * 2,
}));

const Intro: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const logoOpacity = interpolate(frame, [55, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const glowIntensity = interpolate(frame, [60, 160], [0, 40], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const glowBg = interpolate(frame, [60, 160], [0, 0.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	const subtitleOpacity = interpolate(frame, [150, 180], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const lineWidth = interpolate(frame, [160, 220], [0, 200], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{backgroundColor: COLORS.bg}}>
			<div style={{
				position: 'absolute', inset: 0,
				background: `radial-gradient(circle at 50% 50%, ${COLORS.glow}, transparent 60%)`,
				opacity: glowBg,
			}} />

			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div style={{position: 'relative', opacity: logoOpacity}}>
					{PARTICLES.map((p, i) => {
						const dist = spring({frame: frame - 60, fps, config: {damping: 12, mass: 0.5 + i * 0.05}}) * (80 + i * 15);
						const particleOpacity = interpolate(frame, [60, 90, 140, 170], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
						return (
							<div key={i} style={{
								position: 'absolute',
								width: p.size, height: p.size, borderRadius: '50%',
								backgroundColor: i % 2 ? COLORS.primary : COLORS.cyan,
								top: '50%', left: '50%',
								transform: `translate(-50%, -50%) translate(${Math.cos(p.angle) * dist}px, ${Math.sin(p.angle) * dist}px)`,
								opacity: particleOpacity * 0.7,
							}} />
						);
					})}

					<GlitchText
						text="DECIDR"
						startFrame={60}
						style={{
							fontSize: 120, fontWeight: 900, color: COLORS.text,
							letterSpacing: 16,
							textShadow: `0 0 ${glowIntensity}px ${COLORS.primary}, 0 0 ${glowIntensity * 2}px ${COLORS.glow}`,
						}}
					/>
				</div>

				<div style={{
					marginTop: 40, opacity: subtitleOpacity,
					display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
				}}>
					<div style={{fontSize: 28, color: COLORS.textMuted, letterSpacing: 6, fontWeight: 300}}>
						Decision Intelligence Engine
					</div>
					<div style={{
						width: lineWidth, height: 1,
						background: `linear-gradient(90deg, transparent, ${COLORS.primary}, transparent)`,
					}} />
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export default Intro;
