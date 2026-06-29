import { test, expect } from '@playwright/test';
import { ApiClient } from '../../../utils/api-client';
import {
    expectJsonResponse,
    expectNoDuplicateByKey,
} from '../../../utils/data-assertions';

test.describe('@p0 @contract Products Catalog API', () => {
    test('GET /api/catalog should return valid catalog response', async ({ request }) => {
        const api = new ApiClient(request);

        const response = await api.getCatalog();

        await expectJsonResponse(response);

        const body = await response.json();

        expect(body).toBeTruthy();
        expect(body.products).toBeTruthy();
        expect(Array.isArray(body.products)).toBeTruthy();
        expect(body.products.length).toBeGreaterThan(0);
    });

    test('GET /api/catalog should not return duplicate product code', async ({ request }) => {
        const api = new ApiClient(request);

        const response = await api.getCatalog();
        await expectJsonResponse(response);

        const body = await response.json();

        expectNoDuplicateByKey(body.products, 'code');
    });

    test('GET /api/catalog products should have required fields', async ({ request }) => {
        const api = new ApiClient(request);

        const response = await api.getCatalog();
        await expectJsonResponse(response);

        const body = await response.json();

        for (const product of body.products) {
            expect(product.code).toBeTruthy();
            expect(product.name).toBeTruthy();
        }
    });
});