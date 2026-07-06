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

export interface CategoryDTO {
    name: string;
    url?: string;
    slug?: string;
}

export interface PriceDTO {
    price: number;
    currency?: string;
    sku: string;
    store: string;
    capturedAt: Date;
}

export interface StoreDTO {
    id: string;
    name: string;
    baseUrl: string;
    enabled: boolean;
}

export interface RawPayloadDTO {
    id?: string;
    store: string;
    sku: string;
    payload: any;
    crawlRunId?: string;
    createdAt?: Date;
}

