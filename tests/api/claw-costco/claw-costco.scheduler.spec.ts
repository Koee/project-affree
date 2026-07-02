import { expect, test } from '@playwright/test';
import { runWithRetry } from '../../../claw-costco/scheduler/retry';

test.describe('@claw-costco scheduler retry', () => {
    test('should retry a failed crawl and return the successful result', async () => {
        let attempts = 0;

        const result = await runWithRetry(
            async () => {
                attempts += 1;

                if (attempts < 3) {
                    throw new Error(`temporary failure ${attempts}`);
                }

                return 'success';
            },
            {
                retries: 2,
                delayMs: 0,
            }
        );

        expect(result).toBe('success');
        expect(attempts).toBe(3);
    });

    test('should rethrow the last error after retry attempts are exhausted', async () => {
        let attempts = 0;

        await expect(
            runWithRetry(
                async () => {
                    attempts += 1;
                    throw new Error(`failed attempt ${attempts}`);
                },
                {
                    retries: 1,
                    delayMs: 0,
                }
            )
        ).rejects.toThrow('failed attempt 2');

        expect(attempts).toBe(2);
    });
});
