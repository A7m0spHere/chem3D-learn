import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/logic",
  timeout: 20_000,
  workers: 1,
});
