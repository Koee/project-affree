import { test, expect } from '@playwright/test';
import { OpenClawAgent, wrapWalmartAgent } from '../../../claw-costco/agent/open-claw-agent';
import { WalmartCrawlerAgent } from '../../../claw-costco/agent/walmart-crawler-agent';
import type { Product } from '../../../claw-costco/types/product';

class FakeCrawlRunRepository {
    async startRun() {
        return { id: 'run-walmart-test' };
    }
    async completeRun() {}
}

class FakeProductRepository {
    async upsertMany() {}
}

test.describe('@claw-costco @walmart-agent', () => {
    test('should wrap the real WalmartCrawlerAgent and return a CrawlJobResult with store walmart', async () => {
        const expectedProduct: Product = {
            sku: 'walmart-001',
            name: 'Great Value Milk',
            price: 3.29,
            category: 'grocery',
            image: 'https://www.walmart.com/milk.jpg',
            url: 'https://www.walmart.com/milk.html',
        };

        const runRepository = new FakeCrawlRunRepository();
        const productRepository = new FakeProductRepository();
        const walmartAgent = new WalmartCrawlerAgent({
            crawler: {
                crawlProducts: async () => [expectedProduct],
            } as any,
            productRepository: productRepository as any,
            runRepository: runRepository as any,
        });

        const openAgent = new OpenClawAgent();
        openAgent.register(wrapWalmartAgent(walmartAgent));

        const result = await openAgent.runCrawl({
            store: 'walmart',
            source: 'manual',
            categoryUrl: 'https://www.walmart.com/browse/grocery',
            category: 'grocery',
        });

        expect(result.products).toEqual([expectedProduct]);
        expect(result.store).toBe('walmart');
        expect(result.source).toBe('manual');
    });
});
