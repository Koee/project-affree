import { test, expect } from '@playwright/test';
import { CostcoCrawlerAgent } from '../../../claw-costco/agent/costco-crawler-agent';
import { buildClawCostcoServer } from '../../../claw-costco/api/server';
import type {
    CrawlAgent,
    CrawlJobInput,
    CrawlJobResult,
} from '../../../claw-costco/agent/types';
import type {
    CostcoCrawlRunRepository,
    CostcoReadRepository,
    CostcoProductRepository,
} from '../../../claw-costco/db/repositories';
import type { Product } from '../../../claw-costco/types/product';

test.describe('@claw-costco agent boundary', () => {
    test('should expose a Costco crawl agent that returns normalized products', async () => {
        const expectedProduct: Product = {
            sku: 'costco-001',
            name: 'Kirkland Coffee',
            price: 19.99,
            category: 'grocery',
            image: 'https://www.costco.com/image.jpg',
            url: 'https://www.costco.com/product.html',
        };
        const agent = new CostcoCrawlerAgent({
            crawlProducts: async () => [expectedProduct],
        });

        const result = await agent.runCostcoCrawl({
            source: 'manual',
            limit: 10,
        });

        expect(result.products).toEqual([expectedProduct]);
        expect(result.store).toBe('costco');
        expect(result.source).toBe('manual');
        expect(result.startedAt).toBeInstanceOf(Date);
        expect(result.finishedAt).toBeInstanceOf(Date);
    });

    test('should create a crawl run, upsert products, and mark the run successful', async () => {
        const expectedProduct: Product = {
            sku: 'costco-002',
            name: 'Kirkland Almonds',
            price: 14.49,
            category: 'pantry',
            image: 'https://www.costco.com/almonds.jpg',
            url: 'https://www.costco.com/almonds.html',
        };
        const runRepository = new FakeCrawlRunRepository();
        const productRepository = new FakeProductRepository();
        const agent = new CostcoCrawlerAgent({
            crawler: {
                crawlProducts: async () => [expectedProduct],
            },
            runRepository,
            productRepository,
        });

        const result = await agent.runCostcoCrawl({
            source: 'manual',
            limit: 10,
        });

        expect(runRepository.startedRuns).toEqual([
            {
                source: 'manual',
                startedAt: result.startedAt,
            },
        ]);
        expect(productRepository.upsertedProducts).toEqual([expectedProduct]);
        expect(productRepository.upsertContexts).toEqual([
            {
                source: 'manual',
                crawlRunId: 'crawl-run-1',
                capturedAt: result.finishedAt,
            },
        ]);
        expect(runRepository.completedRuns).toEqual([
            {
                id: 'crawl-run-1',
                status: 'success',
                productCount: 1,
                finishedAt: result.finishedAt,
            },
        ]);
        expect(result.runId).toBe('crawl-run-1');
    });

    test('should mark the crawl run failed when the crawler throws', async () => {
        const runRepository = new FakeCrawlRunRepository();
        const productRepository = new FakeProductRepository();
        const agent = new CostcoCrawlerAgent({
            crawler: {
                crawlProducts: async () => {
                    throw new Error('Costco blocked the request');
                },
            },
            runRepository,
            productRepository,
        });

        await expect(
            agent.runCostcoCrawl({
                source: 'scheduler',
            })
        ).rejects.toThrow('Costco blocked the request');

        expect(productRepository.upsertedProducts).toEqual([]);
        expect(runRepository.completedRuns).toEqual([
            {
                id: 'crawl-run-1',
                status: 'failed',
                productCount: 0,
                errorMessage: 'Costco blocked the request',
                finishedAt: expect.any(Date),
            },
        ]);
    });

    test('should register health and manual crawl routes on the Fastify server', async () => {
        const server = buildClawCostcoServer({
            agent: new CostcoCrawlerAgent({
                crawlProducts: async () => [],
            }),
        });

        const healthResponse = await server.inject({
            method: 'GET',
            url: '/health',
        });
        const crawlResponse = await server.inject({
            method: 'POST',
            url: '/claw-costco/crawl',
            payload: { limit: 5 },
        });

        expect(healthResponse.statusCode).toBe(200);
        expect(JSON.parse(healthResponse.body)).toEqual({
            service: 'claw-costco',
            status: 'ok',
        });
        expect(crawlResponse.statusCode).toBe(200);
        expect(JSON.parse(crawlResponse.body)).toMatchObject({
            store: 'costco',
            source: 'manual',
            products: [],
        });

        await server.close();
    });

    test('should pass manual category crawl options from the API to the agent', async () => {
        const agent = new RecordingCrawlAgent();
        const server = buildClawCostcoServer({ agent });

        const response = await server.inject({
            method: 'POST',
            url: '/claw-costco/crawl',
            payload: {
                categoryUrl: 'https://www.costco.com/pantry.html',
                category: 'pantry',
                productName: 'espoir Water Splash Sun Serum Sunscreen SPF 50, 1.69 fl oz, 2-pack',
                productUrl: 'https://www.costco.com/espoir-water-splash-sun-serum-sunscreen-spf-50-169-fl-oz-2-pack.product.4000424213.html',
                limit: 3,
            },
        });

        expect(response.statusCode).toBe(200);
        expect(agent.inputs).toEqual([
            {
                source: 'manual',
                categoryUrl: 'https://www.costco.com/pantry.html',
                category: 'pantry',
                productName: 'espoir Water Splash Sun Serum Sunscreen SPF 50, 1.69 fl oz, 2-pack',
                productUrl: 'https://www.costco.com/espoir-water-splash-sun-serum-sunscreen-spf-50-169-fl-oz-2-pack.product.4000424213.html',
                limit: 3,
            },
        ]);

        await server.close();
    });

    test('should expose crawl run, product, price history, and status query endpoints', async () => {
        const readRepository = new FakeReadRepository();
        const server = buildClawCostcoServer({
            agent: new RecordingCrawlAgent(),
            readRepository,
        });

        const runsResponse = await server.inject({
            method: 'GET',
            url: '/claw-costco/runs?limit=1',
        });
        const productsResponse = await server.inject({
            method: 'GET',
            url: '/claw-costco/products?limit=1',
        });
        const historyResponse = await server.inject({
            method: 'GET',
            url: '/claw-costco/products/4000424213/history?limit=1',
        });
        const statusResponse = await server.inject({
            method: 'GET',
            url: '/claw-costco/status',
        });

        expect(runsResponse.statusCode).toBe(200);
        expect(JSON.parse(runsResponse.body)).toEqual({
            runs: [readRepository.runs[0]],
        });
        expect(productsResponse.statusCode).toBe(200);
        expect(JSON.parse(productsResponse.body)).toEqual({
            products: [readRepository.products[0]],
        });
        expect(historyResponse.statusCode).toBe(200);
        expect(JSON.parse(historyResponse.body)).toEqual({
            sku: '4000424213',
            history: [readRepository.priceHistory[0]],
        });
        expect(statusResponse.statusCode).toBe(200);
        expect(JSON.parse(statusResponse.body)).toEqual({
            lastRun: readRepository.runs[0],
            productCount: 1,
            lastError: null,
        });

        expect(readRepository.calls).toEqual([
            ['listRuns', 1],
            ['listProducts', 1],
            ['listPriceHistory', '4000424213', 1],
            ['getStatus'],
        ]);

        await server.close();
    });

    test('should expose an OpenClaw-ready insight summary endpoint', async () => {
        const readRepository = new FakeReadRepository();
        const server = buildClawCostcoServer({
            agent: new RecordingCrawlAgent(),
            readRepository,
        });

        const response = await server.inject({
            method: 'GET',
            url: '/claw-costco/insights/summary',
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            store: 'costco',
            generatedBy: 'openclaw-ready',
            productCount: 1,
            lastRunStatus: 'success',
            lastRunFinishedAt: '2026-07-01T10:00:00.000Z',
            lastError: null,
            priceSignals: [
                {
                    sku: '4000424213',
                    latestPrice: 27.99,
                    previousPrice: 29.99,
                    change: -2,
                    direction: 'down',
                },
            ],
        });

        await server.close();
    });
});

class RecordingCrawlAgent implements CrawlAgent {
    readonly inputs: CrawlJobInput[] = [];

    async runCostcoCrawl(input: CrawlJobInput): Promise<CrawlJobResult> {
        this.inputs.push(input);

        return {
            store: 'costco',
            source: input.source,
            startedAt: new Date(),
            finishedAt: new Date(),
            products: [],
        };
    }
}

class FakeProductRepository implements CostcoProductRepository {
    readonly upsertedProducts: Product[] = [];
    readonly upsertContexts: unknown[] = [];

    async upsertMany(products: Product[], context?: unknown): Promise<void> {
        this.upsertedProducts.push(...products);
        this.upsertContexts.push(context);
    }
}

class FakeCrawlRunRepository implements CostcoCrawlRunRepository {
    readonly startedRuns: Array<{
        source: string;
        startedAt: Date;
    }> = [];
    readonly completedRuns: Array<{
        id: string;
        status: string;
        productCount: number;
        errorMessage?: string;
        finishedAt: Date;
    }> = [];

    async startRun(input: { source: string; startedAt: Date }): Promise<{ id: string }> {
        this.startedRuns.push(input);

        return { id: 'crawl-run-1' };
    }

    async completeRun(input: {
        id: string;
        status: string;
        productCount: number;
        errorMessage?: string;
        finishedAt: Date;
    }): Promise<void> {
        this.completedRuns.push(input);
    }
}

class FakeReadRepository implements CostcoReadRepository {
    readonly calls: unknown[] = [];
    readonly runs = [
        {
            id: 'crawl-run-1',
            source: 'manual',
            status: 'success',
            productCount: 1,
            errorMessage: null,
            startedAt: '2026-07-01T09:59:00.000Z',
            finishedAt: '2026-07-01T10:00:00.000Z',
        },
    ];
    readonly products = [
        {
            sku: '4000424213',
            name: 'espoir Water Splash Sun Serum Sunscreen SPF 50, 1.69 fl oz, 2-pack',
            price: 27.99,
            category: 'sun-care',
            image: 'https://cdn.costco.com/espoir-water-splash-sun-serum.jpg',
            url: 'https://www.costco.com/espoir-water-splash-sun-serum-sunscreen-spf-50-169-fl-oz-2-pack.product.4000424213.html',
            updatedAt: '2026-07-01T10:00:00.000Z',
        },
    ];
    readonly priceHistory = [
        {
            sku: '4000424213',
            price: 27.99,
            currency: 'USD',
            source: 'manual',
            crawlRunId: 'crawl-run-1',
            capturedAt: '2026-07-01T10:00:00.000Z',
        },
        {
            sku: '4000424213',
            price: 29.99,
            currency: 'USD',
            source: 'manual',
            crawlRunId: 'crawl-run-0',
            capturedAt: '2026-06-30T10:00:00.000Z',
        },
    ];

    async listRuns(limit: number) {
        this.calls.push(['listRuns', limit]);

        return this.runs.slice(0, limit);
    }

    async listProducts(limit: number) {
        this.calls.push(['listProducts', limit]);

        return this.products.slice(0, limit);
    }

    async listPriceHistory(sku: string, limit: number) {
        this.calls.push(['listPriceHistory', sku, limit]);

        return this.priceHistory.slice(0, limit);
    }

    async getStatus() {
        this.calls.push(['getStatus']);

        return {
            lastRun: this.runs[0],
            productCount: this.products.length,
            lastError: null,
        };
    }

    async listLatestPriceSignals() {
        return [
            {
                sku: '4000424213',
                prices: this.priceHistory.slice(0, 2),
            },
        ];
    }
}
