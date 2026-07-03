import { ProductDTO, PriceHistoryDTO, RawPayloadDTO, CrawlRunDTO } from './types';

/**
 * Interface IStorageService
 * Định nghĩa Storage Layer trừu tượng cho toàn bộ ứng dụng.
 * Giúp các module crawler và business logic không phụ thuộc trực tiếp vào database engine (Prisma/Neon).
 */
export interface IStorageService {
    /**
     * Lưu thông tin sản phẩm mới hoặc cập nhật nếu đã tồn tại.
     * @param product Dữ liệu sản phẩm cần lưu.
     */
    saveProduct(product: ProductDTO): Promise<void>;

    /**
     * Lưu lịch sử giá của sản phẩm.
     * @param priceHistory Thông tin lịch sử giá.
     */
    savePriceHistory(priceHistory: PriceHistoryDTO): Promise<void>;

    /**
     * Lưu payload thô thu thập được từ trang web.
     * @param rawPayload Dữ liệu raw payload.
     */
    saveRawPayload(rawPayload: RawPayloadDTO): Promise<void>;

    /**
     * Lưu thông tin lượt crawl (lượt chạy crawler).
     * @param crawlRun Thông tin lượt chạy.
     */
    saveCrawlRun(crawlRun: CrawlRunDTO): Promise<void>;

    /**
     * Cập nhật thông tin của một sản phẩm dựa trên store và sku.
     * @param store Tên cửa hàng (ví dụ: "costco").
     * @param sku Mã sản phẩm duy nhất.
     * @param data Dữ liệu cần cập nhật.
     */
    updateProduct(store: string, sku: string, data: Partial<ProductDTO>): Promise<void>;

    /**
     * Tìm kiếm một sản phẩm theo cửa hàng và sku.
     * @param store Tên cửa hàng.
     * @param sku Mã sản phẩm.
     * @returns Trả về ProductDTO nếu tìm thấy, ngược lại trả về null.
     */
    findProduct(store: string, sku: string): Promise<ProductDTO | null>;
}
