import type { CrawlAgent } from '../agent/types';
import { OpenClawAgent } from '../agent/open-claw-agent';
import type { ClawCostcoConfig } from '../config/env';
import { logger } from '../logger';
import { runWithRetry } from './retry';
import { SchedulerFactory } from './scheduler-factory';

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
    if (!config.schedulerEnabled) {
        return {
            start: () => {
                logger.info({ stores }, 'Scheduler is disabled');
            },
            stop: () => undefined,
        };
    }

    const tasks = await Promise.all(
        stores.map(async (store) => {
            const storeScheduler = SchedulerFactory.create(store, agent, config);
            return storeScheduler.createTask();
        })
    );

    return {
        start: () => {
            for (const task of tasks) {
                task.start();
            }
        },
        stop: () => {
            for (const task of tasks) {
                task.stop();
            }
        },
    };
}
