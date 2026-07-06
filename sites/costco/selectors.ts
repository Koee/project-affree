import type { CostcoSelectors } from './types';

export const selectors: CostcoSelectors = {
    productCard: [
        '[data-testid="product-card"]',
        '[data-automation-id="product-card"]',
        'article.product-tile',
        '.product-tile',
        '.product',
    ].join(', '),
    name: [
        '[data-testid="product-name"]',
        '[data-automation-id="product-title"]',
        '.product-title',
        '[itemprop="name"]',
        '.description a',
    ].join(', '),
    price: [
        '[data-testid="product-price"]',
        '[data-automation-id="product-price"]',
        '[itemprop="price"]',
        '.price',
    ].join(', '),
    sku: [
        '[data-testid="product-sku"]',
        '[data-automation-id="product-sku"]',
        '.product-sku',
    ].join(', '),
    image: 'img',
    productLink: 'a[href*=".product."], a[href]',
};
