import { defineConfig, devices } from "@playwright/test";
const PORT = Number(process.env.E2E_PORT ?? 3201);
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: { command: `npx next start -p ${PORT}`, url: `http://localhost:${PORT}/api/health`, reuseExistingServer: !process.env.CI, timeout: 120000 },
});
