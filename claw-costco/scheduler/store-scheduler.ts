import { logger } from '../logger';
import { runWithRetry } from './retry';
import { intervalToCronExpression, type CostcoScheduledTask } from './costco-scheduler';
import { OpenClawAgent } from '../agent/open-claw-agent';

export type ScheduledTask = CostcoScheduledTask;

export class StoreScheduler {
    constructor(
        private readonly store: string,
        private readonly agent: any,
        private readonly config: {
            schedulerEnabled: boolean;
            crawlInterval: string;
            crawlRetry: number;
            crawlRetryDelayMs: number;
            categoryUrl?: string;
            category: string;
            productName?: string;
            productUrl?: string;
        }
    ) {}

    async createTask(): Promise<ScheduledTask> {
        const cron = await import('node-cron');

        if (!this.config.schedulerEnabled) {
            return {
                start: () => {
                    logger.info({ store: this.store }, 'Scheduler is disabled');
                },
                stop: () => undefined,
            };
        }

        return cron.createTask(
            intervalToCronExpression(this.config.crawlInterval),
            async () => {
                logger.info({ store: this.store }, 'Starting scheduled crawl');
                await runWithRetry(
                    async () => {
                        if (this.agent instanceof OpenClawAgent) {
                            await this.agent.runCrawl({
                                store: this.store,
                                source: 'scheduler',
                                categoryUrl: this.config.categoryUrl,
                                category: this.config.category,
                                productName: this.config.productName,
                                productUrl: this.config.productUrl,
                            });
                        } else {
                            await this.agent.runCostcoCrawl({
                                source: 'scheduler',
                                categoryUrl: this.config.categoryUrl,
                                category: this.config.category,
                                productName: this.config.productName,
                                productUrl: this.config.productUrl,
                            });
                        }
                    },
                    {
                        retries: this.config.crawlRetry,
                        delayMs: this.config.crawlRetryDelayMs,
                        onRetry: ({ attempt, error }) => {
                            logger.warn(
                                {
                                    store: this.store,
                                    attempt,
                                    error: error.message,
                                },
                                'Retrying scheduled crawl'
                            );
                        },
                    }
                );
            }
        );
    }
}
