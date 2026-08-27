import { defineConfig } from "@playwright/test";

const channel = process.env.PLAYWRIGHT_CHANNEL;
process.env.PLAYWRIGHT_SERVER_MODE ??= "production";
process.env.PLAYWRIGHT_PORT ??= String(5100 + (process.pid % 1000));
const testPort = Number(process.env.PLAYWRIGHT_PORT);
const testBaseUrl = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: "./tests/visual",
  testMatch: [
    "prefetch-viewer-chunks.visual.spec.ts",
    "route-error-recovery.visual.spec.ts",
  ],
  timeout: 60_000,
  workers: 1,
  expect: {
    timeout: 15_000,
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
    command: `npm run preview -- --host 127.0.0.1 --port ${testPort} --strictPort`,
    reuseExistingServer: false,
    timeout: 120_000,
    url: `${testBaseUrl}/`,
  },
});
