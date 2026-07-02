import { test, expect } from '@playwright/test';
import { scheduleOpenClawCrawl } from '../../../claw-data-costco/scheduler/open-claw-scheduler';
import { OpenClawAgent } from '../../../claw-data-costco/open-claw-agent';
import { intervalToCronExpression } from '../../../claw-costco/scheduler/costco-scheduler';
import type { OpenClawCrawlInput } from '../../../claw-data-costco/open-claw-types';
import type { ClawCostcoConfig } from '../../../claw-costco/config/env';

test.describe('@claw-data-costco @scheduler', () => {
    const fakeConfig: ClawCostcoConfig = {
        databaseUrl: 'postgresql://fake',
        headless: true,
        timeoutMs: 30_000,
        crawlInterval: '24h',
        crawlIntervalMs: 86_400_000,
        crawlRetry: 2,
        crawlRetryDelayMs: 1_000,
        schedulerEnabled: true,
        category: 'sun-care',
        categoryUrl: 'https://www.costco.com/sun-care.html',
    };

    test('intervalToCronExpression converts 24h to 0 */24 * * *', () => {
        expect(intervalToCronExpression('24h'), '24h interval should convert to cron expression 0 */24 * * *').toBe('0 */24 * * *');
    });

    test('scheduleOpenClawCrawl returns an object with start and stop methods', async () => {
        const agent = new OpenClawAgent();
        const task = await scheduleOpenClawCrawl(agent, fakeConfig, ['costco'], {
            createTask: () => ({
                start: () => undefined,
                stop: () => undefined,
            }),
        });

        expect(typeof task.start, 'Scheduled task should expose a start function').toBe('function');
        expect(typeof task.stop, 'Scheduled task should expose a stop function').toBe('function');
    });

    test('recording OpenClawAgent receives runCrawl with scheduler source when task fires', async () => {
        const agent = new RecordingOpenClawAgent();
        let capturedCallback: (() => Promise<void>) | null = null;

        const task = await scheduleOpenClawCrawl(agent, fakeConfig, ['costco'], {
            createTask: (_expr, callback) => {
                capturedCallback = callback as () => Promise<void>;
                return {
                    start: () => undefined,
                    stop: () => undefined,
                };
            },
        });

        expect(capturedCallback, 'Scheduler should capture a callback when createTask is invoked').not.toBeNull();
        await capturedCallback!();

        expect(agent.recordedInputs, 'Agent should receive exactly one runCrawl call when scheduler fires').toHaveLength(1);
        expect(agent.recordedInputs[0], 'Scheduler should call runCrawl with scheduler source and config-derived fields').toEqual({
            store: 'costco',
            source: 'scheduler',
            categoryUrl: 'https://www.costco.com/sun-care.html',
            category: 'sun-care',
            productName: undefined,
            productUrl: undefined,
        });

        task.stop();
    });
});

class RecordingOpenClawAgent extends OpenClawAgent {
    readonly recordedInputs: OpenClawCrawlInput[] = [];

    async runCrawl(input: OpenClawCrawlInput) {
        this.recordedInputs.push(input);
        return {
            store: input.store,
            source: input.source,
            startedAt: new Date(),
            finishedAt: new Date(),
            products: [],
        };
    }
}