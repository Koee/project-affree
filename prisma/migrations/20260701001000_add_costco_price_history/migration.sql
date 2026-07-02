CREATE TABLE "CostcoPriceHistory" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "source" TEXT NOT NULL,
    "crawlRunId" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostcoPriceHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CostcoPriceHistory_sku_idx" ON "CostcoPriceHistory"("sku");
CREATE INDEX "CostcoPriceHistory_capturedAt_idx" ON "CostcoPriceHistory"("capturedAt");
CREATE INDEX "CostcoPriceHistory_crawlRunId_idx" ON "CostcoPriceHistory"("crawlRunId");
