import { google, type sheets_v4 } from 'googleapis';
import pino from 'pino';

/**
 * GoogleSheetService
 * ------------------
 * Module thấp (low-level) để giao tiếp với Google Sheets API.
 * - Không chứa logic business.
 * - Chỉ đảm nhiệm: kết nối (connect), ghi thêm dòng (appendRow), đọc dòng (readRows).
 * - Tuân thủ Single Responsibility Principle (SRP).
 */

const logger = pino({ name: 'google-sheet-service', level: process.env.LOG_LEVEL || 'info' });

/** Dữ liệu 1 dòng trong sheet: mảng giá trị theo thứ tự cột. */
export type SheetRow = (string | number | boolean | null)[];

/**
 * Parse GOOGLE_SERVICE_ACCOUNT từ env.
 * Hỗ trợ 2 dạng:
 *   1. Chuỗi JSON (bắt đầu bằng "{")
 *   2. Đường dẫn file JSON (mặc định: credentials/google-service-account.json)
 */
function resolveServiceAccountEnv(raw: string): { client_email: string; private_key: string } {
    const trimmed = raw.trim();

    if (trimmed.startsWith('{')) {
        // Trường hợp env chứa JSON inline
        return JSON.parse(trimmed);
    }

    // Trường hợp env chứa đường dẫn file
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const content = fs.readFileSync(trimmed, 'utf-8');
    return JSON.parse(content);
}

export class GoogleSheetService {
    private sheetsClient: sheets_v4.Sheets | null = null;
    private readonly sheetId: string;
    private readonly credentials: { client_email: string; private_key: string };

    constructor() {
        // Đọc cấu hình từ env
        const sheetId = process.env.GOOGLE_SHEET_ID;
        const serviceAccountRaw = process.env.GOOGLE_SERVICE_ACCOUNT;

        if (!sheetId) {
            throw new Error('Missing GOOGLE_SHEET_ID in environment variables');
        }

        if (!serviceAccountRaw) {
            throw new Error('Missing GOOGLE_SERVICE_ACCOUNT in environment variables');
        }

        this.sheetId = sheetId;
        this.credentials = resolveServiceAccountEnv(serviceAccountRaw);
    }

    /**
     * connect()
     * Khởi tạo GoogleAuth + Google Sheets client và kiểm tra kết nối.
     * Ném lỗi nếu không truy cập được sheet.
     */
    async connect(): Promise<void> {
        try {
            // Khởi tạo GoogleAuth bằng Service Account credentials
            // Dùng google.auth.GoogleAuth để tránh xung đột phiên bản google-auth-library
            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: this.credentials.client_email,
                    private_key: this.credentials.private_key,
                },
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });

            // Khởi tạo Sheets client với GoogleAuth instance
            this.sheetsClient = google.sheets({ version: 'v4', auth: auth as any });

            // Kiểm tra kết nối bằng cách lấy metadata của spreadsheet
            await this.sheetsClient.spreadsheets.get({
                spreadsheetId: this.sheetId,
            });

            logger.info({ sheetId: this.sheetId }, 'Google Sheets connection established');
        } catch (error) {
            logger.error({ err: error }, 'Failed to connect to Google Sheets');
            throw error;
        }
    }

    /**
     * appendRow(sheetName, row)
     * Chỉ append 1 dòng vào cuối sheet. Không sửa logic business.
     */
    async appendRow(sheetName: string, row: SheetRow): Promise<void> {
        if (!this.sheetsClient) {
            throw new Error('Google Sheets client is not connected. Call connect() first.');
        }

        try {
            await this.sheetsClient.spreadsheets.values.append({
                spreadsheetId: this.sheetId,
                range: `${sheetName}!A:A`,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                requestBody: {
                    values: [row],
                },
            });

            logger.info({ sheetName, row }, 'Row appended to Google Sheet');
        } catch (error) {
            logger.error({ err: error, sheetName }, 'Failed to append row to Google Sheet');
            throw error;
        }
    }

    /**
     * readRows(sheetName)
     * Đọc toàn bộ dòng trong sheet. Trả về mảng các dòng.
     */
    async readRows(sheetName: string): Promise<SheetRow[]> {
        if (!this.sheetsClient) {
            throw new Error('Google Sheets client is not connected. Call connect() first.');
        }

        try {
            const response = await this.sheetsClient.spreadsheets.values.get({
                spreadsheetId: this.sheetId,
                range: `${sheetName}!A:Z`,
            });

            const values = response.data.values || [];
            logger.info({ sheetName, rowCount: values.length }, 'Rows read from Google Sheet');

            return values as SheetRow[];
        } catch (error) {
            logger.error({ err: error, sheetName }, 'Failed to read rows from Google Sheet');
            throw error;
        }
    }
}