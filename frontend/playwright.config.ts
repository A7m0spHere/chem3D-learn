import { defineConfig } from "@playwright/test";

const defaultChannel = process.platform === "darwin" ? "msedge" : undefined;
const channel = process.env.PLAYWRIGHT_CHANNEL || defaultChannel;

export default defineConfig({
  testDir: "./tests/visual",
  timeout: 60_000,
  workers: 1,
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.08,
      threshold: 0.25,
    },
  },
  use: {
    baseURL: "http://127.0.0.1:5173",
    channel,
    colorScheme: "light",
    deviceScaleFactor: 1,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    reuseExistingServer: true,
    timeout: 120_000,
    url: "http://127.0.0.1:5173/module/organic-coplanar",
  },
});
