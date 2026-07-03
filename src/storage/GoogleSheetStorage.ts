import { IStorageService } from './IStorageService';
import { ProductDTO, PriceHistoryDTO, RawPayloadDTO, CrawlRunDTO } from './types';
import { GoogleSheetService, SheetRow } from '../services/google/GoogleSheetService';
import pino from 'pino';

const logger = pino({ name: 'google-sheet-storage', level: process.env.LOG_LEVEL || 'info' });

/**
 * GoogleSheetStorage
 * Triển khai giao diện IStorageService cho việc lưu trữ dữ liệu trên Google Sheets.
 */
export class GoogleSheetStorage implements IStorageService {
    private readonly sheetService: GoogleSheetService;
    private readonly retries: number;
    private readonly retryDelayMs: number;

    // Bộ nhớ đệm lưu trữ danh sách sản phẩm trong runtime để tránh đọc API liên tục
    private productsCache: Map<string, { rowIndex: number; product: ProductDTO }> | null = null;

    constructor(sheetService: GoogleSheetService, retries = 3, retryDelayMs = 1000) {
        this.sheetService = sheetService;
        this.retries = retries;
        this.retryDelayMs = retryDelayMs;
    }

    /**
     * Thực hiện hàm callback với cơ chế retry.
     */
    private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
        let lastError: any;
        for (let i = 0; i < this.retries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                logger.warn({ attempt: i + 1, err: error }, 'Operation failed, retrying...');
                if (i < this.retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelayMs));
                }
            }
        }
        logger.error({ err: lastError }, 'Operation failed after maximum retries');
        throw lastError;
    }

    /**
     * Tự động khởi tạo tiêu đề cột nếu sheet đang rỗng.
     */
    private async ensureHeader(sheetName: string, headers: string[]): Promise<void> {
        const rows = await this.sheetService.readRows(sheetName);
        if (rows.length === 0) {
            logger.info({ sheetName, headers }, 'Sheet is empty, initializing headers');
            await this.sheetService.appendRow(sheetName, headers);
        }
    }

    /**
     * Parse giá trị số từ ô của Google Sheet một cách an toàn.
     * Hỗ trợ trường hợp locale sử dụng dấu phẩy làm dấu ngăn cách thập phân.
     */
    private parsePrice(val: any): number {
        if (val === undefined || val === null) return 0;
        const num = Number(val);
        if (!isNaN(num)) return num;

        // Nếu là chuỗi, thử thay thế dấu phẩy bằng dấu chấm
        const str = val.toString().replace(/,/g, '.').replace(/[^\d.-]/g, '');
        const parsed = parseFloat(str);
        return isNaN(parsed) ? 0 : parsed;
    }

    /**
     * Nạp cache từ Google Sheet nếu cache chưa được khởi tạo.
     */
    private async loadProductsCacheIfEmpty(): Promise<Map<string, { rowIndex: number; product: ProductDTO }>> {
        if (this.productsCache) {
            return this.productsCache;
        }

        logger.info('Initializing runtime cache for Products sheet');
        const rows = await this.sheetService.readRows('Products');
        const cache = new Map<string, { rowIndex: number; product: ProductDTO }>();

        // Duyệt từ index 1 (bỏ qua dòng tiêu đề)
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const store = row[0]?.toString();
            const sku = row[1]?.toString();
            if (store && sku) {
                const key = `${store}_${sku}`;
                cache.set(key, {
                    rowIndex: i + 1, // 1-based index trên Google Sheet
                    product: this.rowToProduct(row)
                });
            }
        }

        this.productsCache = cache;
        logger.info({ cacheSize: cache.size }, 'Runtime cache for Products initialized');
        return cache;
    }

    // ==========================================
    // MAPPERS GIỮA DTO VÀ HÀNG GOOGLE SHEETS
    // ==========================================

    // Products Sheet: [store, sku, name, price, category, image, url, updatedAt]
    private rowToProduct(row: SheetRow): ProductDTO {
        return {
            store: row[0]?.toString() || '',
            sku: row[1]?.toString() || '',
            name: row[2]?.toString() || '',
            price: this.parsePrice(row[3]),
            category: row[4]?.toString() || '',
            image: row[5]?.toString() || '',
            url: row[6]?.toString() || '',
            updatedAt: row[7] ? new Date(row[7].toString()) : undefined,
        };
    }

    private productToRow(product: ProductDTO): SheetRow {
        return [
            product.store,
            product.sku,
            product.name,
            product.price,
            product.category,
            product.image,
            product.url,
            product.updatedAt ? product.updatedAt.toISOString() : new Date().toISOString(),
        ];
    }

    // PriceHistory Sheet: [store, sku, price, currency, source, crawlRunId, capturedAt]
    private priceHistoryToRow(ph: PriceHistoryDTO): SheetRow {
        return [
            ph.store,
            ph.sku,
            ph.price,
            ph.currency || 'USD',
            ph.source,
            ph.crawlRunId || '',
            ph.capturedAt ? ph.capturedAt.toISOString() : new Date().toISOString(),
        ];
    }

    // RawPayload Sheet: [store, sku, payload, crawlRunId, createdAt]
    private rawPayloadToRow(rp: RawPayloadDTO): SheetRow {
        return [
            rp.store,
            rp.sku,
            JSON.stringify(rp.payload),
            rp.crawlRunId || '',
            rp.createdAt ? rp.createdAt.toISOString() : new Date().toISOString(),
        ];
    }

    // CrawlRuns Sheet: [id, store, source, status, productCount, errorMessage, startedAt, finishedAt]
    private crawlRunToRow(cr: CrawlRunDTO): SheetRow {
        return [
            cr.id || '',
            cr.store,
            cr.source,
            cr.status,
            cr.productCount || 0,
            cr.errorMessage || '',
            cr.startedAt ? cr.startedAt.toISOString() : new Date().toISOString(),
            cr.finishedAt ? cr.finishedAt.toISOString() : '',
        ];
    }

    // ==========================================
    // TRIỂN KHAI PHƯƠNG THỨC INTERFACE
    // ==========================================

    async saveProduct(product: ProductDTO): Promise<void> {
        return this.withRetry(async () => {
            logger.info({ store: product.store, sku: product.sku }, 'Saving product to Google Sheet (using cache)');
            
            // Đảm bảo có header trước khi làm bất kỳ hành động nào
            await this.ensureHeader('Products', ['store', 'sku', 'name', 'price', 'category', 'image', 'url', 'updatedAt']);

            const cache = await this.loadProductsCacheIfEmpty();
            const key = `${product.store}_${product.sku}`;
            const entry = cache.get(key);
            
            if (entry) {
                logger.info({ store: product.store, sku: product.sku }, 'Product already exists in cache. Updating product details.');
                await this.updateProduct(product.store, product.sku, product);
            } else {
                logger.info({ store: product.store, sku: product.sku }, 'Product does not exist in cache. Appending new product.');
                const row = this.productToRow(product);
                await this.sheetService.appendRow('Products', row);

                // Dòng mới được chèn vào dòng: header (1) + cache.size + 1 (append mới) = cache.size + 2
                const newRowIndex = cache.size + 2;
                cache.set(key, {
                    rowIndex: newRowIndex,
                    product: {
                        ...product,
                        updatedAt: product.updatedAt || new Date()
                    }
                });
                logger.info({ store: product.store, sku: product.sku, rowIndex: newRowIndex }, 'Product appended and cached');
            }
        });
    }

    async savePriceHistory(priceHistory: PriceHistoryDTO): Promise<void> {
        return this.withRetry(async () => {
            logger.info({ store: priceHistory.store, sku: priceHistory.sku, price: priceHistory.price }, 'Saving price history to Google Sheet');
            
            await this.ensureHeader('PriceHistory', ['store', 'sku', 'price', 'currency', 'source', 'crawlRunId', 'capturedAt']);
            
            const row = this.priceHistoryToRow(priceHistory);
            await this.sheetService.appendRow('PriceHistory', row);
        });
    }

    async saveRawPayload(rawPayload: RawPayloadDTO): Promise<void> {
        return this.withRetry(async () => {
            logger.info({ store: rawPayload.store, sku: rawPayload.sku }, 'Saving raw payload to Google Sheet');
            
            await this.ensureHeader('RawPayload', ['store', 'sku', 'payload', 'crawlRunId', 'createdAt']);
            
            const row = this.rawPayloadToRow(rawPayload);
            await this.sheetService.appendRow('RawPayload', row);
        });
    }

    async saveCrawlRun(crawlRun: CrawlRunDTO): Promise<void> {
        return this.withRetry(async () => {
            logger.info({ id: crawlRun.id, store: crawlRun.store }, 'Saving crawl run to Google Sheet');
            
            await this.ensureHeader('CrawlRuns', ['id', 'store', 'source', 'status', 'productCount', 'errorMessage', 'startedAt', 'finishedAt']);
            
            const row = this.crawlRunToRow(crawlRun);
            await this.sheetService.appendRow('CrawlRuns', row);
        });
    }

    async updateProduct(store: string, sku: string, data: Partial<ProductDTO>): Promise<void> {
        return this.withRetry(async () => {
            logger.info({ store, sku }, 'Updating product in Google Sheet (using cache)');
            await this.ensureHeader('Products', ['store', 'sku', 'name', 'price', 'category', 'image', 'url', 'updatedAt']);
            const cache = await this.loadProductsCacheIfEmpty();
            const key = `${store}_${sku}`;
            const entry = cache.get(key);
 
            if (!entry) {
                logger.warn({ store, sku }, 'Product to update not found in runtime cache');
                throw new Error(`Product not found for update: store=${store}, sku=${sku}`);
            }

            // Gộp dữ liệu cập nhật
            const updatedProduct: ProductDTO = {
                ...entry.product,
                ...data,
                updatedAt: new Date()
            };

            const updatedRow = this.productToRow(updatedProduct);
            // Cập nhật dòng theo rowIndex đã cache
            await this.sheetService.updateRow('Products', entry.rowIndex, updatedRow);

            // Đồng bộ lại vào cache
            cache.set(key, {
                rowIndex: entry.rowIndex,
                product: updatedProduct
            });
            logger.info({ store, sku, rowIndex: entry.rowIndex }, 'Product updated successfully in sheet and cache');
        });
    }

    async findProduct(store: string, sku: string): Promise<ProductDTO | null> {
        return this.withRetry(async () => {
            logger.info({ store, sku }, 'Finding product in Google Sheet (using cache)');
            await this.ensureHeader('Products', ['store', 'sku', 'name', 'price', 'category', 'image', 'url', 'updatedAt']);
            const cache = await this.loadProductsCacheIfEmpty();
            const key = `${store}_${sku}`;
            const entry = cache.get(key);

            if (!entry) {
                logger.info({ store, sku }, 'Product not found in runtime cache');
                return null;
            }

            logger.info({ store, sku }, 'Product found in runtime cache');
            return entry.product;
        });
    }
}
