import { expect, test } from '@playwright/test';
import type { Browser } from 'playwright';
import { PlaywrightCostcoProductCrawler } from '../../../claw-costco/crawler/costco-product-crawler';
import { extractCostcoProductsFromPage } from '../../../claw-costco/crawler/product-parser';

test.describe('@claw-costco product parser', () => {
    test('should parse normalized Costco products from a category page', async ({ page }) => {
        await page.setContent(`
            <html>
                <body>
                    <section class="product-list">
                        <article class="product-tile" data-sku="1234567">
                            <a class="product-image-url" href="/kirkland-signature-coffee.product.1234567.html">
                                <img alt="Kirkland Signature Coffee" src="https://cdn.costco.com/coffee.jpg" />
                            </a>
                            <a class="product-title" href="/kirkland-signature-coffee.product.1234567.html">
                                Kirkland Signature Coffee
                            </a>
                            <span class="price">$19.99</span>
                        </article>

                        <article class="product-tile" data-sku="7654321">
                            <a class="product-image-url" href="https://www.costco.com/kirkland-almonds.product.7654321.html">
                                <img alt="Kirkland Almonds" data-src="https://cdn.costco.com/almonds.jpg" />
                            </a>
                            <span class="product-title">Kirkland Almonds</span>
                            <span class="price">Online Price $14.49</span>
                        </article>
                    </section>
                </body>
            </html>
        `);

        const products = await extractCostcoProductsFromPage(page, {
            category: 'pantry',
            limit: 1,
            baseUrl: 'https://www.costco.com',
        });

        expect(products).toEqual([
            {
                sku: '1234567',
                name: 'Kirkland Signature Coffee',
                price: 19.99,
                category: 'pantry',
                image: 'https://cdn.costco.com/coffee.jpg',
                url: 'https://www.costco.com/kirkland-signature-coffee.product.1234567.html',
            },
        ]);
    });

    test('should crawl one category page and return parsed products', async ({ page }) => {
        await page.route('https://www.costco.com/pantry.html', async (route) => {
            await route.fulfill({
                contentType: 'text/html',
                body: `
                    <article class="product-tile" data-sku="2223334">
                        <a class="product-title" href="/olive-oil.product.2223334.html">
                            Kirkland Olive Oil
                        </a>
                        <img src="https://cdn.costco.com/olive-oil.jpg" />
                        <span class="price">$24.99</span>
                    </article>
                `,
            });
        });

        let browserClosed = false;
        const crawler = new PlaywrightCostcoProductCrawler({
            createCrawlerBrowser: async () =>
                ({
                    newPage: async () => page,
                    close: async () => {
                        browserClosed = true;
                    },
                }) as unknown as Browser,
        });

        const products = await crawler.crawlProducts({
            source: 'manual',
            categoryUrl: 'https://www.costco.com/pantry.html',
            category: 'pantry',
            limit: 1,
        });

        expect(products).toEqual([
            {
                sku: '2223334',
                name: 'Kirkland Olive Oil',
                price: 24.99,
                category: 'pantry',
                image: 'https://cdn.costco.com/olive-oil.jpg',
                url: 'https://www.costco.com/olive-oil.product.2223334.html',
            },
        ]);
        expect(browserClosed).toBeTruthy();
    });

    test('should filter the Costco sun care category to the requested espoir product', async ({ page }) => {
        await page.setContent(`
            <article class="product-tile">
                <a class="product-title" href="/banana-boat-sunscreen.product.4000000001.html">
                    Banana Boat Sport Sunscreen
                </a>
                <img src="https://cdn.costco.com/banana-boat.jpg" />
                <span class="price">$12.99</span>
            </article>

            <article class="product-tile">
                <a class="product-title" href="/espoir-water-splash-sun-serum-sunscreen-spf-50-169-fl-oz-2-pack.product.4000424213.html">
                    espoir Water Splash Sun Serum Sunscreen SPF 50, 1.69 fl oz, 2-pack
                </a>
                <img data-src="https://cdn.costco.com/espoir-water-splash-sun-serum.jpg" />
                <span class="price">Your Price $29.99</span>
            </article>
        `);

        const products = await extractCostcoProductsFromPage(page, {
            category: 'sun-care',
            productName: 'espoir Water Splash Sun Serum Sunscreen SPF 50, 1.69 fl oz, 2-pack',
            productUrl: 'https://www.costco.com/espoir-water-splash-sun-serum-sunscreen-spf-50-169-fl-oz-2-pack.product.4000424213.html',
            baseUrl: 'https://www.costco.com/sun-care.html',
        });

        expect(products).toEqual([
            {
                sku: '4000424213',
                name: 'espoir Water Splash Sun Serum Sunscreen SPF 50, 1.69 fl oz, 2-pack',
                price: 29.99,
                category: 'sun-care',
                image: 'https://cdn.costco.com/espoir-water-splash-sun-serum.jpg',
                url: 'https://www.costco.com/espoir-water-splash-sun-serum-sunscreen-spf-50-169-fl-oz-2-pack.product.4000424213.html',
            },
        ]);
    });
});
