import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT) || 3100;

export default defineConfig({
  testDir: "e2e",
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `PORT=${PORT} bun src/index.ts`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
