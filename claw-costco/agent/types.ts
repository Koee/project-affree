import type { Product } from '../types/product';

export type CrawlJobSource = 'manual' | 'scheduler' | 'openclaw';

export type CrawlJobInput = {
    source: CrawlJobSource;
    limit?: number;
    categoryUrl?: string;
    category?: string;
    productName?: string;
    productUrl?: string;
};

export type CrawlJobResult = {
    store: 'costco';
    source: CrawlJobSource;
    runId?: string;
    startedAt: Date;
    finishedAt: Date;
    products: Product[];
};

export interface CrawlAgent {
    runCostcoCrawl(input: CrawlJobInput): Promise<CrawlJobResult>;
}

export type CostcoProductCrawler = {
    crawlProducts(input: CrawlJobInput): Promise<Product[]>;
};
