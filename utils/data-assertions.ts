import { expect, APIResponse } from '@playwright/test';

export async function expectJsonResponse(response: APIResponse) {
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/json');
}

export async function expectHtmlResponse(response: APIResponse) {
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('text/html');
}

export function expectNoDuplicateByKey<T>(
    items: T[],
    key: keyof T
) {
    const values = items.map((item) => item[key]);
    const uniqueValues = new Set(values);

    expect(uniqueValues.size).toBe(values.length);
}