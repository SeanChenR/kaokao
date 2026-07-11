import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT) || 3100;
// E2E_BASE_URL 指向部署站做 production 冒煙(README 記載用法)
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  use: { baseURL },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] }, // Chromium 系手機 preset,免裝 WebKit
      // 截圖 spec 自帶視口;theme-smoke 的 FOUC/持久化與視口無關
      testMatch: /(quiz-flow|results|a11y)\.spec\.ts/,
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `PORT=${PORT} bun src/index.ts`,
        port: PORT,
        reuseExistingServer: !process.env.CI,
      },
});
