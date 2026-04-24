import { AbsoluteFill, Composition, Sequence, Audio, staticFile } from "remotion";
import { SCENES, VOICEOVER, TOTAL_FRAMES, FPS, WIDTH, HEIGHT } from "./config";
import Hook from "./scenes/Hook";
import Problem from "./scenes/Problem";
import Intro from "./scenes/Intro";
import { Input } from "./scenes/Input";
import { Generation } from "./scenes/Generation";
import { AudioScene } from "./scenes/AudioScene";
import { Interaction } from "./scenes/Interaction";
import { Comparison } from "./scenes/Comparison";
import { Outro } from "./scenes/Outro";

const scenes = [
  { Comp: Hook, ...SCENES.hook, vo: VOICEOVER.hook },
  { Comp: Problem, ...SCENES.problem, vo: VOICEOVER.problem },
  { Comp: Intro, ...SCENES.intro, vo: VOICEOVER.intro },
  { Comp: Input, ...SCENES.input, vo: VOICEOVER.input },
  { Comp: Generation, ...SCENES.generation, vo: VOICEOVER.generation },
  { Comp: AudioScene, ...SCENES.audio, vo: VOICEOVER.audio },
  { Comp: Interaction, ...SCENES.interaction, vo: VOICEOVER.interaction },
  { Comp: Comparison, ...SCENES.comparison, vo: VOICEOVER.comparison },
  { Comp: Outro, ...SCENES.outro, vo: VOICEOVER.outro },
] as const;

// Background music segments (~22s each, covering 91s total)
const BG_MUSIC = [
  { file: 'audio/bg-ambient.mp3', from: 0 },
  { file: 'audio/bg-ambient-2.mp3', from: 22 * FPS },
  { file: 'audio/bg-ambient-3.mp3', from: 44 * FPS },
  { file: 'audio/bg-ambient-4.mp3', from: 66 * FPS },
];

// Transition SFX at each scene boundary (alternating two sounds)
const TRANSITION_SFX = scenes.slice(1).map((s, i) => ({
  from: s.from - 5, // slightly before scene starts
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

    {/* Voiceover layer */}
    {scenes.map(({ from, vo }, i) => (
      <Sequence key={`vo-${i}`} from={from + vo.startAt}>
        <Audio src={staticFile(vo.file)} volume={1} />
      </Sequence>
    ))}

    {/* Background music layer (low volume, continuous) */}
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
