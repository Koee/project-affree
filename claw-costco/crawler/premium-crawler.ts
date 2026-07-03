import { BaseCrawler, type CrawlerOptions } from './base-crawler';
import { PremiumParser } from './premium-parser';
import type { BaseParser } from './base-parser';
import { config } from '../../sites/premium-outlets/config';

export type PremiumCrawlerOptions = CrawlerOptions;

export class PremiumCrawler extends BaseCrawler {
    protected createParser(): BaseParser {
        return new PremiumParser();
    }

    protected getBaseUrl(): string {
        return config.baseUrl;
    }
}
