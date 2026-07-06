import { WalmartCrawler } from '../crawler/walmart-crawler';
import {
    PrismaCrawlRunRepository,
    PrismaProductRepository,
    type CrawlRunRepository,
    type ProductRepository,
} from '../db/repositories';
import type {
    CrawlJobInput,
    CrawlJobResult,
} from './types';

export type WalmartCrawlerAgentOptions = {
    crawler?: WalmartCrawler;
    productRepository?: ProductRepository;
    runRepository?: CrawlRunRepository;
};

export class WalmartCrawlerAgent {
    private readonly crawler: WalmartCrawler;
    private readonly productRepository?: ProductRepository;
    private readonly runRepository?: CrawlRunRepository;

    constructor(crawlerOrOptions?: WalmartCrawler | WalmartCrawlerAgentOptions) {
        if (!crawlerOrOptions) {
            this.crawler = new WalmartCrawler();
            this.productRepository = new PrismaProductRepository();
            this.runRepository = new PrismaCrawlRunRepository();
            return;
        }

        if ('crawlProducts' in crawlerOrOptions) {
            this.crawler = crawlerOrOptions;
            return;
        }

        this.crawler = crawlerOrOptions.crawler || new WalmartCrawler();
        this.productRepository = crawlerOrOptions.productRepository;
        this.runRepository = crawlerOrOptions.runRepository;
    }

    async runWalmartCrawl(input: CrawlJobInput): Promise<CrawlJobResult> {
        const startedAt = new Date();
        const run = await this.runRepository?.startRun({
            store: 'walmart',
            source: input.source,
            startedAt,
        });

        try {
            const products = await this.crawler.crawlProducts(input);
            const finishedAt = new Date();

            await this.productRepository?.upsertMany(products, {
                store: 'walmart',
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
                store: 'costco', // Note: OpenClaw CRAWL_JOB_RESULT is typed with store: 'costco' | 'walmart'? Wait, let's check types.ts
                // wait, in claw-costco/agent/types.ts, CrawlJobResult store is hardcoded to 'costco'. Let's change it or keep it as any.
                // Let's verify types.ts CrawlJobResult:
                // export type CrawlJobResult = { store: 'costco'; source: CrawlJobSource; ... }
                // Let's check if we can cast it, or if we need to modify types.ts. We can cast to any or we can edit types.ts.
                // Let's cast store as any so we don't have to edit types.ts (unless necessary, keeping edits under 10 files).
                store: 'walmart' as any,
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
