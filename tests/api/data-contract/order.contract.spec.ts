import { test, expect } from '@playwright/test';
import { ApiClient, expectHttpValidationError } from '../../../utils/api-client';
import { BuyerFixture } from '../../../fixtures/buyer.fixture';

test.describe('@p0 @contract Buyer API', () => {
    test('POST /api/buyer should submit valid buyer info', async ({ request }) => {
        const api = new ApiClient(request);

        const response = await api.postBuyer(BuyerFixture.valid);

        expect([200, 201]).toContain(response.status());
        expect(response.headers()['content-type']).toContain('application/json');

        const body = await response.json();

        expect(body).toBeTruthy();
    });

    test('POST /api/buyer should validate empty name', async ({ request }, testInfo) => {
        const api = new ApiClient(request);

        const response = await api.postBuyer(BuyerFixture.emptyName);

        await expectHttpValidationError(response, testInfo, 'empty-name');
    });

    test('POST /api/buyer should validate invalid phone', async ({ request }, testInfo) => {
        const api = new ApiClient(request);

        const response = await api.postBuyer(BuyerFixture.invalidPhone);

        await expectHttpValidationError(response, testInfo, 'invalid-phone');
    });

    test('POST /api/buyer should validate empty address', async ({ request }, testInfo) => {
        const api = new ApiClient(request);

        const response = await api.postBuyer(BuyerFixture.emptyAddress);

        await expectHttpValidationError(response, testInfo, 'empty-address');
    });

    test('POST /api/buyer should not allow XSS payload', async ({ request }, testInfo) => {
        const api = new ApiClient(request);

        const response = await api.postBuyer(BuyerFixture.xssPayload);

        await expectHttpValidationError(response, testInfo, 'xss-payload');
    });
});