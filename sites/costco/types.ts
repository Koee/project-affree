export interface CostcoSelectors {
    productCard: string;
    name: string;
    price: string;
    sku: string;
    image: string;
    productLink: string;
}

export interface CostcoConfig {
    baseUrl: string;
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
}
