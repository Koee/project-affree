export interface PremiumSelectors {
    productCard: string;
    name: string;
    price: string;
    sku: string;
    image: string;
    productLink: string;
}

export interface PremiumConfig {
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
