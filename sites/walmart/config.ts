import dotenv from 'dotenv';
import type { WalmartConfig } from './types';
import { endpoints } from './endpoints';

dotenv.config({
    path: '.env.walmart',
});

function parseCrawlIntervalMs(value: string): number {
    const match = value.trim().match(/^(\d+)(m|h|d)$/i);

    if (!match) {
        throw new Error(
            `Invalid CRAWL_INTERVAL_WALMART "${value}". Use values like 30m, 12h, or 1d.`
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

const crawlInterval = process.env.CRAWL_INTERVAL_WALMART || '24h';

export const config: WalmartConfig = {
    baseUrl: process.env.BASE_URL_WALMART || endpoints.baseUrl,
    headless: (process.env.HEADLESS_WALMART || 'true').toLowerCase() !== 'false',
    timeoutMs: Number(process.env.TIMEOUT_WALMART || 30_000),
    crawlInterval,
    crawlIntervalMs: parseCrawlIntervalMs(crawlInterval),
    crawlRetry: Number(process.env.CRAWL_RETRY_WALMART || 2),
    crawlRetryDelayMs: Number(process.env.CRAWL_RETRY_DELAY_WALMART || 1_000),
    schedulerEnabled: (process.env.SCHEDULER_ENABLED_WALMART || 'true').toLowerCase() !== 'false',
    categoryUrl: process.env.CATEGORY_URL_WALMART,
    category: process.env.CATEGORY_WALMART || 'walmart',
    productName: process.env.PRODUCT_NAME_WALMART,
    productUrl: process.env.PRODUCT_URL_WALMART,
    stealth: {
        userAgent: process.env.STEALTH_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: {
            width: Number(process.env.STEALTH_VIEWPORT_WIDTH || 1280),
            height: Number(process.env.STEALTH_VIEWPORT_HEIGHT || 720),
        },
        extraHeaders: {
            'Accept-Language': process.env.STEALTH_ACCEPT_LANGUAGE || 'en-US,en;q=0.9',
            'referer': 'https://www.google.com/',
        },
        randomDelayMinMs: Number(process.env.STEALTH_RANDOM_DELAY_MIN || 1000),
        randomDelayMaxMs: Number(process.env.STEALTH_RANDOM_DELAY_MAX || 4000),
    },
};
