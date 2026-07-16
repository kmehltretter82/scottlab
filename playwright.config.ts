import { defineConfig, devices } from "@playwright/test";

const port = 4173;
const pagesPath = "/scottlab/";
const serverOrigin = `http://127.0.0.1:${port}`;
const baseURL = `${serverOrigin}${pagesPath}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  outputDir: "test-results",
  use: {
    baseURL,
    colorScheme: "light",
    locale: "en-GB",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: [
      "npm run build",
      `npm run preview --workspace=@scottlab/web -- --host 127.0.0.1 --port ${port} --strictPort --base ${pagesPath}`,
    ].join(" && "),
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
