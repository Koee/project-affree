import { test, expect } from '@playwright/test';
import { OpenClawAgent, wrapCostcoAgent } from '../../../claw-data-costco/open-claw-agent.js';
import type {
    OpenClawCrawlInput,
    OpenClawCrawlResult,
    CrawlerRegistration,
} from '../../../claw-data-costco/open-claw-types.js';
import { CostcoCrawlerAgent } from '../../../claw-costco/agent/costco-crawler-agent.js';
import type {
    CrawlAgent,
    CrawlJobInput,
    CrawlJobResult,
} from '../../../claw-costco/agent/types.js';
import type {
    CostcoCrawlRunRepository,
    CostcoProductRepository,
} from '../../../claw-costco/db/repositories.js';
import type { Product } from '../../../claw-costco/types/product.js';

test.describe('@claw-data-costco @open-claw-agent', () => {
    test('should register a fake costco crawler and return normalized products via runCrawl', async () => {
        const expectedProduct: Product = {
            sku: 'costco-001',
            name: 'Kirkland Coffee',
            price: 19.99,
            category: 'grocery',
            image: 'https://www.costco.com/image.jpg',
            url: 'https://www.costco.com/product.html',
        };

        const fakeRegistration: CrawlerRegistration = {
            store: 'costco',
            crawl: async () => ({
                store: 'costco',
                source: 'manual',
                startedAt: new Date(),
                finishedAt: new Date(),
                products: [expectedProduct],
            }),
        };

        const agent = new OpenClawAgent();
        agent.register(fakeRegistration);

        const result = await agent.runCrawl({ store: 'costco', source: 'manual' });

        expect(result.products, 'runCrawl should return the expected product list').toEqual([expectedProduct]);
        expect(result.store, 'runCrawl result store should match requested store').toBe('costco');
        expect(result.source, 'runCrawl result source should match requested source').toBe('manual');
        expect(result.startedAt, 'runCrawl result should have a startedAt Date').toBeInstanceOf(Date);
        expect(result.finishedAt, 'runCrawl result should have a finishedAt Date').toBeInstanceOf(Date);
    });

    test('should throw a clear error when the requested store is not registered', async () => {
        const agent = new OpenClawAgent();

        await expect(
            agent.runCrawl({ store: 'unknown', source: 'manual' }),
            'runCrawl with unregistered store should throw descriptive error'
        ).rejects.toThrow('No crawler registered for store "unknown"');
    });

    test('should wrap the real CostcoCrawlerAgent and return a CrawlJobResult with store costco', async () => {
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
        const costcoAgent = new CostcoCrawlerAgent({
            crawler: {
                crawlProducts: async () => [expectedProduct],
            },
            runRepository,
            productRepository,
        });

        const registration = wrapCostcoAgent(costcoAgent);
        expect(registration.store, 'wrapCostcoAgent should register with store name costco').toBe('costco');

        const openAgent = new OpenClawAgent();
        openAgent.register(registration);

        const result = await openAgent.runCrawl({
            store: 'costco',
            source: 'manual',
            limit: 5,
        });

        expect(result.store, 'Wrapped agent result store should be costco').toBe('costco');
        expect(result.source, 'Wrapped agent result source should be manual').toBe('manual');
        expect(result.products, 'Wrapped agent should return the expected product list').toEqual([expectedProduct]);
        expect(result.runId, 'Wrapped agent should return runId from run repository').toBe('crawl-run-1');
        expect(result.startedAt, 'Wrapped agent result should have a startedAt Date').toBeInstanceOf(Date);
        expect(result.finishedAt, 'Wrapped agent result should have a finishedAt Date').toBeInstanceOf(Date);
    });

    test('should list registered stores after registration', async () => {
        const agent = new OpenClawAgent();

        expect(agent.listRegisteredStores(), 'No stores should be registered initially').toEqual([]);

        agent.register({
            store: 'costco',
            crawl: async () => ({
                store: 'costco',
                source: 'manual',
                startedAt: new Date(),
                finishedAt: new Date(),
                products: [],
            }),
        });

        expect(agent.listRegisteredStores(), 'After registration, costco should appear in registered stores').toEqual(['costco']);
    });
});

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