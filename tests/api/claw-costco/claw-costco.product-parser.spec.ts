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

    test('should parse product details from a Product Detail Page (PDP) including price API fallback', async ({ page }) => {
        // Mock the display-price API call from page evaluate fetch
        await page.route('**/display-price-lite**', async (route) => {
            await route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify({
                    priceData: {
                        id: '1082396',
                        displayPrice: {
                            onlinePrice: 37.99,
                            deliveredPrice: 30.99,
                        }
                    }
                })
            });
        });

        // Set the mock PDP HTML page content via route redirection to avoid about:blank pushState issue
        await page.route('https://www.costco.com/p/-/qunol/100301666', async (route) => {
            await route.fulfill({
                contentType: 'text/html',
                body: `
                    <html>
                        <body>
                            <div id="crumbs">
                                <a class="MuiLink-root MuiLink-underlineHover" href="/home">Home</a>
                                <a class="MuiLink-root MuiLink-underlineHover" href="/health">Health & Personal Care</a>
                                <a class="MuiLink-root MuiLink-underlineHover" href="/vitamins">Vitamins</a>
                            </div>
                            
                            <h1 itemprop="name">Qunol Plus CoQ10 Ubiquinol 200 mg. with Omega-3, 90 Softgels</h1>
                            
                            <span id="product-body-item-number">Item 1082396</span>
                            
                            <div class="product-image">
                                <button id="product_hero_btn">
                                    <img src="/hero.jpg" alt="Qunol" />
                                </button>
                            </div>
                            
                            <!-- DOM price is blank/requires sign-in to test fallback -->
                            <span id="pull-right-price" class="price">Sign in to show price</span>
                        </body>
                    </html>
                `
            });
        });

        await page.goto('https://www.costco.com/p/-/qunol/100301666');

        const products = await extractCostcoProductsFromPage(page, {
            category: 'health',
            productUrl: 'https://www.costco.com/p/-/qunol/100301666',
            baseUrl: 'https://www.costco.com'
        });

        expect(products).toEqual([
            {
                sku: '1082396',
                name: 'Qunol Plus CoQ10 Ubiquinol 200 mg. with Omega-3, 90 Softgels',
                price: 30.99, // obtained from API mock fallback
                category: 'Vitamins', // last breadcrumb
                image: 'https://www.costco.com/hero.jpg', // absolute url from /hero.jpg
                url: 'https://www.costco.com/p/-/qunol/100301666' // page URL
            }
        ]);
    });
});
