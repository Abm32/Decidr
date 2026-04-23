import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {COLORS} from '../config';
import {TextReveal} from '../components';

const questions = [
	{text: 'Should I take the job?', start: 0, end: 60, top: '35%', left: '25%'},
	{text: 'Move to a new city?', start: 40, end: 100, top: '55%', left: '55%'},
	{text: 'Start a business?', start: 80, end: 140, top: '40%', left: '15%'},
];

const Problem: React.FC = () => {
	const frame = useCurrentFrame();

	const flickerOpacity = 0.03 + Math.sin(frame * 0.7) * 0.02 + Math.sin(frame * 1.3) * 0.015;
	const allFadeOut = interpolate(frame, [130, 155], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{backgroundColor: COLORS.bg}}>
			<div style={{
				position: 'absolute', inset: 0,
				background: `radial-gradient(circle at 60% 40%, rgba(239,68,68,${flickerOpacity}), transparent 60%), radial-gradient(circle at 30% 70%, rgba(249,115,22,${flickerOpacity}), transparent 60%)`,
			}} />

			{questions.map((q, i) => {
				const opacity = interpolate(frame, [q.start, q.start + 15, q.end - 15, q.end], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * allFadeOut;
				return (
					<div key={i} style={{
						position: 'absolute', top: q.top, left: q.left,
						fontSize: 42, color: COLORS.text, opacity,
						fontWeight: 300, fontStyle: 'italic',
						textShadow: `0 0 10px rgba(255,255,255,0.1)`,
					}}>
						{q.text}
					</div>
				);
			})}

			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<TextReveal
					text="Every decision is a guess."
					startFrame={155}
					duration={55}
					style={{
						fontSize: 56, fontWeight: 700, color: COLORS.text,
						textAlign: 'center',
						textShadow: `0 0 30px ${COLORS.glow}`,
					}}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export default Problem;
