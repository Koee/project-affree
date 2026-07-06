/**
 * Data Transfer Objects (DTOs) đại diện cho các thực thể dữ liệu trong Storage Layer.
 * Được ánh xạ từ Prisma Schema hiện tại nhưng tách biệt khỏi Prisma client.
 */

export interface ProductDTO {
    id?: string;
    store: string;
    sku: string;
    name: string;
    price: number;
    category: string;
    image: string;
    url: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PriceHistoryDTO {
    id?: string;
    store: string;
    sku: string;
    price: number;
    currency?: string;
    source: string;
    crawlRunId?: string | null;
    capturedAt: Date;
    createdAt?: Date;
}

export interface CrawlRunDTO {
    id?: string;
    store: string;
    source: string;
    status: string;
    productCount?: number;
    errorMessage?: string | null;
    startedAt: Date;
    finishedAt?: Date | null;
    createdAt?: Date;
}

export interface RawPayloadDTO {
    id?: string;
    store: string;
    sku: string;
    payload: Record<string, any>;
    crawlRunId?: string | null;
    createdAt?: Date;
}
