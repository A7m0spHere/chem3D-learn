import { defineConfig } from "@playwright/test";

const channel = process.env.PLAYWRIGHT_CHANNEL;
process.env.PLAYWRIGHT_SERVER_MODE ??= "dev";
process.env.PLAYWRIGHT_PORT ??= String(4100 + (process.pid % 1000));
const testPort = Number(process.env.PLAYWRIGHT_PORT);
const testBaseUrl = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: "./tests/visual",
  timeout: 60_000,
  workers: 1,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
      timeout: 20_000,
    },
  },
  use: {
    baseURL: testBaseUrl,
    channel,
    colorScheme: "light",
    deviceScaleFactor: 1,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${testPort} --strictPort`,
    reuseExistingServer: false,
    timeout: 120_000,
    url: `${testBaseUrl}/module/organic-coplanar`,
  },
});
