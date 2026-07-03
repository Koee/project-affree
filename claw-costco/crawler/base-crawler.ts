import type { Browser } from 'playwright';
import type { CrawlJobInput } from '../agent/types';
import type { Product } from '../types/product';
import { createBrowser } from '../browser/create-browser';
import type { BaseParser } from './base-parser';

export type CrawlerOptions = {
    createCrawlerBrowser?: () => Promise<Browser>;
};

export abstract class BaseCrawler {
    protected readonly createCrawlerBrowser: () => Promise<Browser>;

    constructor(options: CrawlerOptions = {}) {
        this.createCrawlerBrowser = options.createCrawlerBrowser || createBrowser;
    }

    protected abstract createParser(): BaseParser;
    protected abstract getBaseUrl(): string;

    async crawlProducts(input: CrawlJobInput): Promise<Product[]> {
        const browser = await this.createCrawlerBrowser();

        try {
            const page = await browser.newPage();

            if (input.categoryUrl) {
                await page.goto(input.categoryUrl, { waitUntil: 'domcontentloaded' });
            }

            const parser = this.createParser();
            return parser.extractProductsFromPage(page, {
                category: input.category || 'unknown',
                limit: input.limit,
                baseUrl: input.categoryUrl || this.getBaseUrl(),
                productName: input.productName,
                productUrl: input.productUrl,
            });
        } finally {
            await browser.close();
        }
    }
}
