import { test, expect } from '@playwright/test';
import { buildOpenClawServer } from '../../../claw-data-costco/api/open-claw-server';
import { OpenClawAgent } from '../../../claw-data-costco/open-claw-agent';
import type {
    OpenClawCrawlInput,
    OpenClawCrawlResult,
} from '../../../claw-data-costco/open-claw-types';
import type { Product } from '../../../claw-costco/types/product';

test.describe('@claw-data-costco @api', () => {
    test('GET /health returns service name and ok status', async () => {
        const server = buildOpenClawServer({
            agent: new OpenClawAgent(),
        });

        const response = await server.inject({
            method: 'GET',
            url: '/health',
        });

        expect(response.statusCode, 'GET /health should return 200').toBe(200);
        expect(JSON.parse(response.body), 'GET /health should return service name and ok status').toEqual({
            service: 'claw-data-costco',
            status: 'ok',
        });

        await server.close();
    });

    test('POST /claw-data/crawl with valid store returns OpenClawCrawlResult', async () => {
        const expectedProduct: Product = {
            sku: 'costco-001',
            name: 'Kirkland Coffee',
            price: 19.99,
            category: 'grocery',
            image: 'https://www.costco.com/image.jpg',
            url: 'https://www.costco.com/product.html',
        };

        const fakeAgent = new RecordingOpenClawAgent([
            {
                store: 'costco',
                source: 'manual',
                startedAt: new Date(),
                finishedAt: new Date(),
                products: [expectedProduct],
            },
        ]);

        const server = buildOpenClawServer({ agent: fakeAgent });

        const response = await server.inject({
            method: 'POST',
            url: '/claw-data/crawl',
            payload: { store: 'costco', limit: 3 },
        });

        expect(response.statusCode, 'POST /claw-data/crawl with valid store should return 200').toBe(200);
        const body = JSON.parse(response.body);
        expect(body.store, 'Crawl result store should match requested store').toBe('costco');
        expect(body.source, 'Crawl result source should be manual').toBe('manual');
        expect(body.products, 'Crawl result should return the expected product list').toEqual([expectedProduct]);

        await server.close();
    });

    test('POST /claw-data/crawl with unknown store returns HTTP 400', async () => {
        const server = buildOpenClawServer({
            agent: new OpenClawAgent(),
        });

        const response = await server.inject({
            method: 'POST',
            url: '/claw-data/crawl',
            payload: { store: 'unknown' },
        });

        expect(response.statusCode, 'POST /claw-data/crawl with unknown store should return 400').toBe(400);
        const body = JSON.parse(response.body);
        expect(body.error, 'Error code should be CRAWL_FAILED for unknown store').toBe('CRAWL_FAILED');
        expect(body.message, 'Error message should mention no crawler registered for unknown store').toContain('No crawler registered for store "unknown"');

        await server.close();
    });

    test('POST /claw-data/crawl with missing store returns HTTP 400 (zod validation)', async () => {
        const server = buildOpenClawServer({
            agent: new OpenClawAgent(),
        });

        const response = await server.inject({
            method: 'POST',
            url: '/claw-data/crawl',
            payload: { limit: 5 },
        });

        expect(response.statusCode, 'POST /claw-data/crawl with missing store should return 400').toBe(400);
        const body = JSON.parse(response.body);
        expect(body.error, 'Error code should be INVALID_CRAWL_INPUT when store is missing').toBe('INVALID_CRAWL_INPUT');

        await server.close();
    });
});

class RecordingOpenClawAgent extends OpenClawAgent {
    private readonly results: OpenClawCrawlResult[];
    private callIndex = 0;

    constructor(results: OpenClawCrawlResult[]) {
        super();
        this.results = results;
    }

    async runCrawl(input: OpenClawCrawlInput): Promise<OpenClawCrawlResult> {
        const result = this.results[this.callIndex++] || this.results[0];
        return {
            ...result,
            source: input.source,
            store: input.store,
        };
    }
}