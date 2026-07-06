import type { WalmartSelectors } from './types';

export const selectors: WalmartSelectors = {
    productCard: [
        '[data-testid="item-stack"]',
        '[data-automation-id="product"]',
    ].join(', '),
    name: [
        '[data-automation-id="title"]',
        '.product-title',
    ].join(', '),
    price: [
        '[data-automation-id="price"]',
        '.price-group',
    ].join(', '),
    sku: [
        '[data-product-id]',
        '[data-sku]',
        '.product-sku',
    ].join(', '),
    image: 'img[src*="walmartimages"]',
    productLink: 'a[href*="/ip/"]',
};
