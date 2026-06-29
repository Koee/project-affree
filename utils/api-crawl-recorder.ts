import { Page, Response } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export type ApiRecord = {
    endpoint: string;
    method: string;
    url: string;
    status: number;
    contentType: string;
    sourcePage?: string;
    requestBody?: string | null;
    responsePreview?: unknown;
};

export class ApiCrawlRecorder {
    private records = new Map<string, ApiRecord>();
    private outputDir: string;

    constructor(outputDir = 'test-results/api-crawl') {
        this.outputDir = outputDir;
        fs.mkdirSync(this.outputDir, { recursive: true });
    }

    attach(page: Page) {
        page.on('response', async (response: Response) => {
            const request = response.request();
            const url = response.url();

            if (!this.isAffreeApi(url)) return;

            const endpoint = new URL(url).pathname;
            const method = request.method();
            const key = `${method} ${endpoint}`;
            const contentType = response.headers()['content-type'] || '';

            let responsePreview: unknown = null;

            try {
                if (contentType.includes('application/json')) {
                    responsePreview = await response.json();
                } else {
                    responsePreview = await response.text();
                }
            } catch {
                responsePreview = '[Cannot read response]';
            }

            this.records.set(key, {
                endpoint,
                method,
                url,
                status: response.status(),
                contentType,
                sourcePage: page.url(),
                requestBody: request.postData(),
                responsePreview,
            });
        });
    }

    save() {
        const data = [...this.records.values()];

        fs.writeFileSync(
            path.join(this.outputDir, 'api-list.json'),
            JSON.stringify(
                data.map(item => ({
                    method: item.method,
                    endpoint: item.endpoint,
                    status: item.status,
                    contentType: item.contentType,
                    sourcePage: item.sourcePage,
                    hasBody: !!item.requestBody,
                })),
                null,
                2
            )
        );

        fs.writeFileSync(
            path.join(this.outputDir, 'api-responses.json'),
            JSON.stringify(data, null, 2)
        );

        return data;
    }

    private isAffreeApi(url: string): boolean {
        const allowApis = [
            '/api/catalog',
            '/api/stores',
            '/api/buyer',
            '/api/purchases',
        ];

        try {
            const parsedUrl = new URL(url);
            return allowApis.includes(parsedUrl.pathname);
        } catch {
            return false;
        }
    }
}