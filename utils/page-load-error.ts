import { Page, Response, TestInfo } from '@playwright/test';

export function isBlockingPageLoadStatus(status: number): boolean {
    return status >= 300;
}

export async function pageContainsLoadError(page: Page): Promise<boolean> {
    return page
        .locator('body')
        .getByText(/This page couldn.t load|This page couldn’t load/i)
        .first()
        .isVisible({ timeout: 1_000 })
        .catch(() => false);
}

export async function capturePageLoadError(
    page: Page,
    testInfo: TestInfo,
    name: string
): Promise<void> {
    await testInfo.attach(name, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
    });
}

export async function assertPageLoadedOrCapture(
    page: Page,
    testInfo: TestInfo,
    response: Response | null,
    screenshotName: string
): Promise<void> {
    const status = response?.status();
    const hasBlockingStatus =
        typeof status === 'number' && isBlockingPageLoadStatus(status);
    const hasLoadErrorText = await pageContainsLoadError(page);

    if (!hasBlockingStatus && !hasLoadErrorText) {
        return;
    }

    await capturePageLoadError(page, testInfo, screenshotName);

    throw new Error(
        `Page load error detected${status ? ` with status ${status}` : ''}`
    );
}
