import type { PrismaClient } from '@prisma/client';
import type { Product } from '../types/product';
import type { RawPayloadDTO } from '../types/dto';
import type { RawPayloadRepository } from './repository-interfaces';
import { prisma } from './prisma-client';


export type CrawlRunStatus = 'running' | 'success' | 'failed';

export type StartedCrawlRun = {
    id: string;
};

export type ProductUpsertContext = {
    store: string;
    source: string;
    crawlRunId?: string;
    capturedAt: Date;
};

export type RunView = {
    id: string;
    store: string;
    source: string;
    status: string;
    productCount: number;
    errorMessage: string | null;
    startedAt: string;
    finishedAt: string | null;
};

export type ProductView = Product & {
    updatedAt: string;
};

export type PriceHistoryView = {
    sku: string;
    price: number;
    currency: string;
    source: string;
    crawlRunId: string | null;
    capturedAt: string;
};

export type CrawlerStatus = {
    lastRun: RunView | null;
    productCount: number;
    lastError: string | null;
};

export type PriceSignalSource = {
    sku: string;
    prices: PriceHistoryView[];
};

export interface ProductRepository {
    upsertMany(products: Product[], context: ProductUpsertContext): Promise<void>;
}

export interface CrawlRunRepository {
    startRun(input: {
        store: string;
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

export interface ReadRepository {
    listRuns(store: string, limit: number): Promise<RunView[]>;
    listProducts(store: string, limit: number): Promise<ProductView[]>;
    listPriceHistory(store: string, sku: string, limit: number): Promise<PriceHistoryView[]>;
    getStatus(store: string): Promise<CrawlerStatus>;
    listLatestPriceSignals(store: string, limit?: number): Promise<PriceSignalSource[]>;
}

export class PrismaProductRepository implements ProductRepository {
    constructor(private readonly client: PrismaClient = prisma) {}

    async upsertMany(products: Product[], context: ProductUpsertContext): Promise<void> {
        for (const product of products) {
            await this.client.product.upsert({
                where: {
                    store_sku: {
                        store: context.store,
                        sku: product.sku,
                    },
                },
                create: {
                    store: context.store,
                    sku: product.sku,
                    name: product.name,
                    price: product.price,
                    category: product.category,
                    image: product.image,
                    url: product.url,
                },
                update: {
                    name: product.name,
                    price: product.price,
                    category: product.category,
                    image: product.image,
                    url: product.url,
                },
            });

            await this.client.priceHistory.create({
                data: {
                    store: context.store,
                    sku: product.sku,
                    price: product.price,
                    currency: 'USD',
                    source: context.source,
                    crawlRunId: context.crawlRunId,
                    capturedAt: context.capturedAt,
                },
            });
        }
    }
}

export class PrismaCrawlRunRepository implements CrawlRunRepository {
    constructor(private readonly client: PrismaClient = prisma) {}

    async startRun(input: { store: string; source: string; startedAt: Date }): Promise<StartedCrawlRun> {
        return this.client.crawlRun.create({
            data: {
                store: input.store,
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
        await this.client.crawlRun.update({
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

export class PrismaReadRepository implements ReadRepository {
    constructor(private readonly client: PrismaClient = prisma) {}

    async listRuns(store: string, limit: number): Promise<RunView[]> {
        const runs = await this.client.crawlRun.findMany({
            where: {
                store,
            },
            orderBy: {
                startedAt: 'desc',
            },
            take: limit,
        });

        return runs.map(toRunView);
    }

    async listProducts(store: string, limit: number): Promise<ProductView[]> {
        const products = await this.client.product.findMany({
            where: {
                store,
            },
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

    async listPriceHistory(store: string, sku: string, limit: number): Promise<PriceHistoryView[]> {
        const history = await this.client.priceHistory.findMany({
            where: {
                store,
                sku,
            },
            orderBy: {
                capturedAt: 'desc',
            },
            take: limit,
        });

        return history.map(toPriceHistoryView);
    }

    async getStatus(store: string): Promise<CrawlerStatus> {
        const [lastRun, productCount, lastFailedRun] = await Promise.all([
            this.client.crawlRun.findFirst({
                where: {
                    store,
                },
                orderBy: {
                    startedAt: 'desc',
                },
            }),
            this.client.product.count({
                where: {
                    store,
                },
            }),
            this.client.crawlRun.findFirst({
                where: {
                    store,
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

    async listLatestPriceSignals(store: string, limit = 10): Promise<PriceSignalSource[]> {
        const products = await this.client.product.findMany({
            where: {
                store,
            },
            orderBy: {
                updatedAt: 'desc',
            },
            take: limit,
            select: {
                sku: true,
            },
        });

        const signals: PriceSignalSource[] = [];

        for (const product of products) {
            const prices = await this.listPriceHistory(store, product.sku, 2);
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
    store: string;
    source: string;
    status: string;
    productCount: number;
    errorMessage: string | null;
    startedAt: Date;
    finishedAt: Date | null;
}): RunView {
    return {
        id: run.id,
        store: run.store,
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
}): PriceHistoryView {
    return {
        sku: history.sku,
        price: Number(history.price),
        currency: history.currency,
        source: history.source,
        crawlRunId: history.crawlRunId,
        capturedAt: history.capturedAt.toISOString(),
    };
}

export class PrismaRawPayloadRepository implements RawPayloadRepository {
    constructor(private readonly client: PrismaClient = prisma) {}

    async save(rawPayload: RawPayloadDTO): Promise<void> {
        await this.client.rawPayload.create({
            data: {
                store: rawPayload.store,
                sku: rawPayload.sku,
                payload: rawPayload.payload,
                crawlRunId: rawPayload.crawlRunId || null,
            },
        });
    }

    async findBySku(store: string, sku: string): Promise<RawPayloadDTO | null> {
        const record = await this.client.rawPayload.findFirst({
            where: { store, sku },
            orderBy: { createdAt: 'desc' },
        });

        if (!record) {
            return null;
        }

        return {
            id: record.id,
            store: record.store,
            sku: record.sku,
            payload: record.payload,
            crawlRunId: record.crawlRunId || undefined,
            createdAt: record.createdAt,
        };
    }
}

