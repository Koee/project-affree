import { expect, APIResponse } from '@playwright/test';

export async function expectJsonResponse(response: APIResponse) {
    expect(response.ok(), `Expected ${response.url()} to return a successful JSON response`).toBeTruthy();
    expect(
        response.headers()['content-type'],
        `Expected ${response.url()} content-type to include application/json`
    ).toContain('application/json');
}

export async function expectHtmlResponse(response: APIResponse) {
    expect(response.ok(), `Expected ${response.url()} to return a successful HTML response`).toBeTruthy();
    expect(
        response.headers()['content-type'],
        `Expected ${response.url()} content-type to include text/html`
    ).toContain('text/html');
}

export function expectNoDuplicateByKey<T extends Record<string, unknown>>(
    items: T[],
    key: keyof T
) {
    const missingKeyItems = items.filter((item) => !item[key]);

    expect(
        missingKeyItems,
        `Expected every item to have truthy key "${String(key)}", but ${missingKeyItems.length} item(s) were missing it`
    ).toHaveLength(0);

    const values = items.map((item) => item[key]);
    const uniqueValues = new Set(values);

    expect(
        uniqueValues.size,
        `Expected key "${String(key)}" to be unique, but found ${values.length - uniqueValues.size} duplicate value(s)`
    ).toBe(values.length);
}
