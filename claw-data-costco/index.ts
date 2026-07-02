import { OpenClawAgent, wrapCostcoAgent } from './open-claw-agent';
import { buildOpenClawServer } from './api/open-claw-server';
import { scheduleOpenClawCrawl } from './scheduler/open-claw-scheduler';
import { CostcoCrawlerAgent } from '../claw-costco/agent/costco-crawler-agent';
import { createClawCostcoConfig } from '../claw-costco/config/env';
import { parseOpenClawStores } from './config/env';
import { logger } from '../claw-costco/logger';

const config = createClawCostcoConfig();
const stores = parseOpenClawStores(process.env.OPEN_CLAW_STORES);

const openAgent = new OpenClawAgent();
const costcoAgent = new CostcoCrawlerAgent();
openAgent.register(wrapCostcoAgent(costcoAgent));

const server = buildOpenClawServer({ agent: openAgent });

async function start() {
    const task = await scheduleOpenClawCrawl(openAgent, config, stores);
    task.start();

    await server.listen({
        port: Number(process.env.PORT || 3002),
        host: process.env.HOST || '0.0.0.0',
    });

    logger.info({ stores, port: process.env.PORT || 3002 }, 'claw-data-costco service started');
}

start().catch(error => {
    logger.error({ error }, 'Failed to start claw-data-costco service');
    process.exit(1);
});