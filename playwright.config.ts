import { defineConfig } from '@playwright/test';
import { env } from './utils/env';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  outputDir: 'artifacts/test-results',

  reporter: [
    ['list'],
    ['html', { outputFolder: 'artifacts/report/playwright', open: 'never' }],
    ['json', { outputFile: 'artifacts/report/playwright/results.json' }],
  ],

  use: {
    baseURL: env.BASE_URL || 'https://gia-quanh-day.vercel.app',
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'api-data-contract',
      testMatch: /.*\.contract\.spec\.ts/,
    }, {
      name: 'api-crawl',
      testMatch: /.*api-crawler\.spec\.ts/,
      timeout: 320_000,
    }, {
      name: 'search-nearby-stores',
      testMatch: /.*search-nearby-stores\.spec\.ts/,
      timeout: 120_000,
    }, {
      name: 'flow-order',
      testMatch: /.*flow-order\.spec\.ts/,
      timeout: 180_000,
      workers: 1,
    }
  ],
});
