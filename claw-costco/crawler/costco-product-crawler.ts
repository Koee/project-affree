import { BaseCrawler, type CrawlerOptions } from './base-crawler';
import { CostcoParser } from './product-parser';
import type { BaseParser } from './base-parser';
import type { CostcoProductCrawler } from '../agent/types';

export type CostcoProductCrawlerOptions = CrawlerOptions;

export class PlaywrightCostcoProductCrawler extends BaseCrawler implements CostcoProductCrawler {
    protected createParser(): BaseParser {
        return new CostcoParser();
    }

    protected getBaseUrl(): string {
        return 'https://www.costco.com';
    }
}
