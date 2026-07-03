import { PlaywrightCostcoProductCrawler } from '../crawler/costco-product-crawler';
import {
    PrismaCrawlRunRepository,
    PrismaProductRepository,
    type CrawlRunRepository,
    type ProductRepository,
} from '../db/repositories';
import type {
    CrawlAgent,
    CrawlJobInput,
    CrawlJobResult,
    CostcoProductCrawler,
} from './types';

export type CostcoCrawlerAgentOptions = {
    crawler?: CostcoProductCrawler;
    productRepository?: ProductRepository;
    runRepository?: CrawlRunRepository;
};

export class CostcoCrawlerAgent implements CrawlAgent {
    private readonly crawler: CostcoProductCrawler;
    private readonly productRepository?: ProductRepository;
    private readonly runRepository?: CrawlRunRepository;

    constructor(crawlerOrOptions?: CostcoProductCrawler | CostcoCrawlerAgentOptions) {
        if (!crawlerOrOptions) {
            this.crawler = new PlaywrightCostcoProductCrawler();
            this.productRepository = new PrismaProductRepository();
            this.runRepository = new PrismaCrawlRunRepository();
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
            store: 'costco',
            source: input.source,
            startedAt,
        });

        try {
            const products = await this.crawler.crawlProducts(input);
            const finishedAt = new Date();

            await this.productRepository?.upsertMany(products, {
                store: 'costco',
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
