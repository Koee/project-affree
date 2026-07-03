import { buildClawCostcoServer } from './api/server';
import { CostcoCrawlerAgent } from './agent/costco-crawler-agent';
import { OpenClawAgent, wrapCostcoAgent } from './agent/open-claw-agent';
import { createClawCostcoConfig, parseOpenClawStores } from './config/env';
import { scheduleCostcoCrawl } from './scheduler/costco-scheduler';
import { logger } from './logger';

const config = createClawCostcoConfig();
const stores = parseOpenClawStores(process.env.OPEN_CLAW_STORES);

const openClawAgent = new OpenClawAgent();
const costcoAgent = new CostcoCrawlerAgent();
openClawAgent.register(wrapCostcoAgent(costcoAgent));

const server = buildClawCostcoServer({ agent: costcoAgent, openClawAgent });

async function start() {
    const scheduledTask = await scheduleCostcoCrawl(openClawAgent, config, stores);

    scheduledTask.start();

    await server.listen({
        port: Number(process.env.PORT || 3001),
        host: process.env.HOST || '0.0.0.0',
    });

    logger.info({ stores, port: 3001 }, 'claw-costco service started');
}

start().catch(error => {
    logger.error({ error }, 'Failed to start claw-costco service');
    process.exit(1);
});
