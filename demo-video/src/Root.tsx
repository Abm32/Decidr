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

const DecidrDemo = () => (
  <AbsoluteFill style={{ backgroundColor: "#000000" }}>
    {scenes.map(({ Comp, from, duration, vo }, i) => (
      <Sequence key={i} from={from} durationInFrames={duration}>
        <Comp />
      </Sequence>
    ))}
    {/* Voiceover audio layer */}
    {scenes.map(({ from, vo }, i) => (
      <Sequence key={`vo-${i}`} from={from + vo.startAt}>
        <Audio src={staticFile(vo.file)} volume={1} />
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
