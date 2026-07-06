import type { PremiumSelectors } from './types';

export const selectors: PremiumSelectors = {
    productCard: [
        '.product-tile',
        '.product-card',
        '[data-product-id]',
    ].join(', '),
    name: [
        '.product-name',
        '.pdp-link a',
        '[itemprop="name"]',
    ].join(', '),
    price: [
        '.price',
        '.product-price',
        '[itemprop="price"]',
    ].join(', '),
    sku: [
        '[data-product-id]',
        '[data-sku]',
        '.product-sku',
    ].join(', '),
    image: 'img',
    productLink: '.pdp-link a[href], a',
};
