export type RetryOptions = {
    retries: number;
    delayMs: number;
    onRetry?: (input: { attempt: number; error: Error }) => void;
};

export async function runWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions
): Promise<T> {
    let lastError: Error | undefined;
    const maxAttempts = options.retries + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt >= maxAttempts) {
                break;
            }

            options.onRetry?.({ attempt, error: lastError });

            if (options.delayMs > 0) {
                await delay(options.delayMs);
            }
        }
    }

    throw lastError || new Error('Retry operation failed');
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
