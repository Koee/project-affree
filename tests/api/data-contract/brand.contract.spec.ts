import { test, expect } from '@playwright/test';
import { ApiClient } from '../../../utils/api-client';
import { BrandFixture } from '../../../fixtures/brands.fixture';
import { expectHtmlResponse } from '../../../utils/data-assertions';

test.describe('@p0 @contract Brand Page', () => {
    test('GET /nhan/{brandSlug} should return brand page HTML', async ({ request }) => {
        const api = new ApiClient(request);

        const response = await api.getBrandPage(BrandFixture.valid.slug);

        await expectHtmlResponse(response);

        const html = await response.text();

        expect(html).toContain(BrandFixture.valid.slug);
    });

    test('GET /nhan/{invalidBrandSlug} should not crash system', async ({ request }) => {
        const api = new ApiClient(request);

        const response = await api.getBrandPage(BrandFixture.invalid.slug);

        expect([200, 404]).toContain(response.status());

        const html = await response.text();

        expect(html.length).toBeGreaterThan(0);
    });

    test('GET /nhan/{emptyBrandSlug} should handle empty brand slug', async ({ request }) => {
        const api = new ApiClient(request);

        const response = await api.getBrandPage(BrandFixture.empty.slug);

        expect([200, 301, 302, 404]).toContain(response.status());
    });
});