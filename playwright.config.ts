import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: { baseURL: "http://localhost:3100" },
  webServer: {
    command: "PORT=3100 bun src/index.ts",
    port: 3100,
    reuseExistingServer: true,
  },
});
