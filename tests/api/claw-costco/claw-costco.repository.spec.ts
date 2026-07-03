import { expect, test } from '@playwright/test';
import { PrismaProductRepository } from '../../../claw-costco/db/repositories';
import type { Product } from '../../../claw-costco/types/product';

test.describe('@claw-costco product repository', () => {
    test('should upsert Costco products by SKU', async () => {
        const prisma = new RecordingPrismaClient();
        const repository = new PrismaProductRepository(prisma as never);
        const product: Product = {
            sku: '4000424213',
            name: 'espoir Water Splash Sun Serum Sunscreen SPF 50, 1.69 fl oz, 2-pack',
            price: 29.99,
            category: 'sun-care',
            image: 'https://cdn.costco.com/espoir-water-splash-sun-serum.jpg',
            url: 'https://www.costco.com/espoir-water-splash-sun-serum-sunscreen-spf-50-169-fl-oz-2-pack.product.4000424213.html',
        };

        await repository.upsertMany([product], {
            store: 'costco',
            source: 'manual',
            capturedAt: new Date(),
        });

        expect(prisma.product.upserts).toEqual([
            {
                where: {
                    store_sku: {
                        store: 'costco',
                        sku: '4000424213',
                    },
                },
                create: {
                    store: 'costco',
                    sku: '4000424213',
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
            },
        ]);
    });

    test('should append price history when upserting products', async () => {
        const prisma = new RecordingPrismaClient();
        const repository = new PrismaProductRepository(prisma as never);
        const capturedAt = new Date('2026-07-01T09:00:00.000Z');
        const product: Product = {
            sku: '4000424213',
            name: 'espoir Water Splash Sun Serum Sunscreen SPF 50, 1.69 fl oz, 2-pack',
            price: 27.99,
            category: 'sun-care',
            image: 'https://cdn.costco.com/espoir-water-splash-sun-serum.jpg',
            url: 'https://www.costco.com/espoir-water-splash-sun-serum-sunscreen-spf-50-169-fl-oz-2-pack.product.4000424213.html',
        };

        await repository.upsertMany([product], {
            store: 'costco',
            source: 'manual',
            crawlRunId: 'crawl-run-1',
            capturedAt,
        });

        expect(prisma.priceHistory.creates).toEqual([
            {
                data: {
                    store: 'costco',
                    sku: '4000424213',
                    price: 27.99,
                    currency: 'USD',
                    source: 'manual',
                    crawlRunId: 'crawl-run-1',
                    capturedAt,
                },
            },
        ]);
    });
});

class RecordingPrismaClient {
    readonly product = {
        upserts: [] as unknown[],
        upsert: async (input: unknown) => {
            this.product.upserts.push(input);
        },
    };

    readonly priceHistory = {
        creates: [] as unknown[],
        create: async (input: unknown) => {
            this.priceHistory.creates.push(input);
        },
    };
}
