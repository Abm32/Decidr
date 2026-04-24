export const COLORS = {
  primary: "#7C3AED",
  cyan: "#06B6D4",
  warmOrange: "#F97316",
  warmRed: "#EF4444",
  coolBlue: "#3B82F6",
  bg: "#000000",
  text: "#FFFFFF",
  textMuted: "#A1A1AA",
  glow: "rgba(124, 58, 237, 0.4)",
  glowCyan: "rgba(6, 182, 212, 0.3)",
};

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// Scene timing in frames (at 30fps)
// Adjusted to fit voiceover audio durations with ~1s padding
export const SCENES = {
  hook:        { from: 0,    duration: 150  }, // 5s   | audio: 3.25s ✓
  problem:     { from: 150,  duration: 340  }, // 11.3s| audio: 10.1s ✓
  intro:       { from: 490,  duration: 270  }, // 9s   | audio: 7.75s ✓
  input:       { from: 760,  duration: 300  }, // 10s  | audio: 5.6s  ✓
  generation:  { from: 1060, duration: 420  }, // 14s  | audio: 12.7s ✓
  audio:       { from: 1480, duration: 330  }, // 11s  | audio: 9.6s  ✓
  interaction: { from: 1810, duration: 370  }, // 12.3s| audio: 11s   ✓
  comparison:  { from: 2180, duration: 340  }, // 11.3s| audio: 10.2s ✓
  outro:       { from: 2520, duration: 210  }, // 7s   | audio: 2.2s  ✓
} as const;

export const TOTAL_FRAMES = 2730; // 91s at 30fps

// Voiceover audio files and their start offsets within each scene (in frames)
export const VOICEOVER = {
  hook:        { file: 'audio/01-hook.mp3',        startAt: 15  },
  problem:     { file: 'audio/02-problem.mp3',     startAt: 15  },
  intro:       { file: 'audio/03-intro.mp3',       startAt: 20  },
  input:       { file: 'audio/04-input.mp3',       startAt: 15  },
  generation:  { file: 'audio/05-generation.mp3',  startAt: 15  },
  audio:       { file: 'audio/06-audio.mp3',       startAt: 15  },
  interaction: { file: 'audio/07-interaction.mp3',  startAt: 15  },
  comparison:  { file: 'audio/08-comparison.mp3',  startAt: 15  },
  outro:       { file: 'audio/09-outro.mp3',       startAt: 0   },
} as const;
