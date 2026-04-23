import { AbsoluteFill, Composition, Sequence } from "remotion";
import { SCENES, TOTAL_FRAMES, FPS, WIDTH, HEIGHT } from "./config";
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
  { Comp: Hook, ...SCENES.hook },
  { Comp: Problem, ...SCENES.problem },
  { Comp: Intro, ...SCENES.intro },
  { Comp: Input, ...SCENES.input },
  { Comp: Generation, ...SCENES.generation },
  { Comp: AudioScene, ...SCENES.audio },
  { Comp: Interaction, ...SCENES.interaction },
  { Comp: Comparison, ...SCENES.comparison },
  { Comp: Outro, ...SCENES.outro },
] as const;

const DecidrDemo = () => (
  <AbsoluteFill style={{ backgroundColor: "#000000" }}>
    {scenes.map(({ Comp, from, duration }, i) => (
      <Sequence key={i} from={from} durationInFrames={duration}>
        <Comp />
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
