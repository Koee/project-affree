import type { ReadRepository } from '../db/repositories';

export type CostcoPriceSignal = {
    sku: string;
    latestPrice: number;
    previousPrice: number;
    change: number;
    direction: 'up' | 'down' | 'flat';
};

export type CostcoInsightSummary = {
    store: 'costco';
    generatedBy: 'openclaw-ready';
    productCount: number;
    lastRunStatus: string | null;
    lastRunFinishedAt: string | null;
    lastError: string | null;
    priceSignals: CostcoPriceSignal[];
};

export class CostcoInsightAgent {
    constructor(private readonly readRepository: ReadRepository) {}

    async buildSummary(): Promise<CostcoInsightSummary> {
        const [status, priceSignalSources] = await Promise.all([
            this.readRepository.getStatus('costco'),
            this.readRepository.listLatestPriceSignals('costco', 10),
        ]);

        return {
            store: 'costco',
            generatedBy: 'openclaw-ready',
            productCount: status.productCount,
            lastRunStatus: status.lastRun?.status || null,
            lastRunFinishedAt: status.lastRun?.finishedAt || null,
            lastError: status.lastError,
            priceSignals: priceSignalSources
                .map(source => {
                    const [latest, previous] = source.prices;

                    if (!latest || !previous) {
                        return undefined;
                    }

                    const change = roundPrice(latest.price - previous.price);

                    return {
                        sku: source.sku,
                        latestPrice: latest.price,
                        previousPrice: previous.price,
                        change,
                        direction: priceDirection(change),
                    };
                })
                .filter((signal): signal is CostcoPriceSignal => Boolean(signal)),
        };
    }
}

function roundPrice(value: number): number {
    return Math.round(value * 100) / 100;
}

function priceDirection(change: number): CostcoPriceSignal['direction'] {
    if (change > 0) {
        return 'up';
    }

    if (change < 0) {
        return 'down';
    }

    return 'flat';
}
