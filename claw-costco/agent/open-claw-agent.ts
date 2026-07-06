import type {
    OpenClawCrawlInput,
    OpenClawCrawlResult,
    CrawlerRegistration,
    StoreName,
} from './open-claw-types';
import type { CrawlAgent, CrawlJobInput } from './types';

import { WalmartCrawlerAgent } from './walmart-crawler-agent';

export class OpenClawAgent {
    private readonly crawlers = new Map<StoreName, CrawlerRegistration>();

    register(registration: CrawlerRegistration): void {
        this.crawlers.set(registration.store, registration);
    }

    listRegisteredStores(): StoreName[] {
        return [...this.crawlers.keys()];
    }

    async runCrawl(input: OpenClawCrawlInput): Promise<OpenClawCrawlResult> {
        const crawler = this.crawlers.get(input.store);

        if (!crawler) {
            throw new Error(`No crawler registered for store "${input.store}"`);
        }

        return crawler.crawl(input);
    }
}

export function wrapCostcoAgent(agent: CrawlAgent): CrawlerRegistration {
    return {
        store: 'costco',
        crawl: (input) =>
            agent.runCostcoCrawl(input as CrawlJobInput) as Promise<OpenClawCrawlResult>,
    };
}

export function wrapWalmartAgent(agent: WalmartCrawlerAgent): CrawlerRegistration {
    return {
        store: 'walmart',
        crawl: (input) =>
            agent.runWalmartCrawl(input as CrawlJobInput) as Promise<OpenClawCrawlResult>,
    };
}
