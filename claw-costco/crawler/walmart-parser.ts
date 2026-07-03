import type { Locator, Page } from 'playwright';
import type { Product } from '../types/product';
import { BaseParser, type ExtractProductsOptions } from './base-parser';
import { selectors } from '../../sites/walmart/selectors';

export type ExtractWalmartProductsOptions = ExtractProductsOptions;

export class WalmartParser extends BaseParser {
    protected getCardSelector(): string {
        return selectors.productCard;
    }

    protected async getSku(card: Locator): Promise<string> {
        const dataId = await card.getAttribute('data-product-id');

        if (dataId) {
            return this.normalizeText(dataId);
        }

        const skuText = await this.getFirstText(card, selectors.sku);
        const match = skuText.match(/\d{4,}/);

        if (match) {
            return match[0];
        }

        const url = await this.getProductUrl(card);
        const urlMatch = url.match(/\/ip\/([a-zA-Z0-9]+)/i);
        return urlMatch ? urlMatch[1] : '';
    }

    protected async getName(card: Locator): Promise<string> {
        return this.getFirstText(card, selectors.name);
    }

    protected async getPrice(card: Locator): Promise<number | null> {
        const priceText = await this.getFirstText(card, selectors.price);
        return this.parsePrice(priceText);
    }

    protected async getImageUrl(card: Locator): Promise<string> {
        const image = card.locator(selectors.image).first();

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

    protected async getProductUrl(card: Locator, baseUrl = 'https://www.walmart.com'): Promise<string> {
        const link = card.locator(selectors.productLink).first();

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

export async function extractWalmartProductsFromPage(
    page: Page,
    options: ExtractWalmartProductsOptions
): Promise<Product[]> {
    const parser = new WalmartParser();
    return parser.extractProductsFromPage(page, options);
}
