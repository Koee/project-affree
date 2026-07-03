import * as dotenv from 'dotenv';
import * as path from 'path';
import { GoogleSheetService } from '../src/services/google/GoogleSheetService';

// Nạp cấu hình từ .env.costco (mặc định cho Costco)
dotenv.config({ path: path.resolve(process.cwd(), '.env.costco') });

async function main() {
    console.log('--- BẮT ĐẦU KIỂM TRA GOOGLE SHEET SERVICE ---');
    console.log(`GOOGLE_SHEET_ID: ${process.env.GOOGLE_SHEET_ID}`);
    console.log(`GOOGLE_SERVICE_ACCOUNT: ${process.env.GOOGLE_SERVICE_ACCOUNT}`);

    const service = new GoogleSheetService();

    // 1. Kiểm tra kết nối
    console.log('\n[1] Đang kết nối tới Google Sheets...');
    await service.connect();
    console.log('=> Kết nối thành công!');

    // 2. Ghi một dòng dữ liệu kiểm thử
    const sheetName = 'Products';
    const testRow = [
        'TEST',
        'SKU-001',
        'Demo Product',
        100
    ];
    console.log(`\n[2] Đang ghi thêm một dòng dữ liệu vào sheet "${sheetName}"...`);
    await service.appendRow(sheetName, testRow);
    console.log('=> Ghi dòng thành công!');

    // 3. Đọc lại dữ liệu để xác minh
    console.log(`\n[3] Đang đọc dữ liệu từ sheet "${sheetName}"...`);
    const rows = await service.readRows(sheetName);
    console.log(`=> Đọc thành công! Tổng số dòng hiện tại: ${rows.length}`);
    console.log('Dữ liệu 5 dòng cuối cùng:');
    const lastRows = rows.slice(-5);
    lastRows.forEach((row, index) => {
        console.log(`  Dòng ${rows.length - lastRows.length + index + 1}:`, JSON.stringify(row));
    });

    console.log('\n--- HOÀN THÀNH KIỂM TRA ---');
}

main().catch(error => {
    console.error('\n❌ LỖI KHI CHẠY KIỂM TRA GOOGLE SHEET SERVICE:');
    console.error(error);
    process.exitCode = 1;
});
