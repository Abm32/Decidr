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
export const SCENES = {
  hook:        { from: 0,    duration: 150  }, // 0-5s
  problem:     { from: 150,  duration: 210  }, // 5-12s
  intro:       { from: 360,  duration: 180  }, // 12-18s
  input:       { from: 540,  duration: 300  }, // 18-28s
  generation:  { from: 840,  duration: 360  }, // 28-40s
  audio:       { from: 1200, duration: 300  }, // 40-50s
  interaction: { from: 1500, duration: 300  }, // 50-60s
  comparison:  { from: 1800, duration: 240  }, // 60-68s
  outro:       { from: 2040, duration: 210  }, // 68-75s
} as const;

export const TOTAL_FRAMES = 2250; // 75s at 30fps
