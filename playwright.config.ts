import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:3213',
    colorScheme: 'light',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { height: 900, width: 1440 },
      },
    },
  ],
  webServer: {
    command: 'pnpm start --hostname 127.0.0.1 --port 3213',
    url: 'http://127.0.0.1:3213/en',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
