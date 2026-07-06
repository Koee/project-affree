import fastify from 'fastify';
import { z } from 'zod';
import { CostcoCrawlerAgent } from '../agent/costco-crawler-agent';
import { CostcoInsightAgent } from '../agent/costco-insight-agent';
import type { CrawlAgent } from '../agent/types';
import type { OpenClawAgent } from '../agent/open-claw-agent';
import {
    PrismaReadRepository,
    type ReadRepository,
} from '../db/repositories';
import { logger } from '../logger';

const CrawlBodySchema = z.object({
    store: z.string().min(1),
    source: z.enum(['manual', 'scheduler', 'openclaw']).default('manual'),
    limit: z.number().int().positive().optional(),
    categoryUrl: z.string().url().optional(),
    category: z.string().optional(),
    productName: z.string().optional(),
    productUrl: z.string().url().optional(),
});

export type BuildClawCostcoServerOptions = {
    agent?: CrawlAgent;
    openClawAgent?: OpenClawAgent;
    readRepository?: ReadRepository;
};

export function buildClawCostcoServer(options: BuildClawCostcoServerOptions = {}) {
    const agent = options.agent || new CostcoCrawlerAgent();
    const openClawAgent = options.openClawAgent;
    const readRepository = options.readRepository || new PrismaReadRepository();
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

    if (openClawAgent) {
        server.post('/claw-data/crawl', async (request, reply) => {
            const parsed = CrawlBodySchema.safeParse(request.body);

            if (!parsed.success) {
                return reply.status(400).send({
                    error: 'INVALID_CRAWL_INPUT',
                    details: parsed.error.issues,
                });
            }

            try {
                return await openClawAgent.runCrawl(parsed.data);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                return reply.status(400).send({ error: 'CRAWL_FAILED', message });
            }
        });
    }

    server.get<{
        Querystring: {
            limit?: string;
        };
    }>('/claw-costco/runs', async request => {
        return {
            runs: await readRepository.listRuns('costco', parseLimit(request.query.limit)),
        };
    });

    server.get<{
        Querystring: {
            limit?: string;
        };
    }>('/claw-costco/products', async request => {
        return {
            products: await readRepository.listProducts('costco', parseLimit(request.query.limit)),
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
                'costco',
                request.params.sku,
                parseLimit(request.query.limit)
            ),
        };
    });

    server.get('/claw-costco/status', async () => readRepository.getStatus('costco'));

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
