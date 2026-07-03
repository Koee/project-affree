import type { ProductDTO, PriceDTO, RawPayloadDTO } from '../types/dto';
import type { CrawlRunStatus, StartedCrawlRun } from './repositories';

export interface ProductRepository {
    upsertMany(
        products: ProductDTO[],
        context: {
            store: string;
            source: string;
            crawlRunId?: string;
            capturedAt: Date;
        }
    ): Promise<void>;
    findById(id: string): Promise<ProductDTO | null>;
    findBySku(store: string, sku: string): Promise<ProductDTO | null>;
}

export interface PriceRepository {
    save(price: PriceDTO): Promise<void>;
    listHistory(store: string, sku: string, limit: number): Promise<PriceDTO[]>;
}

export interface RunRepository {
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

export interface LogRepository {
    info(message: string, meta?: any): void;
    error(message: string, error?: any, meta?: any): void;
    warn(message: string, meta?: any): void;
}

export interface RawPayloadRepository {
    save(rawPayload: RawPayloadDTO): Promise<void>;
    findBySku(store: string, sku: string): Promise<RawPayloadDTO | null>;
}

