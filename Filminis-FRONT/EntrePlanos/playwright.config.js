import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: {
    baseURL: "http://filminis.test",
    browserName: "chromium",
    headless: true,
  },
});
