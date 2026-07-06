export interface WalmartSelectors {
    productCard: string;
    name: string;
    price: string;
    sku: string;
    image: string;
    productLink: string;
}

export interface WalmartConfig {
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
    stealth: {
        userAgent: string;
        viewport: { width: number; height: number };
        extraHeaders: Record<string, string>;
        randomDelayMinMs: number;
        randomDelayMaxMs: number;
    };
}
