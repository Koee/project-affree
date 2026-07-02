import { test, expect } from '@playwright/test';
import {
    COSTCO_ENV_FILE,
    createClawCostcoConfig,
} from '../../../claw-costco/config/env';
import { parseOpenClawStores } from '../../../claw-data-costco/config/env';

test.describe('@claw-data-costco @config', () => {
    test('COSTCO_ENV_FILE is .env.costco', () => {
        expect(COSTCO_ENV_FILE, 'COSTCO_ENV_FILE constant should be .env.costco').toBe('.env.costco');
    });

    test('createClawCostcoConfig reads DATABASE_URL_COSTCO, HEADLESS_COSTCO, TIMEOUT_COSTCO, CRAWL_INTERVAL_COSTCO', () => {
        const config = createClawCostcoConfig({
            DATABASE_URL_COSTCO: 'postgresql://localhost:5432/test',
            HEADLESS_COSTCO: 'true',
            TIMEOUT_COSTCO: '30000',
            CRAWL_INTERVAL_COSTCO: '24h',
        });

        expect(config.databaseUrl, 'Config should read DATABASE_URL_COSTCO from env').toBe('postgresql://localhost:5432/test');
        expect(config.headless, 'Config should parse HEADLESS_COSTCO=true as boolean true').toBe(true);
        expect(config.timeoutMs, 'Config should parse TIMEOUT_COSTCO as milliseconds').toBe(30_000);
        expect(config.crawlInterval, 'Config should read CRAWL_INTERVAL_COSTCO').toBe('24h');
    });

    test('parseOpenClawStores parses comma-separated store list', () => {
        expect(parseOpenClawStores('costco,amazon'), 'Should parse comma-separated stores into array').toEqual(['costco', 'amazon']);
    });

    test('parseOpenClawStores defaults to costco when undefined', () => {
        expect(parseOpenClawStores(undefined), 'Should default to [costco] when input is undefined').toEqual(['costco']);
    });

    test('parseOpenClawStores handles empty string', () => {
        expect(parseOpenClawStores(''), 'Should default to [costco] when input is empty string').toEqual(['costco']);
    });

    test('parseOpenClawStores trims whitespace', () => {
        expect(parseOpenClawStores(' costco , amazon '), 'Should trim whitespace from each store name').toEqual(['costco', 'amazon']);
    });
});