export const VIDEO_FPS = 30;
export const VIDEO_DURATION = 1950;

export const colors = {
  primary: "#2A9D8F",
  primaryDark: "#1F6F68",
  accent: "#F4A261",
  background: "#F7FAF9",
  surface: "#FFFFFF",
  textPrimary: "#1F2933",
  textSecondary: "#64748B",
  border: "#DDE7E4",
  blue: "#3B82F6",
} as const;

export const sceneTimings = {
  intro: { from: 0, duration: 120 },
  home: { from: 120, duration: 240 },
  library: { from: 360, duration: 270 },
  ch4: { from: 630, duration: 480 },
  comparison: { from: 1110, duration: 390 },
  crystal: { from: 1500, duration: 240 },
  outro: { from: 1740, duration: 210 },
} as const;

export const mediaAssets = {
  home: "assets/home.webm",
  library: "assets/modules-search.webm",
  ch4: "assets/ch4-angle.webm",
  nh3: "assets/nh3-lone-pair.webm",
  h2o: "assets/h2o-lone-pairs.webm",
  nacl: "assets/nacl-crystal.webm",
  paths: "assets/paths.png",
  exam: "assets/exam.png",
} as const;
