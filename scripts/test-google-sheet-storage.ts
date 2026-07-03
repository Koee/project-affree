import * as dotenv from 'dotenv';
import * as path from 'path';
import { GoogleSheetService } from '../src/services/google/GoogleSheetService';
import { GoogleSheetStorage } from '../src/storage/GoogleSheetStorage';
import { ProductDTO, PriceHistoryDTO, RawPayloadDTO, CrawlRunDTO } from '../src/storage/types';

// Nạp cấu hình từ .env.costco
dotenv.config({ path: path.resolve(process.cwd(), '.env.costco') });

async function main() {
    console.log('=== BẮT ĐẦU CHẠY THỬ GOOGLE SHEET STORAGE LAYER ===\n');

    // 1. Khởi tạo service kết nối
    const sheetService = new GoogleSheetService();
    console.log('[1] Đang kết nối Google Sheets Service...');
    await sheetService.connect();
    console.log('=> Google Sheets Service kết nối thành công!\n');

    // 2. Khởi tạo storage
    const storage = new GoogleSheetStorage(sheetService, 3, 1000);
    const mockSku = `SKU-TEST-${Date.now()}`; // Tạo SKU ngẫu nhiên để tránh trùng lặp giữa các lượt chạy

    // 3. Test saveCrawlRun
    console.log('[2] Đang kiểm tra saveCrawlRun...');
    const crawlRun: CrawlRunDTO = {
        id: `run-${Date.now()}`,
        store: 'costco',
        source: 'automated-test',
        status: 'running',
        productCount: 1,
        errorMessage: null,
        startedAt: new Date()
    };
    await storage.saveCrawlRun(crawlRun);
    console.log('=> saveCrawlRun thành công!\n');

    // 4. Test saveProduct (Ghi mới)
    console.log('[3] Đang kiểm tra saveProduct (ghi mới sản phẩm)...');
    const product: ProductDTO = {
        store: 'costco',
        sku: mockSku,
        name: 'Costco Test Product',
        price: 99.99,
        category: 'test-category',
        image: 'https://images.costco.com/test-product.jpg',
        url: 'https://www.costco.com/test-product.html',
    };
    await storage.saveProduct(product);
    console.log('=> saveProduct (ghi mới) thành công!\n');

    // 5. Test findProduct
    console.log('[4] Đang kiểm tra findProduct...');
    const found = await storage.findProduct('costco', mockSku);
    console.log('=> findProduct kết quả:', JSON.stringify(found, null, 2));
    if (!found || found.sku !== mockSku) {
        throw new Error('Không tìm thấy sản phẩm hoặc thông tin SKU bị sai lệch!');
    }
    console.log('=> findProduct thành công!\n');

    // 6. Test updateProduct
    console.log('[5] Đang kiểm tra updateProduct...');
    await storage.updateProduct('costco', mockSku, {
        price: 89.99,
        name: 'Costco Test Product - Updated Name'
    });
    console.log('=> updateProduct thành công!\n');

    // Kiểm tra xem dữ liệu có được cập nhật thật sự không
    console.log('[5.1] Đang xác minh dữ liệu sau updateProduct...');
    const foundAfterUpdate = await storage.findProduct('costco', mockSku);
    console.log('=> Dữ liệu sau khi update:', JSON.stringify(foundAfterUpdate, null, 2));
    if (!foundAfterUpdate || foundAfterUpdate.price !== 89.99 || !foundAfterUpdate.name.includes('Updated Name')) {
        throw new Error('Dữ liệu không được cập nhật chính xác!');
    }
    console.log('=> Xác minh updateProduct thành công!\n');

    // 7. Test saveProduct (Ghi đè để kiểm thử tự động gọi update)
    console.log('[6] Đang kiểm tra saveProduct (ghi đè sản phẩm đã tồn tại để test luồng upsert)...');
    const updatedProductDto: ProductDTO = {
        store: 'costco',
        sku: mockSku,
        name: 'Costco Test Product - Upserted Name',
        price: 79.99,
        category: 'test-category-updated',
        image: 'https://images.costco.com/test-product-upsert.jpg',
        url: 'https://www.costco.com/test-product-upsert.html',
    };
    await storage.saveProduct(updatedProductDto);
    
    console.log('[6.1] Đang xác minh dữ liệu sau khi ghi đè (upsert)...');
    const foundAfterUpsert = await storage.findProduct('costco', mockSku);
    console.log('=> Dữ liệu sau khi upsert:', JSON.stringify(foundAfterUpsert, null, 2));
    if (!foundAfterUpsert || foundAfterUpsert.price !== 79.99 || !foundAfterUpsert.name.includes('Upserted Name')) {
        throw new Error('Dữ liệu upsert không được ghi đè chính xác!');
    }
    console.log('=> saveProduct (upsert) thành công!\n');

    // 8. Test savePriceHistory
    console.log('[7] Đang kiểm tra savePriceHistory...');
    const priceHistory: PriceHistoryDTO = {
        store: 'costco',
        sku: mockSku,
        price: 79.99,
        currency: 'USD',
        source: 'automated-test',
        crawlRunId: crawlRun.id,
        capturedAt: new Date()
    };
    await storage.savePriceHistory(priceHistory);
    console.log('=> savePriceHistory thành công!\n');

    // 9. Test saveRawPayload
    console.log('[8] Đang kiểm tra saveRawPayload...');
    const rawPayload: RawPayloadDTO = {
        store: 'costco',
        sku: mockSku,
        payload: {
            rawHtmlLength: 12045,
            metaTags: {
                title: 'Costco Test Product',
                description: 'This is a test description'
            },
            apiResponseTimeMs: 250
        },
        crawlRunId: crawlRun.id
    };
    await storage.saveRawPayload(rawPayload);
    console.log('=> saveRawPayload thành công!\n');

    console.log('=== KIỂM THỬ THÀNH CÔNG TOÀN BỘ 6 PHƯƠNG THỨC TRÊN GOOGLE SHEET STORAGE LAYER ===');
}

main().catch(error => {
    console.error('\n❌ GẶP LỖI TRONG QUÁ TRÌNH KIỂM THỬ:');
    console.error(error);
    process.exitCode = 1;
});
