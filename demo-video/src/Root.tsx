import { AbsoluteFill, Composition, Sequence, Audio, staticFile } from "remotion";
import { SCENES, VOICEOVER, CAPTIONS, TOTAL_FRAMES, FPS, WIDTH, HEIGHT } from "./config";
import { Caption } from "./components";
import Hook from "./scenes/Hook";
import Problem from "./scenes/Problem";
import Intro from "./scenes/Intro";
import { Input } from "./scenes/Input";
import { Generation } from "./scenes/Generation";
import { AudioScene } from "./scenes/AudioScene";
import { Interaction } from "./scenes/Interaction";
import { Comparison } from "./scenes/Comparison";
import { Outro } from "./scenes/Outro";

const sceneKeys = ['hook', 'problem', 'intro', 'input', 'generation', 'audio', 'interaction', 'comparison', 'outro'] as const;
const sceneComps = [Hook, Problem, Intro, Input, Generation, AudioScene, Interaction, Comparison, Outro];

const scenes = sceneKeys.map((key, i) => ({
  Comp: sceneComps[i],
  ...SCENES[key],
  vo: VOICEOVER[key],
  caption: CAPTIONS[key],
}));

const BG_MUSIC = [
  { file: 'audio/bg-ambient.mp3', from: 0 },
  { file: 'audio/bg-ambient-2.mp3', from: 22 * FPS },
  { file: 'audio/bg-ambient-3.mp3', from: 44 * FPS },
  { file: 'audio/bg-ambient-4.mp3', from: 66 * FPS },
];

const TRANSITION_SFX = scenes.slice(1).map((s, i) => ({
  from: s.from - 5,
  file: i % 2 === 0 ? 'audio/sfx-transition.mp3' : 'audio/sfx-transition-2.mp3',
}));

const DecidrDemo = () => (
  <AbsoluteFill style={{ backgroundColor: "#000000" }}>
    {/* Visual scenes */}
    {scenes.map(({ Comp, from, duration }, i) => (
      <Sequence key={i} from={from} durationInFrames={duration}>
        <Comp />
      </Sequence>
    ))}

    {/* Captions layer */}
    {scenes.map(({ from, duration, vo, caption }, i) => (
      <Sequence key={`cap-${i}`} from={from} durationInFrames={duration}>
        <Caption words={caption.text.split(' ')} startAt={vo.startAt} fpw={caption.fpw} />
      </Sequence>
    ))}

    {/* Voiceover layer */}
    {scenes.map(({ from, vo }, i) => (
      <Sequence key={`vo-${i}`} from={from + vo.startAt}>
        <Audio src={staticFile(vo.file)} volume={1} />
      </Sequence>
    ))}

    {/* Background music */}
    {BG_MUSIC.map((bg, i) => (
      <Sequence key={`bg-${i}`} from={bg.from}>
        <Audio src={staticFile(bg.file)} volume={0.12} />
      </Sequence>
    ))}

    {/* Transition SFX */}
    {TRANSITION_SFX.map((sfx, i) => (
      <Sequence key={`sfx-${i}`} from={sfx.from}>
        <Audio src={staticFile(sfx.file)} volume={0.4} />
      </Sequence>
    ))}

    {/* Intro reveal SFX */}
    <Sequence from={SCENES.intro.from + 55}>
      <Audio src={staticFile('audio/sfx-intro-reveal.mp3')} volume={0.55} />
    </Sequence>
  </AbsoluteFill>
);

export const RemotionRoot = () => (
  <Composition
    id="DecidrDemo"
    component={DecidrDemo}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
