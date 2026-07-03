import type { Locator, Page } from 'playwright';
import type { Product } from '../types/product';
import { BaseParser, type ExtractProductsOptions } from './base-parser';

export type ExtractCostcoProductsOptions = ExtractProductsOptions;

export const COSTCO_PRODUCT_CARD_SELECTOR = [
    '[data-testid="product-card"]',
    '[data-automation-id="product-card"]',
    'article.product-tile',
    '.product-tile',
    '.product',
].join(', ');

export const COSTCO_NAME_SELECTOR = [
    '[data-testid="product-name"]',
    '[data-automation-id="product-title"]',
    '.product-title',
    '[itemprop="name"]',
    '.description a',
].join(', ');

export const COSTCO_PRICE_SELECTOR = [
    '[data-testid="product-price"]',
    '[data-automation-id="product-price"]',
    '[itemprop="price"]',
    '.price',
].join(', ');

export class CostcoParser extends BaseParser {
    protected getCardSelector(): string {
        return COSTCO_PRODUCT_CARD_SELECTOR;
    }

    protected async getSku(card: Locator): Promise<string> {
        const dataSku = await card.getAttribute('data-sku');

        if (dataSku) {
            return this.normalizeText(dataSku);
        }

        const skuText = await this.getFirstText(card, [
            '[data-testid="product-sku"]',
            '[data-automation-id="product-sku"]',
            '.product-sku',
        ].join(', '));
        const match = skuText.match(/\d{4,}/);

        if (match) {
            return match[0];
        }

        const url = await this.getProductUrl(card);
        const urlMatch = url.match(/\.product\.(\d+)\.html/i);
        return urlMatch ? urlMatch[1] : '';
    }

    protected async getName(card: Locator): Promise<string> {
        return this.getFirstText(card, COSTCO_NAME_SELECTOR);
    }

    protected async getPrice(card: Locator): Promise<number | null> {
        const priceText = await this.getFirstText(card, COSTCO_PRICE_SELECTOR);
        return this.parsePrice(priceText);
    }

    protected async getImageUrl(card: Locator): Promise<string> {
        const image = card.locator('img').first();

        if ((await image.count()) === 0) {
            return '';
        }

        return (
            (await image.getAttribute('src')) ||
            (await image.getAttribute('data-src')) ||
            (await image.getAttribute('data-original')) ||
            ''
        );
    }

    protected async getProductUrl(card: Locator, baseUrl = 'https://www.costco.com'): Promise<string> {
        const link = card.locator('a[href*=".product."], a[href]').first();

        if ((await link.count()) === 0) {
            return '';
        }

        const href = await link.getAttribute('href');

        if (!href) {
            return '';
        }

        return new URL(href, baseUrl).toString();
    }

    override async extractProductsFromPage(
        page: Page,
        options: ExtractProductsOptions
    ): Promise<Product[]> {
        const url = page.url();
        const isPDP = url.includes('/p/') || url.includes('.product.') || (options.productUrl && url.includes(options.productUrl));

        if (isPDP) {
            const product = await this.extractProductFromPDP(page, options);
            return product ? [product] : [];
        }

        return super.extractProductsFromPage(page, options);
    }

    private async extractProductFromPDP(
        page: Page,
        options: ExtractProductsOptions
    ): Promise<Product | null> {
        // 1. Extract SKU (Item Number) from DOM
        let sku = '';
        const itemNumberLocator = page.locator('[id^="product-body-item-number"], #product-body-item-number, [data-automation-id="productSku"]').first();
        if (await itemNumberLocator.count() > 0) {
            const text = await itemNumberLocator.textContent() || '';
            const match = text.match(/\d+/);
            if (match) {
                sku = match[0];
            }
        }

        // If not found in DOM, fallback to extracting Product ID from URL
        if (!sku) {
            const url = page.url();
            const match = url.match(/\/(\d+)(?:\?|$)/) || url.match(/\/p\/(?:[^\/]+\/)?(\d+)/);
            if (match) {
                sku = match[1];
            }
        }

        if (!sku) {
            return null;
        }

        // 2. Extract Name
        let name = '';
        const nameLocator = page.locator('h1[itemprop="name"], h1#product-page-title, h1').first();
        if (await nameLocator.count() > 0) {
            name = (await nameLocator.textContent() || '').trim();
        }

        // 3. Extract Price
        let price: number | null = null;
        const priceLocator = page.locator('span[id^="pull-right-price"], .price, [itemprop="price"]').first();
        if (await priceLocator.count() > 0) {
            const priceText = await priceLocator.textContent() || '';
            price = this.parsePrice(priceText);
        }

        // Fallback/Verify via Costco API display-price-lite
        try {
            const apiPrice = await page.evaluate(async (itemNumber) => {
                try {
                    const response = await fetch(`https://gdx-api.costco.com/catalog/product/dispprice-api/v2/display-price-lite?whsNumber=847&clientId=4900eb1f-0c10-4bd9-99c3-c59e6c1ecebf&item=${itemNumber}&locale=en-us`, {
                        headers: {
                            'Client-Identifier': '6b262714-2ed4-4dcb-a39d-39a4b0357309',
                            'Accept': '*/*'
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        return data.priceData?.displayPrice?.deliveredPrice || data.priceData?.displayPrice?.onlinePrice || null;
                    }
                } catch (e) {
                    // Ignore API call errors inside browser context
                }
                return null;
            }, sku);

            if (apiPrice !== null) {
                price = apiPrice;
            }
        } catch (error) {
            // Ignore evaluation errors
        }

        // 4. Extract Image
        let image = '';
        const imageLocator = page.locator('button[id^="product_hero_"] img, [id^="product_hero_"] img, #product_hero img, #initialImg, .product-image img').first();
        if (await imageLocator.count() > 0) {
            const src = (await imageLocator.getAttribute('src')) || (await imageLocator.getAttribute('data-src')) || '';
            if (src) {
                image = new URL(src, page.url()).toString();
            }
        }

        // 5. Extract Category from breadcrumbs
        let category = options.category || 'unknown';
        const breadcrumbs = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a.MuiLink-root.MuiLink-underlineHover, #crumbs a'));
            return links.map(a => a.textContent?.trim()).filter(Boolean) as string[];
        });
        if (breadcrumbs.length > 0) {
            category = breadcrumbs[breadcrumbs.length - 1];
        }

        const url = page.url();

        if (!name || price === null || !url) {
            return null;
        }

        return {
            sku,
            name,
            price,
            category,
            image,
            url,
        };
    }
}

export async function extractCostcoProductsFromPage(
    page: Page,
    options: ExtractCostcoProductsOptions
): Promise<Product[]> {
    const parser = new CostcoParser();
    return parser.extractProductsFromPage(page, options);
}
