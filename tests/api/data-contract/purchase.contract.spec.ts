import { test, expect } from '@playwright/test';
import { ApiClient } from '../../../utils/api-client';
import { PurchaseFixture } from '../../../fixtures/purchase.fixture';

test.describe('@contract Purchase API', () => {
    test('POST /api/purchases should create purchase for multiple stores', async ({ request }) => {
        const api = new ApiClient(request);

        for (const store of PurchaseFixture.stores) {
            const payload = PurchaseFixture.buildPurchase(store);

            const res = await api.postPurchase(payload);

            expect([200, 201]).toContain(res.status());
            expect(res.headers()['content-type']).toContain('application/json');

            const body = await res.json();

            expect(body).toBeTruthy();

            // Business rule
            expect(payload.total).toBe(payload.qty * payload.unitPrice);

            // Contract payload validation
            expect(payload.productId).toBeTruthy();
            expect(payload.productName).toBeTruthy();
            expect(payload.storeId).toBeTruthy();
            expect(payload.storeName).toBeTruthy();
            expect(payload.chain).toBeTruthy();
            expect(payload.qty).toBeGreaterThan(0);
            expect(payload.unitPrice).toBeGreaterThan(0);
            expect(payload.total).toBeGreaterThan(0);
            expect(payload.id).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            );
            expect(Date.parse(payload.boughtAt)).not.toBeNaN();
        }
    });
});