import { buildClawCostcoServer } from './api/server';
import { CostcoCrawlerAgent } from './agent/costco-crawler-agent';
import { createClawCostcoConfig } from './config/env';
import { scheduleCostcoCrawl } from './scheduler/costco-scheduler';
import { logger } from './logger';

const config = createClawCostcoConfig();
const agent = new CostcoCrawlerAgent();
const server = buildClawCostcoServer({ agent });

async function start() {
    const scheduledTask = await scheduleCostcoCrawl(agent, config);

    scheduledTask.start();

    await server.listen({
        port: Number(process.env.PORT || 3001),
        host: process.env.HOST || '0.0.0.0',
    });
}

start().catch(error => {
    logger.error({ error }, 'Failed to start claw-costco service');
    process.exit(1);
});
