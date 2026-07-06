# Architecture Contract

This document defines the system-wide architecture contracts, data transfer formats, database schemas, API endpoints, and AI Agent interaction boundaries for the clawer-db crawler and QA automation system.

---

## 1. Database Schema Contracts (Prisma)

The persistent database layer stores crawled product info, pricing timelines, and job run metadata across multiple stores.

### `Product` Model
Stores the latest active state of crawled items.
```prisma
model Product {
  id        String   @id @default(cuid())
  store     String   // e.g., 'costco' | 'premium-outlets' | 'walmart'
  sku       String
  name      String
  price     Decimal
  category  String
  image     String
  url       String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([store, sku])
  @@index([store])
}
```

### `PriceHistory` Model
Captures price movement trends over time.
```prisma
model PriceHistory {
  id          String   @id @default(cuid())
  store       String
  sku         String
  price       Decimal
  currency    String   @default("USD")
  source      String   // 'manual' | 'scheduler' | 'openclaw'
  crawlRunId  String?
  capturedAt  DateTime
  createdAt   DateTime @default(now())

  @@index([store, sku])
  @@index([capturedAt])
  @@index([crawlRunId])
}
```

### `CrawlRun` Model
Tracks crawler process execution logs.
```prisma
model CrawlRun {
  id             String   @id @default(cuid())
  store          String
  source         String
  status         String   // 'success' | 'failed' | 'running'
  productCount   Int      @default(0)
  errorMessage   String?
  startedAt      DateTime
  finishedAt     DateTime?
  createdAt      DateTime @default(now())

  @@index([store])
}
```

---

## 2. Crawler & Parser DTO Contracts

To prevent database-layer leakages into the business and presentation logic, all crawlers and parsers communicate via defined Data Transfer Objects (DTOs) rather than direct Prisma entities.

### Crawler Product DTO
All crawlers must produce and return objects adhering to the `Product` interface:
```typescript
export interface Product {
    sku: string;
    name: string;
    price: number;
    category: string;
    image: string;
    url: string;
}
```

### Parser Interface
Parsers extract data from standard web structures.
- **Input**: Playwright `Page` instance + parser options (category context, selectors).
- **Output**: `Promise<Product[]>` containing validated DTO items.

---

## 3. API Routing Contracts

### Crawler Microservice APIs (e.g., `claw-costco`)
Serves as the internal operations controller.
- `GET /health`: Returns service status.
- `POST /claw-costco/crawl`: Triggers a manual crawl run for Costco.
- `GET /claw-costco/runs`: Lists crawl execution histories.
- `GET /claw-costco/products`: Retrieves all active products under Costco.
- `GET /claw-costco/products/:sku/history`: Fetches price history entries for a specific SKU.
- `GET /claw-costco/status`: Provides store status indicators.
- `GET /claw-costco/insights/summary`: Produces automated pricing insights.

### OpenClaw Unified Crawler API
- `POST /claw-data/crawl`: Dynamic dispatcher to any registered store's crawler.
  - **Payload Contract**:
    ```typescript
    {
      store: string; // 'costco' | 'premium-outlets' | 'walmart'
      source: 'manual' | 'scheduler' | 'openclaw';
      limit?: number;
      categoryUrl?: string;
      category?: string;
      productName?: string;
      productUrl?: string;
    }
    ```

### Public Catalog & Compare APIs
- `GET /api/catalog`: Retrieves JSON catalog dataset.
- `GET /api/stores`: Lists configured online store channels.
- `GET /p/{productCode}`: Renders HTML comparison page for the specified product code.
- `GET /nhan/{brandSlug}`: Renders brand slug collection page.
- `POST /api/buyer`: Submits buyer onboarding/authentication details.
- `POST /api/purchases`: Registers order transactions.

---

## 4. OpenClaw Agent Integration Contracts

AI Agents orchestrate crawling schedules and read insights via the OpenClaw registry pattern.

### OpenClaw Registration Interfaces
Individual crawlers register themselves into the coordinator:
```typescript
export type StoreName = 'costco' | 'premium-outlets' | 'walmart' | string;

export type OpenClawCrawlInput = {
    store: StoreName;
    source: 'manual' | 'scheduler' | 'openclaw';
    limit?: number;
    categoryUrl?: string;
    category?: string;
    productName?: string;
    productUrl?: string;
};

export type OpenClawCrawlResult = {
    store: StoreName;
    source: 'manual' | 'scheduler' | 'openclaw';
    runId?: string;
    startedAt: Date;
    finishedAt: Date;
    products: Product[];
};

export interface CrawlerRegistration {
    store: StoreName;
    crawl(input: OpenClawCrawlInput): Promise<OpenClawCrawlResult>;
}
```
Any crawler agent (e.g. Costco Crawler) is adapted using the mapper `wrapCostcoAgent` to register successfully.
