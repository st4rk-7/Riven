import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:4310";
const { TEST_DATABASE_URL, RIVEN_E2E_AUTH_SECRET } = process.env;
if (!TEST_DATABASE_URL || !RIVEN_E2E_AUTH_SECRET) {
  throw new Error("Start the browser suite with npm run test:e2e.");
}

export default defineConfig({
  testDir: "./e2e",
  // The sign-in rate limiter is shared by all browsers using this server.
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    serviceWorkers: "block",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  webServer: {
    command: "node --import tsx server/index.ts",
    url: baseURL + "/api/v1/demo-observation",
    reuseExistingServer: false,
    env: {
      HOST: "127.0.0.1",
      PORT: "4310",
      DATABASE_URL: TEST_DATABASE_URL,
      BETTER_AUTH_URL: baseURL,
      BETTER_AUTH_SECRET: RIVEN_E2E_AUTH_SECRET,
      WEB_ORIGIN: baseURL,
      RIVEN_EXTENSION_ORIGIN: "",
      TRUST_PROXY: "false",
      CRAWLER_INTERVAL_MS: "0",
    },
  },
});
