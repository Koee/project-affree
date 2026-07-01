import { test, expect, type Page } from '@playwright/test';
import { ApiCrawlRecorder } from '../../../utils/api-crawl-recorder';
import { generateApiCrawlHtmlReport } from '../../../utils/api-crawl-report';

const BASE_URL = 'https://affree.timdaythay.com/';
test.setTimeout(120_000);

async function openCrawlerPage(page: Page, url: string): Promise<void> {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await expect(
        page.locator('body'),
        `Expected ${url} to render a body before crawling API calls`
    ).toBeVisible();
}

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
            await openCrawlerPage(page, `${BASE_URL}${route}`);
        }

        /**
         * Trigger search API nếu có search box
         */
        await openCrawlerPage(page, `${BASE_URL}/search`);

        const searchBox = page
            .locator('input[type="text"], input[placeholder*="Tìm"], input[placeholder*="Search"]')
            .first();

        if (await searchBox.count()) {
            const previousRecordCount = recorder.recordCount;
            await searchBox.fill('sugar');
            await page.keyboard.press('Enter');
            await expect
                .poll(
                    () => recorder.recordCount,
                    { message: 'Expected search interaction to trigger an API response' }
                )
                .toBeGreaterThan(previousRecordCount);
        }

        /**
         * Trigger product/detail flow nếu có product links
         */
        await openCrawlerPage(page, BASE_URL);

        const productLinks = page.locator('a[href^="/p/"]');
        const productCount = await productLinks.count();

        for (let i = 0; i < Math.min(productCount, 5); i++) {
            const href = await productLinks.nth(i).getAttribute('href');
            if (!href) continue;

            await openCrawlerPage(page, `${BASE_URL}${href}`);
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

        expect(
            records.length,
            'API crawl should capture at least one allowed Affree API response'
        ).toBeGreaterThan(0);
    });
});
