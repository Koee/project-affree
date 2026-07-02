import type { Locator, Page } from 'playwright';
import type { Product } from '../types/product';

export type ExtractCostcoProductsOptions = {
    category: string;
    limit?: number;
    baseUrl?: string;
    productName?: string;
    productUrl?: string;
};

const PRODUCT_CARD_SELECTOR = [
    '[data-testid="product-card"]',
    '[data-automation-id="product-card"]',
    'article.product-tile',
    '.product-tile',
    '.product',
].join(', ');

const NAME_SELECTOR = [
    '[data-testid="product-name"]',
    '[data-automation-id="product-title"]',
    '.product-title',
    '[itemprop="name"]',
    '.description a',
].join(', ');

const PRICE_SELECTOR = [
    '[data-testid="product-price"]',
    '[data-automation-id="product-price"]',
    '[itemprop="price"]',
    '.price',
].join(', ');

export async function extractCostcoProductsFromPage(
    page: Page,
    options: ExtractCostcoProductsOptions
): Promise<Product[]> {
    const cards = page.locator(PRODUCT_CARD_SELECTOR);
    const cardCount = await cards.count();
    const products: Product[] = [];

    for (let index = 0; index < cardCount; index++) {
        if (options.limit && products.length >= options.limit) {
            break;
        }

        const card = cards.nth(index);
        const product = await extractProductFromCard(card, options);

        if (product) {
            products.push(product);
        }
    }

    return products;
}

async function extractProductFromCard(
    card: Locator,
    options: ExtractCostcoProductsOptions
): Promise<Product | null> {
    const sku = await getSku(card);
    const name = await getFirstText(card, NAME_SELECTOR);
    const price = parsePrice(await getFirstText(card, PRICE_SELECTOR));
    const image = await getImageUrl(card);
    const url = await getProductUrl(card, options.baseUrl);
    const normalizedTargetName = options.productName ? normalizeComparable(options.productName) : '';
    const normalizedTargetUrl = options.productUrl
        ? normalizeUrl(options.productUrl, options.baseUrl)
        : '';

    if (
        (normalizedTargetName && normalizeComparable(name) !== normalizedTargetName) ||
        (normalizedTargetUrl && normalizeUrl(url, options.baseUrl) !== normalizedTargetUrl)
    ) {
        return null;
    }

    const productSku = sku || getSkuFromUrl(url);

    if (!productSku || !name || price === null || !url) {
        return null;
    }

    return {
        sku: productSku,
        name,
        price,
        category: options.category,
        image,
        url,
    };
}

async function getSku(card: Locator): Promise<string> {
    const dataSku = await card.getAttribute('data-sku');

    if (dataSku) {
        return normalizeText(dataSku);
    }

    const skuText = await getFirstText(card, [
        '[data-testid="product-sku"]',
        '[data-automation-id="product-sku"]',
        '.product-sku',
    ].join(', '));
    const match = skuText.match(/\d{4,}/);

    return match ? match[0] : '';
}

function getSkuFromUrl(url: string): string {
    const match = url.match(/\.product\.(\d+)\.html/i);

    return match ? match[1] : '';
}

async function getImageUrl(card: Locator): Promise<string> {
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

async function getProductUrl(card: Locator, baseUrl = 'https://www.costco.com'): Promise<string> {
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

async function getFirstText(scope: Locator, selector: string): Promise<string> {
    const locator = scope.locator(selector).first();

    if ((await locator.count()) === 0) {
        return '';
    }

    const contentValue = await locator.getAttribute('content');
    const text = contentValue || (await locator.textContent()) || '';

    return normalizeText(text);
}

function parsePrice(value: string): number | null {
    const match = value.replace(/,/g, '').match(/(\d+(?:\.\d{1,2})?)/);

    return match ? Number(match[1]) : null;
}

function normalizeText(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
}

function normalizeComparable(value: string): string {
    return normalizeText(value).toLowerCase();
}

function normalizeUrl(value: string, baseUrl = 'https://www.costco.com'): string {
    return new URL(value, baseUrl).toString();
}
