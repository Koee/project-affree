import { test, type Locator, type Page, type TestInfo } from "@playwright/test";

export function buildReportAttachmentName(
    prefix: string | undefined,
    name: string
): string {
    if (!prefix || name.startsWith(prefix)) {
        return name;
    }

    return `${prefix}${name}`;
}

export async function attachImportantScreenshot(
    testInfo: TestInfo,
    name: string,
    options: {
        page?: Page;
        locator?: Locator;
        prefix?: string;
    }
) {
    if (!options.locator && !options.page) {
        throw new Error('attachImportantScreenshot requires a page or locator');
    }

    await testInfo.attach(buildReportAttachmentName(options.prefix, name), {
        body: options.locator
            ? await options.locator.screenshot()
            : await options.page!.screenshot(),
        contentType: 'image/png',
    });
}

export async function attachReportState(
    page: Page,
    testInfo: TestInfo,
    name: string,
    options: {
        locator?: Locator;
        prefix?: string;
    } = {}
) {
    await attachImportantScreenshot(testInfo, `${name}-screenshot`, {
        page,
        locator: options.locator,
        prefix: options.prefix,
    });

    await testInfo.attach(buildReportAttachmentName(options.prefix, `${name}-state`), {
        body: JSON.stringify(
            {
                url: page.url(),
                text: (await page.locator('body').innerText()).slice(0, 10_000),
            },
            null,
            2
        ),
        contentType: 'application/json',
    });
}

export async function attachJson(
    name: string,
    data: unknown
) {
    await test.info().attach(name, {
        body: JSON.stringify(data, null, 2),
        contentType: "application/json"
    });
}

export async function attachText(
    name: string,
    text: string
) {
    await test.info().attach(name, {
        body: text,
        contentType: "text/plain"
    });
}
