import { test, expect } from '@playwright/test';
import {
    createClawCostcoConfig,
    COSTCO_ENV_FILE,
    parseCrawlIntervalMs,
} from '../../../claw-costco/config/env';

test.describe('@claw-costco config', () => {
    test('should keep Costco crawler env isolated in its own file', () => {
        expect(COSTCO_ENV_FILE).toBe('.env.costco');
    });

    test('should read Costco crawler env values with typed defaults', () => {
        const config = createClawCostcoConfig({
            DATABASE_URL_COSTCO: 'postgresql://user:pass@localhost:5432/costco',
            HEADLESS_COSTCO: 'false',
            TIMEOUT_COSTCO: '45000',
            CRAWL_INTERVAL_COSTCO: '12h',
            CRAWL_RETRY_COSTCO: '3',
            CRAWL_RETRY_DELAY_COSTCO: '2500',
            SCHEDULER_ENABLED_COSTCO: 'false',
            CATEGORY_URL_COSTCO: 'https://www.costco.com/pantry.html',
            CATEGORY_COSTCO: 'pantry',
            PRODUCT_NAME_COSTCO: 'espoir Water Splash Sun Serum Sunscreen SPF 50, 1.69 fl oz, 2-pack',
            PRODUCT_URL_COSTCO: 'https://www.costco.com/espoir-water-splash-sun-serum-sunscreen-spf-50-169-fl-oz-2-pack.product.4000424213.html',
        });

        expect(config.databaseUrl).toBe('postgresql://user:pass@localhost:5432/costco');
        expect(config.headless).toBeFalsy();
        expect(config.timeoutMs).toBe(45_000);
        expect(config.crawlInterval).toBe('12h');
        expect(config.crawlIntervalMs).toBe(43_200_000);
        expect(config.crawlRetry).toBe(3);
        expect(config.crawlRetryDelayMs).toBe(2_500);
        expect(config.schedulerEnabled).toBeFalsy();
        expect(config.categoryUrl).toBe('https://www.costco.com/pantry.html');
        expect(config.category).toBe('pantry');
        expect(config.productName).toBe(
            'espoir Water Splash Sun Serum Sunscreen SPF 50, 1.69 fl oz, 2-pack'
        );
        expect(config.productUrl).toBe(
            'https://www.costco.com/espoir-water-splash-sun-serum-sunscreen-spf-50-169-fl-oz-2-pack.product.4000424213.html'
        );
    });

    test('should default Costco crawler runtime values when optional env is missing', () => {
        const config = createClawCostcoConfig({
            DATABASE_URL_COSTCO: 'postgresql://user:pass@localhost:5432/costco',
        });

        expect(config.headless).toBeTruthy();
        expect(config.timeoutMs).toBe(30_000);
        expect(config.crawlInterval).toBe('24h');
        expect(config.crawlIntervalMs).toBe(86_400_000);
        expect(config.crawlRetry).toBe(2);
        expect(config.crawlRetryDelayMs).toBe(1_000);
        expect(config.schedulerEnabled).toBeTruthy();
        expect(config.categoryUrl).toBeUndefined();
        expect(config.category).toBe('costco');
    });

    test('should parse supported crawl interval units', () => {
        expect(parseCrawlIntervalMs('30m')).toBe(1_800_000);
        expect(parseCrawlIntervalMs('2h')).toBe(7_200_000);
        expect(parseCrawlIntervalMs('1d')).toBe(86_400_000);
    });
});
