import type { OpenClawAgent } from '../open-claw-agent';
import type { ClawCostcoConfig } from '../../claw-costco/config/env';
import { intervalToCronExpression } from '../../claw-costco/scheduler/costco-scheduler';
import { logger } from '../../claw-costco/logger';

export type OpenClawScheduledTask = {
    start(): void;
    stop(): void;
};

export type ScheduleOpenClawCrawlOptions = {
    createTask?: (
        expression: string,
        callback: () => Promise<void>
    ) => OpenClawScheduledTask;
};

export async function scheduleOpenClawCrawl(
    agent: OpenClawAgent,
    config: ClawCostcoConfig,
    stores: string[] = ['costco'],
    options?: ScheduleOpenClawCrawlOptions
): Promise<OpenClawScheduledTask> {
    const expression = intervalToCronExpression(config.crawlInterval);

    const createTask =
        options?.createTask ||
        (async () => {
            const cron = await import('node-cron');
            return cron.createTask;
        })() as unknown as (
            expression: string,
            callback: () => Promise<void>
        ) => OpenClawScheduledTask;

    return createTask(expression, async () => {
        for (const store of stores) {
            logger.info({ store }, 'OpenClaw scheduled crawl starting');
            try {
                await agent.runCrawl({
                    store,
                    source: 'scheduler',
                    categoryUrl: config.categoryUrl,
                    category: config.category,
                    productName: config.productName,
                    productUrl: config.productUrl,
                });
            } catch (error) {
                logger.error({ store, error }, 'OpenClaw scheduled crawl failed');
            }
        }
    });
}