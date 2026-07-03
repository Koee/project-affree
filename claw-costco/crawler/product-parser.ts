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
}

export async function extractCostcoProductsFromPage(
    page: Page,
    options: ExtractCostcoProductsOptions
): Promise<Product[]> {
    const parser = new CostcoParser();
    return parser.extractProductsFromPage(page, options);
}
