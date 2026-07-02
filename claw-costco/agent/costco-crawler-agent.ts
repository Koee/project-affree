import { PlaywrightCostcoProductCrawler } from '../crawler/costco-product-crawler';
import {
    PrismaCostcoCrawlRunRepository,
    PrismaCostcoProductRepository,
    type CostcoCrawlRunRepository,
    type CostcoProductRepository,
} from '../db/repositories';
import type {
    CrawlAgent,
    CrawlJobInput,
    CrawlJobResult,
    CostcoProductCrawler,
} from './types';

export type CostcoCrawlerAgentOptions = {
    crawler?: CostcoProductCrawler;
    productRepository?: CostcoProductRepository;
    runRepository?: CostcoCrawlRunRepository;
};

export class CostcoCrawlerAgent implements CrawlAgent {
    private readonly crawler: CostcoProductCrawler;
    private readonly productRepository?: CostcoProductRepository;
    private readonly runRepository?: CostcoCrawlRunRepository;

    constructor(crawlerOrOptions?: CostcoProductCrawler | CostcoCrawlerAgentOptions) {
        if (!crawlerOrOptions) {
            this.crawler = new PlaywrightCostcoProductCrawler();
            this.productRepository = new PrismaCostcoProductRepository();
            this.runRepository = new PrismaCostcoCrawlRunRepository();
            return;
        }

        if ('crawlProducts' in crawlerOrOptions) {
            this.crawler = crawlerOrOptions;
            return;
        }

        this.crawler = crawlerOrOptions.crawler || new PlaywrightCostcoProductCrawler();
        this.productRepository = crawlerOrOptions.productRepository;
        this.runRepository = crawlerOrOptions.runRepository;
    }

    async runCostcoCrawl(input: CrawlJobInput): Promise<CrawlJobResult> {
        const startedAt = new Date();
        const run = await this.runRepository?.startRun({
            source: input.source,
            startedAt,
        });

        try {
            const products = await this.crawler.crawlProducts(input);
            const finishedAt = new Date();

            await this.productRepository?.upsertMany(products, {
                source: input.source,
                crawlRunId: run?.id,
                capturedAt: finishedAt,
            });
            await this.runRepository?.completeRun({
                id: run?.id || '',
                status: 'success',
                productCount: products.length,
                finishedAt,
            });

            return {
                store: 'costco',
                source: input.source,
                runId: run?.id,
                startedAt,
                finishedAt,
                products,
            };
        } catch (error) {
            const finishedAt = new Date();
            const errorMessage = error instanceof Error ? error.message : String(error);

            await this.runRepository?.completeRun({
                id: run?.id || '',
                status: 'failed',
                productCount: 0,
                errorMessage,
                finishedAt,
            });

            throw error;
        }
    }
}
