CREATE TABLE "CostcoProduct" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostcoProduct_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CostcoCrawlRun" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "productCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostcoCrawlRun_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CostcoProduct_sku_key" ON "CostcoProduct"("sku");
