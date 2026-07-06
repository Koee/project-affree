import dotenv from 'dotenv';
import type { CostcoConfig } from './types';
import { endpoints } from './endpoints';

dotenv.config({
    path: '.env.costco',
});

function parseCrawlIntervalMs(value: string): number {
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

const crawlInterval = process.env.CRAWL_INTERVAL_COSTCO || '24h';

export const config: CostcoConfig = {
    baseUrl: process.env.BASE_URL_COSTCO || endpoints.baseUrl,
    headless: (process.env.HEADLESS_COSTCO || 'true').toLowerCase() !== 'false',
    timeoutMs: Number(process.env.TIMEOUT_COSTCO || 30_000),
    crawlInterval,
    crawlIntervalMs: parseCrawlIntervalMs(crawlInterval),
    crawlRetry: Number(process.env.CRAWL_RETRY_COSTCO || 2),
    crawlRetryDelayMs: Number(process.env.CRAWL_RETRY_DELAY_COSTCO || 1_000),
    schedulerEnabled: (process.env.SCHEDULER_ENABLED_COSTCO || 'true').toLowerCase() !== 'false',
    categoryUrl: process.env.CATEGORY_URL_COSTCO,
    category: process.env.CATEGORY_COSTCO || 'costco',
    productName: process.env.PRODUCT_NAME_COSTCO,
    productUrl: process.env.PRODUCT_URL_COSTCO,
};
