import { test, expect } from '@playwright/test';
import { OpenClawAgent, wrapCostcoAgent } from '../../../claw-data-costco/open-claw-agent';
import { CostcoCrawlerAgent } from '../../../claw-costco/agent/costco-crawler-agent';
import { createClawCostcoConfig } from '../../../claw-costco/config/env';

const config = createClawCostcoConfig();

test.describe('@claw-data-costco @e2e @live', () => {
    test('OpenClawAgent with real CostcoCrawlerAgent returns at least one product', async () => {
        test.skip(
            process.env.CLAW_DATA_COSTCO_ENABLED !== 'true',
            'CLAW_DATA_COSTCO_ENABLED is not "true"'
        );

        const costcoAgent = new CostcoCrawlerAgent();
        const openAgent = new OpenClawAgent();
        openAgent.register(wrapCostcoAgent(costcoAgent));

        const result = await openAgent.runCrawl({
            store: 'costco',
            source: 'manual',
            categoryUrl: config.categoryUrl,
            category: config.category,
            productName: config.productName,
            productUrl: config.productUrl,
        });

        expect(result.store).toBe('costco');
        expect(result.source).toBe('manual');
        expect(result.products.length).toBeGreaterThan(0);

        for (const product of result.products) {
            expect(product.sku).toBeTruthy();
            expect(product.name).toBeTruthy();
            expect(product.url).toBeTruthy();
            expect(product.price).toBeGreaterThanOrEqual(0);
        }
    });
});