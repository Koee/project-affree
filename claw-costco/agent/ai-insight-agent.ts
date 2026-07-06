import dotenv from 'dotenv';
import type { Product } from '../types/product';

dotenv.config();

export interface PriceInsight {
    sku: string;
    store: string;
    productName: string;
    currentPrice: number;
    insightSummary: string;
    confidence: number;
    recommendedAction: 'HOLD' | 'PROMOTION' | 'MARKDOWN';
}

export interface AnomalyInsight {
    sku: string;
    store: string;
    productName: string;
    historicalPrices: number[];
    deviationPercent: number;
    isAnomaly: boolean;
    description: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export class AiInsightAgent {
    /**
     * Analyzes pricing data using the Gemini API.
     * Falls back to a local rule-based engine if offline or if no API key is set.
     */
    async analyzePrices(products: Product[]): Promise<PriceInsight[]> {
        if (!products || products.length === 0) {
            return [];
        }

        if (!GEMINI_API_KEY) {
            return this.generateLocalPriceInsights(products);
        }

        try {
            const prompt = `
            Analyze the following products for pricing intelligence.
            Determine if the current price represents a discount, markup, or standard pricing based on standard product names and typical industry values.
            Return a JSON array of objects. Each object must precisely match the following TypeScript interface:
            interface PriceInsight {
                sku: string;
                store: string;
                productName: string;
                currentPrice: number;
                insightSummary: string;
                confidence: number; // between 0.0 and 1.0
                recommendedAction: 'HOLD' | 'PROMOTION' | 'MARKDOWN';
            }

            Products:
            ${JSON.stringify(
                products.map(p => ({
                    sku: p.sku,
                    store: (p as any).store || 'costco',
                    name: p.name,
                    price: p.price,
                    category: p.category,
                })),
                null,
                2
            )}

            Return ONLY the valid raw JSON string. Do not wrap in markdown blocks like \`\`\`json.
            `;

            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: 'application/json',
                    },
                }),
            });

            if (!response.ok) {
                return this.generateLocalPriceInsights(products);
            }

            const data = await response.json();
            const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return JSON.parse(textResult.trim());
        } catch (error) {
            return this.generateLocalPriceInsights(products);
        }
    }

    /**
     * Detects price anomalies in historical data using the Gemini API.
     * Falls back to standard deviation calculation if offline.
     */
    async detectAnomalies(
        sku: string,
        store: string,
        productName: string,
        historicalPrices: number[]
    ): Promise<AnomalyInsight> {
        if (!historicalPrices || historicalPrices.length < 2) {
            return {
                sku,
                store,
                productName,
                historicalPrices,
                deviationPercent: 0,
                isAnomaly: false,
                description: 'Insufficient pricing history to detect anomalies.',
            };
        }

        if (!GEMINI_API_KEY) {
            return this.calculateLocalAnomaly(sku, store, productName, historicalPrices);
        }

        try {
            const prompt = `
            Detect anomalies in the price history of the following product:
            Product Name: ${productName} (SKU: ${sku}, Store: ${store})
            Price History: ${JSON.stringify(historicalPrices)}

            Analyze if there is a sudden, abnormal spike or drop in price.
            Return a single JSON object matching the following interface:
            interface AnomalyInsight {
                sku: string;
                store: string;
                productName: string;
                historicalPrices: number[];
                deviationPercent: number; // percentage deviation from average price
                isAnomaly: boolean;
                description: string; // analysis explanation
            }

            Return ONLY the valid raw JSON string.
            `;

            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: 'application/json',
                    },
                }),
            });

            if (!response.ok) {
                return this.calculateLocalAnomaly(sku, store, productName, historicalPrices);
            }

            const data = await response.json();
            const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return JSON.parse(textResult.trim());
        } catch (error) {
            return this.calculateLocalAnomaly(sku, store, productName, historicalPrices);
        }
    }

    private generateLocalPriceInsights(products: Product[]): PriceInsight[] {
        return products.map(p => {
            const price = Number(p.price);
            let action: 'HOLD' | 'PROMOTION' | 'MARKDOWN' = 'HOLD';
            let summary = 'Price is aligned with target index.';

            if (price > 100) {
                action = 'PROMOTION';
                summary = 'Premium item, consider promotional bundling.';
            } else if (price < 10) {
                action = 'MARKDOWN';
                summary = 'Low cost leader, potential volume driver.';
            }

            return {
                sku: p.sku,
                store: (p as any).store || 'costco',
                productName: p.name,
                currentPrice: price,
                insightSummary: summary,
                confidence: 0.85,
                recommendedAction: action,
            };
        });
    }

    private calculateLocalAnomaly(
        sku: string,
        store: string,
        productName: string,
        historicalPrices: number[]
    ): AnomalyInsight {
        const sum = historicalPrices.reduce((a, b) => a + b, 0);
        const avg = sum / historicalPrices.length;

        const currentPrice = historicalPrices[historicalPrices.length - 1];
        const deviation = Math.abs(currentPrice - avg) / (avg || 1);
        const deviationPercent = Math.round(deviation * 10000) / 100;
        const isAnomaly = deviationPercent > 15; // 15% threshold for anomaly

        return {
            sku,
            store,
            productName,
            historicalPrices,
            deviationPercent,
            isAnomaly,
            description: isAnomaly
                ? `Abnormal price change detected. Current price is ${deviationPercent}% away from 30-day average ($${avg.toFixed(
                      2
                  )}).`
                : `Price is stable. Deviation is within normal boundaries (${deviationPercent}%).`,
        };
    }
}
