import type { PrismaClient } from '@prisma/client';
import type { Product } from '../types/product';
import { prisma } from './prisma-client';

export type CrawlRunStatus = 'running' | 'success' | 'failed';

export type StartedCrawlRun = {
    id: string;
};

export type ProductUpsertContext = {
    source: string;
    crawlRunId?: string;
    capturedAt: Date;
};

export type CostcoRunView = {
    id: string;
    source: string;
    status: string;
    productCount: number;
    errorMessage: string | null;
    startedAt: string;
    finishedAt: string | null;
};

export type CostcoProductView = Product & {
    updatedAt: string;
};

export type CostcoPriceHistoryView = {
    sku: string;
    price: number;
    currency: string;
    source: string;
    crawlRunId: string | null;
    capturedAt: string;
};

export type CostcoCrawlerStatus = {
    lastRun: CostcoRunView | null;
    productCount: number;
    lastError: string | null;
};

export type CostcoPriceSignalSource = {
    sku: string;
    prices: CostcoPriceHistoryView[];
};

export interface CostcoProductRepository {
    upsertMany(products: Product[], context?: ProductUpsertContext): Promise<void>;
}

export interface CostcoCrawlRunRepository {
    startRun(input: {
        source: string;
        startedAt: Date;
    }): Promise<StartedCrawlRun>;
    completeRun(input: {
        id: string;
        status: CrawlRunStatus;
        productCount: number;
        errorMessage?: string;
        finishedAt: Date;
    }): Promise<void>;
}

export interface CostcoReadRepository {
    listRuns(limit: number): Promise<CostcoRunView[]>;
    listProducts(limit: number): Promise<CostcoProductView[]>;
    listPriceHistory(sku: string, limit: number): Promise<CostcoPriceHistoryView[]>;
    getStatus(): Promise<CostcoCrawlerStatus>;
    listLatestPriceSignals(limit?: number): Promise<CostcoPriceSignalSource[]>;
}

export class PrismaCostcoProductRepository implements CostcoProductRepository {
    constructor(private readonly client: PrismaClient = prisma) {}

    async upsertMany(products: Product[], context?: ProductUpsertContext): Promise<void> {
        for (const product of products) {
            await this.client.costcoProduct.upsert({
                where: {
                    sku: product.sku,
                },
                create: product,
                update: {
                    name: product.name,
                    price: product.price,
                    category: product.category,
                    image: product.image,
                    url: product.url,
                },
            });

            await this.client.costcoPriceHistory.create({
                data: {
                    sku: product.sku,
                    price: product.price,
                    currency: 'USD',
                    source: context?.source || 'unknown',
                    crawlRunId: context?.crawlRunId,
                    capturedAt: context?.capturedAt || new Date(),
                },
            });
        }
    }
}

export class PrismaCostcoCrawlRunRepository implements CostcoCrawlRunRepository {
    constructor(private readonly client: PrismaClient = prisma) {}

    async startRun(input: { source: string; startedAt: Date }): Promise<StartedCrawlRun> {
        return this.client.costcoCrawlRun.create({
            data: {
                source: input.source,
                status: 'running',
                productCount: 0,
                startedAt: input.startedAt,
            },
            select: {
                id: true,
            },
        });
    }

    async completeRun(input: {
        id: string;
        status: CrawlRunStatus;
        productCount: number;
        errorMessage?: string;
        finishedAt: Date;
    }): Promise<void> {
        await this.client.costcoCrawlRun.update({
            where: {
                id: input.id,
            },
            data: {
                status: input.status,
                productCount: input.productCount,
                errorMessage: input.errorMessage,
                finishedAt: input.finishedAt,
            },
        });
    }
}

export class PrismaCostcoReadRepository implements CostcoReadRepository {
    constructor(private readonly client: PrismaClient = prisma) {}

    async listRuns(limit: number): Promise<CostcoRunView[]> {
        const runs = await this.client.costcoCrawlRun.findMany({
            orderBy: {
                startedAt: 'desc',
            },
            take: limit,
        });

        return runs.map(toRunView);
    }

    async listProducts(limit: number): Promise<CostcoProductView[]> {
        const products = await this.client.costcoProduct.findMany({
            orderBy: {
                updatedAt: 'desc',
            },
            take: limit,
        });

        return products.map(product => ({
            sku: product.sku,
            name: product.name,
            price: Number(product.price),
            category: product.category,
            image: product.image,
            url: product.url,
            updatedAt: product.updatedAt.toISOString(),
        }));
    }

    async listPriceHistory(sku: string, limit: number): Promise<CostcoPriceHistoryView[]> {
        const history = await this.client.costcoPriceHistory.findMany({
            where: {
                sku,
            },
            orderBy: {
                capturedAt: 'desc',
            },
            take: limit,
        });

        return history.map(toPriceHistoryView);
    }

    async getStatus(): Promise<CostcoCrawlerStatus> {
        const [lastRun, productCount, lastFailedRun] = await Promise.all([
            this.client.costcoCrawlRun.findFirst({
                orderBy: {
                    startedAt: 'desc',
                },
            }),
            this.client.costcoProduct.count(),
            this.client.costcoCrawlRun.findFirst({
                where: {
                    status: 'failed',
                },
                orderBy: {
                    startedAt: 'desc',
                },
            }),
        ]);

        return {
            lastRun: lastRun ? toRunView(lastRun) : null,
            productCount,
            lastError: lastFailedRun?.errorMessage || null,
        };
    }

    async listLatestPriceSignals(limit = 10): Promise<CostcoPriceSignalSource[]> {
        const products = await this.client.costcoProduct.findMany({
            orderBy: {
                updatedAt: 'desc',
            },
            take: limit,
            select: {
                sku: true,
            },
        });

        const signals: CostcoPriceSignalSource[] = [];

        for (const product of products) {
            const prices = await this.listPriceHistory(product.sku, 2);
            signals.push({
                sku: product.sku,
                prices,
            });
        }

        return signals;
    }
}

function toRunView(run: {
    id: string;
    source: string;
    status: string;
    productCount: number;
    errorMessage: string | null;
    startedAt: Date;
    finishedAt: Date | null;
}): CostcoRunView {
    return {
        id: run.id,
        source: run.source,
        status: run.status,
        productCount: run.productCount,
        errorMessage: run.errorMessage,
        startedAt: run.startedAt.toISOString(),
        finishedAt: run.finishedAt?.toISOString() || null,
    };
}

function toPriceHistoryView(history: {
    sku: string;
    price: unknown;
    currency: string;
    source: string;
    crawlRunId: string | null;
    capturedAt: Date;
}): CostcoPriceHistoryView {
    return {
        sku: history.sku,
        price: Number(history.price),
        currency: history.currency,
        source: history.source,
        crawlRunId: history.crawlRunId,
        capturedAt: history.capturedAt.toISOString(),
    };
}
