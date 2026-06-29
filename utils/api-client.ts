import { expect, APIRequestContext, APIResponse, TestInfo } from '@playwright/test';

export class ApiClient {
    constructor(private request: APIRequestContext) { }

    async postBuyer(payload: any): Promise<APIResponse> {
        return this.request.post('/api/buyer', { data: payload });
    }

    async postPurchase(payload: any): Promise<APIResponse> {
        return this.request.post('/api/purchases', { data: payload });
    }

    async getCatalog(): Promise<APIResponse> {
        return this.request.get('/api/catalog');
    }

    async getStores(): Promise<APIResponse> {
        return this.request.get('/api/stores');
    }

    async getProductPage(productCode: string): Promise<APIResponse> {
        return this.request.get(`/p/${productCode}`);
    }

    async getBrandPage(brandSlug: string): Promise<APIResponse> {
        return this.request.get(`/nhan/${brandSlug}`);
    }
}

export async function expectHttpValidationError(
    response: APIResponse,
    testInfo: TestInfo,
    caseName: string
) {
    const body = await response.text();

    await testInfo.attach(`${caseName}-response`, {
        body,
        contentType: 'application/json',
    });

    expect(
        [400, 422],
        `Expected validation error HTTP status, but got ${response.status()}. Body: ${body}`
    ).toContain(response.status());
}