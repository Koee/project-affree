import fastify from 'fastify';
import { z } from 'zod';
import type { OpenClawAgent } from '../open-claw-agent';
import { logger } from '../../claw-costco/logger';

const CrawlBodySchema = z.object({
    store: z.string().min(1),
    source: z.enum(['manual', 'scheduler', 'openclaw']).default('manual'),
    limit: z.number().int().positive().optional(),
    categoryUrl: z.string().url().optional(),
    category: z.string().optional(),
    productName: z.string().optional(),
    productUrl: z.string().url().optional(),
});

export type BuildOpenClawServerOptions = {
    agent: OpenClawAgent;
};

export function buildOpenClawServer(options: BuildOpenClawServerOptions) {
    const server = fastify({ loggerInstance: logger });

    server.get('/health', async () => ({
        service: 'claw-data-costco',
        status: 'ok',
    }));

    server.post('/claw-data/crawl', async (request, reply) => {
        const parsed = CrawlBodySchema.safeParse(request.body);

        if (!parsed.success) {
            return reply.status(400).send({
                error: 'INVALID_CRAWL_INPUT',
                details: parsed.error.issues,
            });
        }

        try {
            return await options.agent.runCrawl(parsed.data);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return reply.status(400).send({ error: 'CRAWL_FAILED', message });
        }
    });

    return server;
}