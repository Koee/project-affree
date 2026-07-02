import fastify from 'fastify';
import { CostcoCrawlerAgent } from '../agent/costco-crawler-agent';
import { CostcoInsightAgent } from '../agent/costco-insight-agent';
import type { CrawlAgent } from '../agent/types';
import {
    PrismaCostcoReadRepository,
    type CostcoReadRepository,
} from '../db/repositories';
import { logger } from '../logger';

export type BuildClawCostcoServerOptions = {
    agent?: CrawlAgent;
    readRepository?: CostcoReadRepository;
};

export function buildClawCostcoServer(options: BuildClawCostcoServerOptions = {}) {
    const agent = options.agent || new CostcoCrawlerAgent();
    const readRepository = options.readRepository || new PrismaCostcoReadRepository();
    const insightAgent = new CostcoInsightAgent(readRepository);
    const server = fastify({
        loggerInstance: logger,
    });

    server.get('/health', async () => ({
        service: 'claw-costco',
        status: 'ok',
    }));

    server.post<{
        Body: {
            limit?: number;
            categoryUrl?: string;
            category?: string;
            productName?: string;
            productUrl?: string;
        };
    }>('/claw-costco/crawl', async request => {
        return agent.runCostcoCrawl({
            source: 'manual',
            limit: request.body?.limit,
            categoryUrl: request.body?.categoryUrl,
            category: request.body?.category,
            productName: request.body?.productName,
            productUrl: request.body?.productUrl,
        });
    });

    server.get<{
        Querystring: {
            limit?: string;
        };
    }>('/claw-costco/runs', async request => {
        return {
            runs: await readRepository.listRuns(parseLimit(request.query.limit)),
        };
    });

    server.get<{
        Querystring: {
            limit?: string;
        };
    }>('/claw-costco/products', async request => {
        return {
            products: await readRepository.listProducts(parseLimit(request.query.limit)),
        };
    });

    server.get<{
        Params: {
            sku: string;
        };
        Querystring: {
            limit?: string;
        };
    }>('/claw-costco/products/:sku/history', async request => {
        return {
            sku: request.params.sku,
            history: await readRepository.listPriceHistory(
                request.params.sku,
                parseLimit(request.query.limit)
            ),
        };
    });

    server.get('/claw-costco/status', async () => readRepository.getStatus());

    server.get('/claw-costco/insights/summary', async () => insightAgent.buildSummary());

    return server;
}

function parseLimit(value: string | undefined, fallback = 20): number {
    const limit = Number(value || fallback);

    if (!Number.isFinite(limit) || limit < 1) {
        return fallback;
    }

    return Math.min(limit, 100);
}
