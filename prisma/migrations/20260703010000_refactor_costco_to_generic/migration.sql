-- Rename tables
ALTER TABLE "CostcoProduct" RENAME TO "Product";
ALTER TABLE "CostcoPriceHistory" RENAME TO "PriceHistory";
ALTER TABLE "CostcoCrawlRun" RENAME TO "CrawlRun";

-- Rename PK constraints
ALTER TABLE "Product" RENAME CONSTRAINT "CostcoProduct_pkey" TO "Product_pkey";
ALTER TABLE "PriceHistory" RENAME CONSTRAINT "CostcoPriceHistory_pkey" TO "PriceHistory_pkey";
ALTER TABLE "CrawlRun" RENAME CONSTRAINT "CostcoCrawlRun_pkey" TO "CrawlRun_pkey";

-- Add store columns with default 'costco'
ALTER TABLE "Product" ADD COLUMN "store" TEXT NOT NULL DEFAULT 'costco';
ALTER TABLE "PriceHistory" ADD COLUMN "store" TEXT NOT NULL DEFAULT 'costco';
ALTER TABLE "CrawlRun" ADD COLUMN "store" TEXT NOT NULL DEFAULT 'costco';

-- Drop old unique constraint and indexes
DROP INDEX "CostcoProduct_sku_key";
DROP INDEX "CostcoPriceHistory_sku_idx";
DROP INDEX "CostcoPriceHistory_capturedAt_idx";
DROP INDEX "CostcoPriceHistory_crawlRunId_idx";

-- Create generic unique constraints and indexes
CREATE UNIQUE INDEX "Product_store_sku_key" ON "Product"("store", "sku");
CREATE INDEX "Product_store_idx" ON "Product"("store");

CREATE INDEX "PriceHistory_store_sku_idx" ON "PriceHistory"("store", "sku");
CREATE INDEX "PriceHistory_capturedAt_idx" ON "PriceHistory"("capturedAt");
CREATE INDEX "PriceHistory_crawlRunId_idx" ON "PriceHistory"("crawlRunId");

CREATE INDEX "CrawlRun_store_idx" ON "CrawlRun"("store");
