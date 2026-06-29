import { test, expect } from '@playwright/test';
import { ApiCrawlRecorder } from '../../../utils/api-crawl-recorder';
import { generateApiCrawlHtmlReport } from '../../../utils/api-crawl-report';

const BASE_URL = 'https://affree.timdaythay.com/';
test.setTimeout(120_000);
test.describe('@crawl @api Affree API Inventory', () => {
    test('crawl known pages and collect API endpoints', async ({ page }) => {
        const recorder = new ApiCrawlRecorder();

        recorder.attach(page);

        const pagesToCrawl = [
            '/',
            '/search',
            '/history',
            '/nganh/trangsuc',
            '/p/sugarbienhoa1kg',
        ];

        for (const route of pagesToCrawl) {
            await page.goto(`${BASE_URL}${route}`, {
                waitUntil: 'networkidle',
            });

            await page.waitForTimeout(1000);
        }

        /**
         * Trigger search API nếu có search box
         */
        await page.goto(`${BASE_URL}/search`, {
            waitUntil: 'networkidle',
        });

        const searchBox = page
            .locator('input[type="text"], input[placeholder*="Tìm"], input[placeholder*="Search"]')
            .first();

        if (await searchBox.count()) {
            await searchBox.fill('sugar');
            await page.keyboard.press('Enter');
            await page.waitForLoadState('networkidle');
        }

        /**
         * Trigger product/detail flow nếu có product links
         */
        await page.goto(BASE_URL, {
            waitUntil: 'networkidle',
        });

        const productLinks = page.locator('a[href^="/p/"]');
        const productCount = await productLinks.count();

        for (let i = 0; i < Math.min(productCount, 5); i++) {
            const href = await productLinks.nth(i).getAttribute('href');
            if (!href) continue;

            await page.goto(`${BASE_URL}${href}`, {
                waitUntil: 'networkidle',
            });

            await page.waitForTimeout(1000);
        }

        const records = recorder.save();
        generateApiCrawlHtmlReport(records);

        await test.info().attach('api-list', {
            path: 'test-results/api-crawl/api-list.json',
            contentType: 'application/json',
        });

        await test.info().attach('api-responses', {
            path: 'test-results/api-crawl/api-responses.json',
            contentType: 'application/json',
        });

        await test.info().attach('api-crawl-report', {
            path: 'test-results/api-crawl/api-crawl-report.html',
            contentType: 'text/html',
        });

        expect(records.length).toBeGreaterThan(0);
    });
});