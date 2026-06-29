import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { SearchFixture } from '../../../fixtures/search.fixture';
import { LocationComponent } from '../../../components/location.component';
import { ProductSearchComponent } from '../../../components/product-search.component';

test.describe('@search @stores Search nearby stores', () => {
    test('should select address, search product, and return nearby stores', async ({ page }) => {
        const outputDir = 'artifacts/api-search';
        fs.mkdirSync(outputDir, { recursive: true });

        const capturedResponses: unknown[] = [];
        const searchCase = SearchFixture.nearbyStores;

        page.on('response', async response => {
            const url = response.url();
            const contentType = response.headers()['content-type'] || '';

            if (
                !url.includes('nominatim.openstreetmap.org/search') &&
                !url.includes('/api/stores') &&
                !url.includes('/api/catalog')
            ) {
                return;
            }

            try {
                const body = contentType.includes('application/json')
                    ? await response.json()
                    : await response.text();

                capturedResponses.push({
                    url,
                    status: response.status(),
                    body,
                });
            } catch {
                capturedResponses.push({
                    url,
                    status: response.status(),
                    body: '[Cannot read response]',
                });
            }
        });

        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const location = new LocationComponent(page);
        await location.searchAndSelectAddress(searchCase.location.address, {
            suggestionText: searchCase.location.suggestionText,
        });

        const productSearch = new ProductSearchComponent(page);
        const storesResponsePromise = page.waitForResponse(
            response =>
                (response.url().includes('/api/stores') ||
                    response.url().includes('/api/catalog')) &&
                response.status() === 200,
            { timeout: 30_000 }
        );

        await productSearch.searchAndSelectProduct(searchCase.product.name);
        await storesResponsePromise;

        const resultItems = page
            .locator(
                [
                    '[data-testid*="store"]',
                    '[data-testid*="product"]',
                    '.store-card',
                    '.product-card',
                ].join(', ')
            )
            .or(page.getByText(/cửa hàng|tạp hóa|siêu thị|Bia Tiger/i))
            .first();

        await expect(resultItems).toBeVisible({ timeout: 30_000 });

        const responsePath = path.join(outputDir, 'search-flow-responses.json');

        fs.writeFileSync(
            responsePath,
            JSON.stringify(capturedResponses, null, 2),
            'utf-8'
        );

        await test.info().attach('search-flow-responses', {
            path: responsePath,
            contentType: 'application/json',
        });

        await test.info().attach('search-flow-screenshot', {
            body: await page.screenshot({ fullPage: true }),
            contentType: 'image/png',
        });

        expect(capturedResponses.length).toBeGreaterThan(0);
    });

    test('should open product page directly and return available stores', async ({ page }) => {
        const outputDir = 'artifacts/api-search';
        fs.mkdirSync(outputDir, { recursive: true });

        const capturedResponses: unknown[] = [];
        const searchCase = SearchFixture.nearbyStores;

        page.on('response', async response => {
            const url = response.url();
            const contentType = response.headers()['content-type'] || '';

            if (!url.includes('/api/stores') && !url.includes('/api/catalog')) {
                return;
            }

            try {
                const body = contentType.includes('application/json')
                    ? await response.json()
                    : await response.text();

                capturedResponses.push({
                    url,
                    status: response.status(),
                    body,
                });
            } catch {
                capturedResponses.push({
                    url,
                    status: response.status(),
                    body: '[Cannot read response]',
                });
            }
        });

        const storesResponsePromise = page.waitForResponse(
            response =>
                (response.url().includes('/api/stores') ||
                    response.url().includes('/api/catalog')) &&
                response.status() === 200,
            { timeout: 30_000 }
        );

        await page.goto(searchCase.product.path, { waitUntil: 'domcontentloaded' });

        const location = new LocationComponent(page);
        await location.searchAndSelectAddress(searchCase.location.address, {
            suggestionText: searchCase.location.suggestionText,
            optional: true,
        });

        await storesResponsePromise;

        const storeList = page
            .locator(['[data-testid*="store"]', '.store-card'].join(', '))
            .or(page.getByText(/cửa hàng|tạp hóa|siêu thị/i))
            .first();

        await expect(storeList).toBeVisible({ timeout: 30_000 });

        const responsePath = path.join(outputDir, 'direct-product-responses.json');

        fs.writeFileSync(
            responsePath,
            JSON.stringify(capturedResponses, null, 2),
            'utf-8'
        );

        await test.info().attach('direct-product-responses', {
            path: responsePath,
            contentType: 'application/json',
        });

        await test.info().attach('direct-product-screenshot', {
            body: await page.screenshot({ fullPage: true }),
            contentType: 'image/png',
        });

        expect(capturedResponses.length).toBeGreaterThan(0);
    });
});
