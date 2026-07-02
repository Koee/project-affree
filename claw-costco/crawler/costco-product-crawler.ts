import type { Browser } from 'playwright';
import type { CrawlJobInput, CostcoProductCrawler } from '../agent/types';
import type { Product } from '../types/product';
import { createBrowser } from '../browser/create-browser';
import { extractCostcoProductsFromPage } from './product-parser';

export type CostcoProductCrawlerOptions = {
    createCrawlerBrowser?: () => Promise<Browser>;
};

export class PlaywrightCostcoProductCrawler implements CostcoProductCrawler {
    private readonly createCrawlerBrowser: () => Promise<Browser>;

    constructor(options: CostcoProductCrawlerOptions = {}) {
        this.createCrawlerBrowser = options.createCrawlerBrowser || createBrowser;
    }

    async crawlProducts(input: CrawlJobInput): Promise<Product[]> {
        const browser = await this.createCrawlerBrowser();

        try {
            const page = await browser.newPage();

            if (input.categoryUrl) {
                await page.goto(input.categoryUrl, { waitUntil: 'domcontentloaded' });
            }

            return extractCostcoProductsFromPage(page, {
                category: input.category || 'costco',
                limit: input.limit,
                baseUrl: input.categoryUrl,
                productName: input.productName,
                productUrl: input.productUrl,
            });
        } finally {
            await browser.close();
        }
    }
}
