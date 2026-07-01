import {
    test,
    expect,
    type Locator,
    type Page,
    type Response,
    type TestInfo,
} from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { SearchFixture } from '../../../fixtures/search.fixture';
import {
    LocationComponent,
    selectPreferredAddressSuggestionIndex,
} from '../../../components/location.component';
import { ProductSearchComponent } from '../../../components/product-search.component';
import {
    assertPageLoadedOrCapture,
    isBlockingPageLoadStatus,
} from '../../../utils/page-load-error';

type AddressSelectionOptions = {
    optional?: boolean;
};

const testIds = {
    addressSuggestionPanel: 'address-suggestion-panel',
    addressSuggestionList: 'address-suggestion-list',
    addressSuggestionItem: 'address-suggestion-item',
    storeResultItem: 'store-result-item',
    productResultItem: 'product-result-item',
};

function isStoresOrCatalogResponse(response: Response): boolean {
    return (
        (response.url().includes('/api/stores') ||
            response.url().includes('/api/catalog')) &&
        response.status() === 200
    );
}

async function attachJson(
    testInfo: TestInfo,
    name: string,
    value: unknown
): Promise<void> {
    const filePath = testInfo.outputPath(`${name}.json`);

    fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');

    await testInfo.attach(name, {
        path: filePath,
        contentType: 'application/json',
    });
}

async function attachScreenshot(
    page: Page,
    testInfo: TestInfo,
    name: string
): Promise<void> {
    const filePath = testInfo.outputPath(`${name}.png`);

    await page.screenshot({ path: filePath, fullPage: true });

    await testInfo.attach(name, {
        path: filePath,
        contentType: 'image/png',
    });
}

async function waitForStoresResponseOrVisibleResults(
    page: Page,
    resultItems: Locator,
    testInfo: TestInfo
): Promise<void> {
    const waitOutcome = await Promise.race([
        page.waitForResponse(isStoresOrCatalogResponse, { timeout: 30_000 }).then(
            response => ({
                source: 'api-response',
                url: response.url(),
                status: response.status(),
            })
        ),
        resultItems.waitFor({ state: 'visible', timeout: 30_000 }).then(() => ({
            source: 'visible-results',
        })),
    ]);

    await attachJson(testInfo, 'stores-wait-outcome', waitOutcome);
}

async function firstVisibleLocator(candidates: Locator[]): Promise<Locator> {
    for (const candidate of candidates) {
        const firstCandidate = candidate.first();
        const isVisible = await firstCandidate.isVisible().catch(() => false);

        if (isVisible) {
            return firstCandidate;
        }
    }

    return candidates
        .slice(1)
        .reduce((locator, candidate) => locator.or(candidate), candidates[0])
        .first();
}

async function addressSuggestionPanel(page: Page): Promise<Locator> {
    return firstVisibleLocator([
        page.getByTestId(testIds.addressSuggestionPanel),
        page.getByTestId(/^(address|location)-suggestion-(panel|dropdown|list)$/i),
        page.locator(
            [
                'header div.fixed.inset-x-0.bottom-0.z-40.overflow-y-auto.shadow-2xl:has(> ul > li > button):visible',
                'header div.fixed.inset-x-0.bottom-0.z-40:has(> ul > li > button):visible',
            ].join(', ')
        ),
    ]);
}

async function addressSuggestionList(page: Page): Promise<Locator> {
    const suggestionPanel = await addressSuggestionPanel(page);

    return firstVisibleLocator([
        page.getByTestId(testIds.addressSuggestionList),
        page.getByTestId(/^(address|location)-suggestion-list$/i),
        suggestionPanel.locator('> ul'),
        page.locator('ul.mt-1.max-h-56.overflow-y-auto:visible'),
    ]);
}

async function firstAddressSuggestionButton(page: Page): Promise<Locator> {
    const suggestionPanel = await addressSuggestionPanel(page);
    const suggestionList = await addressSuggestionList(page);

    return firstVisibleLocator([
        suggestionPanel.getByTestId(testIds.addressSuggestionItem),
        suggestionPanel.getByTestId(/^(address|location)-suggestion-item$/i),
        page.getByTestId(testIds.addressSuggestionItem),
        page.getByTestId(/^(address|location)-suggestion-item$/i),
        suggestionList.locator('> li:first-child > button'),
    ]);
}

async function nearbyStoreResultItem(page: Page): Promise<Locator> {
    return firstVisibleLocator([
        page.getByTestId(testIds.storeResultItem),
        page.getByTestId(testIds.productResultItem),
        page.getByTestId(/(store|product).*(card|item|result)/i),
        page.locator(
            [
                '[data-testid*="store"]',
                '[data-testid*="product"]',
                '.store-card',
                '.product-card',
            ].join(', ')
        ),
        page.getByText(/cá»­a hÃ ng|táº¡p hÃ³a|siÃªu thá»‹|Bia Tiger/i),
    ]);
}

async function searchAndSelectFirstAddressSuggestion(
    page: Page,
    address: string,
    options: AddressSelectionOptions = {},
    testInfo?: TestInfo
): Promise<boolean> {
    const location = new LocationComponent(page);

    await page.waitForLoadState('domcontentloaded');

    if (options.optional) {
        const canChooseLocation = await location.chooseLocationButton
            .isVisible({ timeout: 5_000 })
            .catch(() => false);

        if (!canChooseLocation) {
            return false;
        }
    }

    await expect(location.chooseLocationButton).toBeVisible({
        timeout: 30_000,
    });
    await location.chooseLocationButton.click();

    await expect(location.addressInput).toBeVisible({
        timeout: 30_000,
    });

    const nominatimResponsePromise = page.waitForResponse(
        response => response.url().includes('nominatim.openstreetmap.org/search'),
        { timeout: 30_000 }
    );

    await location.addressInput.fill(address);

    const nominatimResponse = await nominatimResponsePromise;
    expect(nominatimResponse.status()).toBe(200);

    const nominatimData = await nominatimResponse.json();
    expect(Array.isArray(nominatimData)).toBeTruthy();
    expect(nominatimData.length).toBeGreaterThan(0);

    const suggestionList = await addressSuggestionList(page);
    await expect(suggestionList).toBeVisible({ timeout: 30_000 });

    const suggestionButton = await firstAddressSuggestionButton(page);
    await expect(suggestionButton).toBeVisible({ timeout: 30_000 });

    const suggestionButtons = suggestionList.locator('li button');
    const suggestionTexts = await suggestionButtons.allInnerTexts();

    const selectedAddress = (
        (await suggestionButton.locator('span').nth(1).innerText().catch(() => '')) ||
        (await suggestionButton.innerText())
    ).trim();

    expect(selectedAddress.length).toBeGreaterThan(0);

    if (testInfo) {
        const buttonPath = testInfo.outputPath('first-address-suggestion-button.png');

        await attachJson(testInfo, 'address-suggestion-selection-debug', {
            typedAddress: address,
            suggestionCount: await suggestionButtons.count(),
            selectedAddress,
            firstFiveSuggestions: suggestionTexts.slice(0, 5),
        });
        await attachScreenshot(page, testInfo, 'address-suggestions-before-click');
        await suggestionButton.screenshot({ path: buttonPath });

        await testInfo.attach('first-address-suggestion-button', {
            path: buttonPath,
            contentType: 'image/png',
        });
    }

    await suggestionButton.click();

    if (testInfo) {
        await attachScreenshot(page, testInfo, 'address-after-suggestion-click');
    }

    await expect(suggestionList).toBeHidden({ timeout: 30_000 });

    await expect(page.locator('body')).toContainText(selectedAddress, {
        timeout: 30_000,
    });

    return true;
}

test.describe('@search @stores Address suggestion selection', () => {
    test('should prefer data-testid address suggestions over DOM fallback selectors', async ({
        page,
    }) => {
        await page.setContent(`
            <header>
                <div class="fixed inset-x-0 bottom-0 z-40 overflow-y-auto shadow-2xl">
                    <ul>
                        <li>
                            <button>
                                <span>pin</span>
                                <span>Fallback address</span>
                            </button>
                        </li>
                    </ul>
                </div>
                <div data-testid="address-suggestion-panel">
                    <ul data-testid="address-suggestion-list">
                        <li>
                            <button data-testid="address-suggestion-item">
                                <span>pin</span>
                                <span>Data test id address</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </header>
        `);

        await expect(await firstAddressSuggestionButton(page)).toContainText(
            'Data test id address'
        );
    });

    test('should locate the first address suggestion button in the dropdown list', async ({
        page,
    }) => {
        await page.setContent(`
            <body>
                <div class="min-h-screen bg-slate-50 text-slate-900">
                    <header>
                        <div>
                            <div>
                                <div>
                                    <div>
                                        <div class="fixed inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-none sm:w-[min(20rem,calc(100vw-2rem))] sm:rounded-2xl sm:p-3 sm:pb-3 sm:shadow-xl">
                                            <ul class="mt-1 max-h-56 space-y-0.5 overflow-y-auto">
                                                <li>
                                                    <button>
                                                        <span>pin</span>
                                                        <span>Dong Da, Phuong Gia Dinh, TP.HCM</span>
                                                    </button>
                                                </li>
                                                <li>
                                                    <button>
                                                        <span>pin</span>
                                                        <span>Dong Da, Phuong Tan Son Hoa, TP.HCM</span>
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                </div>
            </body>
        `);

        await expect(await firstAddressSuggestionButton(page)).toContainText(
            'Dong Da, Phuong Gia Dinh, TP.HCM'
        );
    });

    test('should prefer suggestion containing the entered keyword', () => {
        const suggestions = [
            '123 Lê Văn Sỹ, Quận 3',
            '5 Đống Đa, Phường Tân Sơn Hòa, TP.HCM',
        ];

        expect(
            selectPreferredAddressSuggestionIndex(suggestions, '5 Đống Đa')
        ).toBe(1);
    });

    test('should fall back to the first suggestion when no suggestion matches keyword', () => {
        const suggestions = [
            '123 Lê Văn Sỹ, Quận 3',
            '456 Cách Mạng Tháng 8, Quận 10',
        ];

        expect(
            selectPreferredAddressSuggestionIndex(suggestions, '5 Đống Đa')
        ).toBe(0);
    });

    test('should fail clearly when there are no suggestions', () => {
        expect(() =>
            selectPreferredAddressSuggestionIndex([], '5 Đống Đa')
        ).toThrow('Không có kết quả địa chỉ');
    });
});

test.describe('@search @stores Page load error detection', () => {
    test('should mark 300 and above status codes as blocking page load errors', () => {
        expect(isBlockingPageLoadStatus(300)).toBeTruthy();
        expect(isBlockingPageLoadStatus(403)).toBeTruthy();
        expect(isBlockingPageLoadStatus(404)).toBeTruthy();
        expect(isBlockingPageLoadStatus(500)).toBeTruthy();
    });

    test('should not mark successful status codes as blocking page load errors', () => {
        expect(isBlockingPageLoadStatus(200)).toBeFalsy();
        expect(isBlockingPageLoadStatus(204)).toBeFalsy();
    });
});

test.describe('@search @stores Search nearby stores', () => {
    test('should select address, search product, and return nearby stores', async ({
        page,
    }, testInfo) => {
        const outputDir = 'artifacts/api-search';
        fs.mkdirSync(outputDir, { recursive: true });

        const capturedResponses: unknown[] = [];
        const searchCase = SearchFixture.nearbyStores;

        page.on('response', async response => {
            const url = response.url();
            const contentType = response.headers()['content-type'] || '';

            if (
                !url.includes('nominatim.openstreetmap.org/search') &&
                !url.includes('/api/stores') &&
                !url.includes('/api/catalog')
            ) {
                return;
            }

            try {
                const body = contentType.includes('application/json')
                    ? await response.json()
                    : await response.text();

                capturedResponses.push({
                    url,
                    status: response.status(),
                    body,
                });
            } catch {
                capturedResponses.push({
                    url,
                    status: response.status(),
                    body: '[Cannot read response]',
                });
            }
        });

        const homeResponse = await page
            .goto('/', { waitUntil: 'domcontentloaded' })
            .catch(async error => {
                await testInfo.attach('home-page-load-error', {
                    body: await page.screenshot({ fullPage: true }),
                    contentType: 'image/png',
                });
                throw error;
            });

        await assertPageLoadedOrCapture(
            page,
            testInfo,
            homeResponse,
            'home-page-load-error'
        );

        await searchAndSelectFirstAddressSuggestion(
            page,
            searchCase.location.address,
            {},
            testInfo
        );

        const productSearch = new ProductSearchComponent(page);
        const resultItems = await nearbyStoreResultItem(page);
        /*
        const unusedLegacyResultItems = page
            .locator(
                [
                    '[data-testid*="store"]',
                    '[data-testid*="product"]',
                    '.store-card',
                    '.product-card',
                ].join(', ')
            )
            .or(page.getByText(/cửa hàng|tạp hóa|siêu thị|Bia Tiger/i))
            .first();
        */

        const storesReadyPromise = waitForStoresResponseOrVisibleResults(
            page,
            resultItems,
            testInfo
        );

        await productSearch.searchAndSelectProduct(searchCase.product.name);
        await attachScreenshot(page, testInfo, 'product-search-after-click');
        await storesReadyPromise;

        await expect(resultItems).toBeVisible({ timeout: 30_000 });

        const responsePath = path.join(outputDir, 'search-flow-responses.json');

        fs.writeFileSync(
            responsePath,
            JSON.stringify(capturedResponses, null, 2),
            'utf-8'
        );

        await test.info().attach('search-flow-responses', {
            path: responsePath,
            contentType: 'application/json',
        });

        await test.info().attach('search-flow-screenshot', {
            body: await page.screenshot({ fullPage: true }),
            contentType: 'image/png',
        });

        expect(capturedResponses.length).toBeGreaterThan(0);
    });

    test('should open product page directly and return available stores', async ({
        page,
    }, testInfo) => {
        const outputDir = 'artifacts/api-search';
        fs.mkdirSync(outputDir, { recursive: true });

        const capturedResponses: unknown[] = [];
        const searchCase = SearchFixture.nearbyStores;

        page.on('response', async response => {
            const url = response.url();
            const contentType = response.headers()['content-type'] || '';

            if (!url.includes('/api/stores') && !url.includes('/api/catalog')) {
                return;
            }

            try {
                const body = contentType.includes('application/json')
                    ? await response.json()
                    : await response.text();

                capturedResponses.push({
                    url,
                    status: response.status(),
                    body,
                });
            } catch {
                capturedResponses.push({
                    url,
                    status: response.status(),
                    body: '[Cannot read response]',
                });
            }
        });

        const productResponse = await page
            .goto(searchCase.product.path, { waitUntil: 'domcontentloaded' })
            .catch(async error => {
                await testInfo.attach('product-page-load-error', {
                    body: await page.screenshot({ fullPage: true }),
                    contentType: 'image/png',
                });
                throw error;
            });

        await assertPageLoadedOrCapture(
            page,
            testInfo,
            productResponse,
            'product-page-load-error'
        );

        const storesResponsePromise = page.waitForResponse(
            response =>
                (response.url().includes('/api/stores') ||
                    response.url().includes('/api/catalog')) &&
                response.status() === 200,
            { timeout: 30_000 }
        );

        await searchAndSelectFirstAddressSuggestion(
            page,
            searchCase.location.address,
            { optional: true },
            testInfo
        );

        await storesResponsePromise;

        const storeList = await nearbyStoreResultItem(page);
        /*
        const unusedLegacyStoreList = page
            .locator(['[data-testid*="store"]', '.store-card'].join(', '))
            .or(page.getByText(/cửa hàng|tạp hóa|siêu thị/i))
            .first();
        */

        await expect(storeList).toBeVisible({ timeout: 30_000 });

        const responsePath = path.join(outputDir, 'direct-product-responses.json');

        fs.writeFileSync(
            responsePath,
            JSON.stringify(capturedResponses, null, 2),
            'utf-8'
        );

        await test.info().attach('direct-product-responses', {
            path: responsePath,
            contentType: 'application/json',
        });

        await test.info().attach('direct-product-screenshot', {
            body: await page.screenshot({ fullPage: true }),
            contentType: 'image/png',
        });

        expect(capturedResponses.length).toBeGreaterThan(0);
    });
});
