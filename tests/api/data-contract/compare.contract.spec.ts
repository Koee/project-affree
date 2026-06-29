import { test, expect } from '@playwright/test';
import { ApiClient } from '../../../utils/api-client';
import { ProductFixture } from '../../../fixtures/products.fixture';
import { expectHtmlResponse } from '../../../utils/data-assertions';

test.describe('@p0 @contract Product Compare Page', () => {
    test('GET /p/{productCode} should return product page HTML', async ({ request }) => {
        const api = new ApiClient(request);

        const response = await api.getProductPage(ProductFixture.valid.code);

        await expectHtmlResponse(response);

        const html = await response.text();

        expect(html).toContain(ProductFixture.valid.code);
    });

    test('GET /p/{invalidProductCode} should not crash system', async ({ request }) => {
        const api = new ApiClient(request);

        const response = await api.getProductPage(ProductFixture.invalid.code);

        expect([200, 404]).toContain(response.status());

        const html = await response.text();

        expect(html.length).toBeGreaterThan(0);
    });

    test('GET /p/{emptyProductCode} should handle empty product code', async ({ request }) => {
        const api = new ApiClient(request);

        const response = await api.getProductPage(ProductFixture.empty.code);

        expect([200, 301, 302, 404]).toContain(response.status());
    });
});