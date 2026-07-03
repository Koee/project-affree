import type { Locator, Page } from 'playwright';
import type { Product } from '../types/product';

export type ExtractProductsOptions = {
    category: string;
    limit?: number;
    baseUrl?: string;
    productName?: string;
    productUrl?: string;
};

export abstract class BaseParser {
    protected abstract getCardSelector(): string;
    protected abstract getSku(card: Locator): Promise<string>;
    protected abstract getName(card: Locator): Promise<string>;
    protected abstract getPrice(card: Locator): Promise<number | null>;
    protected abstract getImageUrl(card: Locator): Promise<string>;
    protected abstract getProductUrl(card: Locator, baseUrl?: string): Promise<string>;

    async extractProductsFromPage(
        page: Page,
        options: ExtractProductsOptions
    ): Promise<Product[]> {
        const cards = page.locator(this.getCardSelector());
        const cardCount = await cards.count();
        const products: Product[] = [];

        for (let index = 0; index < cardCount; index++) {
            if (options.limit && products.length >= options.limit) {
                break;
            }

            const card = cards.nth(index);
            const product = await this.extractProductFromCard(card, options);

            if (product) {
                products.push(product);
            }
        }

        return products;
    }

    protected async extractProductFromCard(
        card: Locator,
        options: ExtractProductsOptions
    ): Promise<Product | null> {
        const sku = await this.getSku(card);
        const name = await this.getName(card);
        const price = await this.getPrice(card);
        const image = await this.getImageUrl(card);
        const url = await this.getProductUrl(card, options.baseUrl);

        const normalizedTargetName = options.productName ? this.normalizeComparable(options.productName) : '';
        const normalizedTargetUrl = options.productUrl
            ? this.normalizeUrl(options.productUrl, options.baseUrl)
            : '';

        if (
            (normalizedTargetName && this.normalizeComparable(name) !== normalizedTargetName) ||
            (normalizedTargetUrl && this.normalizeUrl(url, options.baseUrl) !== normalizedTargetUrl)
        ) {
            return null;
        }

        if (!sku || !name || price === null || !url) {
            return null;
        }

        return {
            sku,
            name,
            price,
            category: options.category,
            image,
            url,
        };
    }

    protected parsePrice(value: string): number | null {
        const match = value.replace(/,/g, '').match(/(\d+(?:\.\d{1,2})?)/);
        return match ? Number(match[1]) : null;
    }

    protected normalizeText(value: string): string {
        return value.replace(/\s+/g, ' ').trim();
    }

    protected normalizeComparable(value: string): string {
        return this.normalizeText(value).toLowerCase();
    }

    protected normalizeUrl(value: string, baseUrl?: string): string {
        return new URL(value, baseUrl).toString();
    }

    protected async getFirstText(scope: Locator, selector: string): Promise<string> {
        const locator = scope.locator(selector).first();
        if ((await locator.count()) === 0) {
            return '';
        }
        const contentValue = await locator.getAttribute('content');
        const text = contentValue || (await locator.textContent()) || '';
        return this.normalizeText(text);
    }
}
