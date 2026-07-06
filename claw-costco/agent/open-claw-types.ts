import type { Product } from '../types/product';
import type { CrawlJobSource } from './types';

export type StoreName = 'costco' | 'premium-outlets' | 'walmart' | string;

export type OpenClawCrawlInput = {
    store: StoreName;
    source: CrawlJobSource;
    limit?: number;
    categoryUrl?: string;
    category?: string;
    productName?: string;
    productUrl?: string;
};

export type OpenClawCrawlResult = {
    store: StoreName;
    source: CrawlJobSource;
    runId?: string;
    startedAt: Date;
    finishedAt: Date;
    products: Product[];
};

export type CrawlerRegistration = {
    store: StoreName;
    crawl(input: OpenClawCrawlInput): Promise<OpenClawCrawlResult>;
};
