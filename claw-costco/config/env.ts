import dotenv from 'dotenv';

export const COSTCO_ENV_FILE = '.env.costco';

export type ClawCostcoConfig = {
    databaseUrl: string;
    headless: boolean;
    timeoutMs: number;
    crawlInterval: string;
    crawlIntervalMs: number;
    crawlRetry: number;
    crawlRetryDelayMs: number;
    schedulerEnabled: boolean;
    categoryUrl?: string;
    category: string;
    productName?: string;
    productUrl?: string;
};

export type ClawCostcoEnv = Partial<NodeJS.ProcessEnv> & {
    DATABASE_URL_COSTCO?: string;
    HEADLESS_COSTCO?: string;
    TIMEOUT_COSTCO?: string;
    CRAWL_INTERVAL_COSTCO?: string;
    CRAWL_RETRY_COSTCO?: string;
    CRAWL_RETRY_DELAY_COSTCO?: string;
    SCHEDULER_ENABLED_COSTCO?: string;
    CATEGORY_URL_COSTCO?: string;
    CATEGORY_COSTCO?: string;
    PRODUCT_NAME_COSTCO?: string;
    PRODUCT_URL_COSTCO?: string;
};

dotenv.config({
    path: COSTCO_ENV_FILE,
});

export function parseCrawlIntervalMs(value: string): number {
    const match = value.trim().match(/^(\d+)(m|h|d)$/i);

    if (!match) {
        throw new Error(
            `Invalid CRAWL_INTERVAL_COSTCO "${value}". Use values like 30m, 12h, or 1d.`
        );
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const unitMs: Record<string, number> = {
        m: 60_000,
        h: 3_600_000,
        d: 86_400_000,
    };

    return amount * unitMs[unit];
}

export function createClawCostcoConfig(env: ClawCostcoEnv = process.env): ClawCostcoConfig {
    const databaseUrl = env.DATABASE_URL_COSTCO;

    if (!databaseUrl) {
        throw new Error('Missing DATABASE_URL_COSTCO');
    }

    const crawlInterval = env.CRAWL_INTERVAL_COSTCO || '24h';

    return {
        databaseUrl,
        headless: (env.HEADLESS_COSTCO || 'true').toLowerCase() !== 'false',
        timeoutMs: Number(env.TIMEOUT_COSTCO || 30_000),
        crawlInterval,
        crawlIntervalMs: parseCrawlIntervalMs(crawlInterval),
        crawlRetry: Number(env.CRAWL_RETRY_COSTCO || 2),
        crawlRetryDelayMs: Number(env.CRAWL_RETRY_DELAY_COSTCO || 1_000),
        schedulerEnabled: (env.SCHEDULER_ENABLED_COSTCO || 'true').toLowerCase() !== 'false',
        categoryUrl: env.CATEGORY_URL_COSTCO,
        category: env.CATEGORY_COSTCO || 'costco',
        productName: env.PRODUCT_NAME_COSTCO,
        productUrl: env.PRODUCT_URL_COSTCO,
    };
}
