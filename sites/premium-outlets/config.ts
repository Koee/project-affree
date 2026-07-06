import dotenv from 'dotenv';
import type { PremiumConfig } from './types';
import { endpoints } from './endpoints';

dotenv.config({
    path: '.env.premium-outlets',
});

function parseCrawlIntervalMs(value: string): number {
    const match = value.trim().match(/^(\d+)(m|h|d)$/i);

    if (!match) {
        throw new Error(
            `Invalid CRAWL_INTERVAL_PREMIUM_OUTLETS "${value}". Use values like 30m, 12h, or 1d.`
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

const crawlInterval = process.env.CRAWL_INTERVAL_PREMIUM_OUTLETS || '24h';

export const config: PremiumConfig = {
    baseUrl: process.env.BASE_URL_PREMIUM_OUTLETS || endpoints.baseUrl,
    headless: (process.env.HEADLESS_PREMIUM_OUTLETS || 'true').toLowerCase() !== 'false',
    timeoutMs: Number(process.env.TIMEOUT_PREMIUM_OUTLETS || 30_000),
    crawlInterval,
    crawlIntervalMs: parseCrawlIntervalMs(crawlInterval),
    crawlRetry: Number(process.env.CRAWL_RETRY_PREMIUM_OUTLETS || 2),
    crawlRetryDelayMs: Number(process.env.CRAWL_RETRY_DELAY_PREMIUM_OUTLETS || 1_000),
    schedulerEnabled: (process.env.SCHEDULER_ENABLED_PREMIUM_OUTLETS || 'true').toLowerCase() !== 'false',
    categoryUrl: process.env.CATEGORY_URL_PREMIUM_OUTLETS,
    category: process.env.CATEGORY_PREMIUM_OUTLETS || 'premium-outlets',
    productName: process.env.PRODUCT_NAME_PREMIUM_OUTLETS,
    productUrl: process.env.PRODUCT_URL_PREMIUM_OUTLETS,
};
