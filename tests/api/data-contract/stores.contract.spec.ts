import { test, expect } from '@playwright/test';
import { ApiClient } from '../../../utils/api-client';
import {
    expectJsonResponse,
    expectNoDuplicateByKey,
} from '../../../utils/data-assertions';

test.describe('@p0 @contract Stores API', () => {
    test('GET /api/stores should return valid stores response', async ({ request }) => {
        const api = new ApiClient(request);

        const response = await api.getStores();

        await expectJsonResponse(response);

        const body = await response.json();

        expect(body).toBeTruthy();
    });

    test('GET /api/stores should return array or object data', async ({ request }) => {
        const api = new ApiClient(request);

        const response = await api.getStores();
        await expectJsonResponse(response);

        const body = await response.json();

        expect(typeof body).toBe('object');
    });

    test('GET /api/stores should not return empty response', async ({ request }) => {
        const api = new ApiClient(request);

        const response = await api.getStores();
        await expectJsonResponse(response);

        const body = await response.json();

        expect(JSON.stringify(body).length).toBeGreaterThan(2);
    });
});