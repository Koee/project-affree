import type { CrawlJobInput } from '../agent/types';
import type { Product } from '../types/product';
import { BaseCrawler, type CrawlerOptions } from './base-crawler';
import { WalmartParser } from './walmart-parser';
import type { BaseParser } from './base-parser';
import { config } from '../../sites/walmart/config';

export type WalmartCrawlerOptions = CrawlerOptions;

export class WalmartCrawler extends BaseCrawler {
    protected createParser(): BaseParser {
        return new WalmartParser();
    }

    protected getBaseUrl(): string {
        return config.baseUrl;
    }

    override async crawlProducts(input: CrawlJobInput): Promise<Product[]> {
        const browser = await this.createCrawlerBrowser();

        try {
            const context = await browser.newContext({
                userAgent: config.stealth.userAgent,
                viewport: config.stealth.viewport,
                extraHTTPHeaders: config.stealth.extraHeaders,
            });

            const page = await context.newPage();

            if (input.categoryUrl) {
                await page.goto(input.categoryUrl, { waitUntil: 'domcontentloaded' });
            }

            const parser = this.createParser();
            const products = await parser.extractProductsFromPage(page, {
                category: input.category || 'unknown',
                limit: input.limit,
                baseUrl: input.categoryUrl || this.getBaseUrl(),
                productName: input.productName,
                productUrl: input.productUrl,
            });

            await context.close();
            return products;
        } finally {
            await browser.close();
        }
    }
}
