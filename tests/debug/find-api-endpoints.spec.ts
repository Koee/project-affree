import { test } from '@playwright/test';

test('find API endpoints from website', async ({ page }) => {
    page.on('request', request => {
        const url = request.url();

        if (
            url.includes('/api') ||
            url.includes('supabase') ||
            url.includes('firebase') ||
            url.includes('products') ||
            url.includes('search') ||
            url.includes('stores') ||
            url.includes('compare')
        ) {
            console.log('[API REQUEST]', request.method(), url);
        }
    });

    page.on('response', response => {
        const url = response.url();

        if (
            url.includes('/api') ||
            url.includes('supabase') ||
            url.includes('firebase') ||
            url.includes('products') ||
            url.includes('search') ||
            url.includes('stores') ||
            url.includes('compare')
        ) {
            console.log('[API RESPONSE]', response.status(), url);
        }
    });

    // await page.goto('https://gia-quanh-day.vercel.app/');
    await page.goto('https://affree.timdaythay.com/');

    await page.waitForTimeout(5000);
});