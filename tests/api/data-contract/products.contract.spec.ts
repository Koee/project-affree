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

        expect(body, 'GET /api/catalog should return a JSON body').toBeTruthy();
        expect(body.products, 'GET /api/catalog body should include products').toBeTruthy();
        expect(
            Array.isArray(body.products),
            'GET /api/catalog products should be an array'
        ).toBeTruthy();
        expect(
            body.products.length,
            'GET /api/catalog products should not be empty'
        ).toBeGreaterThan(0);
    });

    test('GET /api/catalog should not return duplicate product id', async ({ request }) => {
        const api = new ApiClient(request);

        const response = await api.getCatalog();
        await expectJsonResponse(response);

        const body = await response.json();

        expectNoDuplicateByKey(body.products, 'id');
    });

    test('GET /api/catalog products should have required fields', async ({ request }) => {
        const api = new ApiClient(request);

        const response = await api.getCatalog();
        await expectJsonResponse(response);

        const body = await response.json();

        for (const product of body.products) {
            expect(product.id, 'Catalog product should include a truthy id').toBeTruthy();
            expect(product.name, 'Catalog product should include a truthy name').toBeTruthy();
        }
    });
});
