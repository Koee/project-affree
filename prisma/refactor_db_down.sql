-- Drop generic unique constraints and indexes
DROP INDEX "Product_store_sku_key";
DROP INDEX "Product_store_idx";

DROP INDEX "PriceHistory_store_sku_idx";
DROP INDEX "PriceHistory_capturedAt_idx";
DROP INDEX "PriceHistory_crawlRunId_idx";

DROP INDEX "CrawlRun_store_idx";

-- Drop store columns
ALTER TABLE "Product" DROP COLUMN "store";
ALTER TABLE "PriceHistory" DROP COLUMN "store";
ALTER TABLE "CrawlRun" DROP COLUMN "store";

-- Rename tables back
ALTER TABLE "Product" RENAME TO "CostcoProduct";
ALTER TABLE "PriceHistory" RENAME TO "CostcoPriceHistory";
ALTER TABLE "CrawlRun" RENAME TO "CostcoCrawlRun";

-- Rename PK constraints back
ALTER TABLE "CostcoProduct" RENAME CONSTRAINT "Product_pkey" TO "CostcoProduct_pkey";
ALTER TABLE "CostcoPriceHistory" RENAME CONSTRAINT "PriceHistory_pkey" TO "CostcoPriceHistory_pkey";
ALTER TABLE "CostcoCrawlRun" RENAME CONSTRAINT "CrawlRun_pkey" TO "CostcoCrawlRun_pkey";

-- Re-create old indexes and unique constraint
CREATE UNIQUE INDEX "CostcoProduct_sku_key" ON "CostcoProduct"("sku");
CREATE INDEX "CostcoPriceHistory_sku_idx" ON "CostcoPriceHistory"("sku");
CREATE INDEX "CostcoPriceHistory_capturedAt_idx" ON "CostcoPriceHistory"("capturedAt");
CREATE INDEX "CostcoPriceHistory_crawlRunId_idx" ON "CostcoPriceHistory"("crawlRunId");
