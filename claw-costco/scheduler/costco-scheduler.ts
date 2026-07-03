import type { CrawlAgent } from '../agent/types';
import { OpenClawAgent } from '../agent/open-claw-agent';
import type { ClawCostcoConfig } from '../config/env';
import { logger } from '../logger';
import { runWithRetry } from './retry';

export type CostcoScheduledTask = {
    start(): void;
    stop(): void;
};

export function intervalToCronExpression(interval: string): string {
    if (interval.endsWith('h')) {
        const hours = Number(interval.slice(0, -1));
        return `0 */${hours} * * *`;
    }

    if (interval.endsWith('d')) {
        const days = Number(interval.slice(0, -1));
        return `0 0 */${days} * *`;
    }

    if (interval.endsWith('m')) {
        const minutes = Number(interval.slice(0, -1));
        return `*/${minutes} * * * *`;
    }

    throw new Error(`Unsupported crawl interval "${interval}"`);
}

export async function scheduleCostcoCrawl(
    agent: CrawlAgent | OpenClawAgent,
    config: ClawCostcoConfig,
    stores: string[] = ['costco']
): Promise<CostcoScheduledTask> {
    const cron = await import('node-cron');

    if (!config.schedulerEnabled) {
        return {
            start: () => {
                logger.info({ stores }, 'Scheduler is disabled');
            },
            stop: () => undefined,
        };
    }

    return cron.createTask(
        intervalToCronExpression(config.crawlInterval),
        async () => {
            for (const store of stores) {
                logger.info({ store }, 'Starting scheduled crawl');
                await runWithRetry(
                    async () => {
                        if (agent instanceof OpenClawAgent) {
                            await agent.runCrawl({
                                store,
                                source: 'scheduler',
                                categoryUrl: config.categoryUrl,
                                category: config.category,
                                productName: config.productName,
                                productUrl: config.productUrl,
                            });
                        } else {
                            await agent.runCostcoCrawl({
                                source: 'scheduler',
                                categoryUrl: config.categoryUrl,
                                category: config.category,
                                productName: config.productName,
                                productUrl: config.productUrl,
                            });
                        }
                    },
                    {
                        retries: config.crawlRetry,
                        delayMs: config.crawlRetryDelayMs,
                        onRetry: ({ attempt, error }) => {
                            logger.warn(
                                {
                                    store,
                                    attempt,
                                    error: error.message,
                                },
                                'Retrying scheduled crawl'
                            );
                        },
                    }
                );
            }
        }
    );
}
