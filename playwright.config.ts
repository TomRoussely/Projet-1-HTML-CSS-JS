import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  workers: 1,
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://localhost:3100",
    env: { DATA_DIR: ".e2e-data" },
    reuseExistingServer: false,
  },
  timeout: 60000,
});
