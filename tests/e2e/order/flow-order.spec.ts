import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import {
    OrderRecipientFixture,
    getOrderReportPrefix,
    type OrderStoreChain,
    type OrderRecipientData,
} from '../../../fixtures/order-recipient.fixture';
import {
    getOrderStoreCase,
    type OrderStoreCase,
    orderStoreCases,
} from '../../../fixtures/order-store-form.fixture';
import {
    getOrderFlowRuntimeOptions,
    OrderFormComponent,
    resolveFieldValue,
} from '../../../components/order-form.component';
import { OrderFlowComponent } from '../../../components/order-flow.component';
import {
    attachImportantScreenshot,
    attachReportState,
    buildReportAttachmentName,
} from '../../../utils/report';

const orderProductName = 'Bia Tiger Crystal lốc 6 lon x 330ml';
const coopProductName = 'Sữa tươi Vinamilk có đường 1L';
const bhxProductName = 'Trà xanh Không Độ chanh 455ml';
const mlblAgentWaitMs = Number(process.env.ORDER_AGENT_WAIT_MS || 120_000);
const coopAgentWaitMs = Number(process.env.ORDER_AGENT_WAIT_MS || 120_000);
const bhxAgentWaitMs = Number(process.env.ORDER_AGENT_WAIT_MS || 30_000);

async function clickCheapestStoreBuyButton(
    page: Page,
    storeCase: OrderStoreCase,
    testInfo: TestInfo
): Promise<void> {
    const reportPrefix = getOrderReportPrefix(storeCase.chain);
    const cheapestBadge = page
        .locator('span.rounded-full.bg-emerald-600')
        .filter({ hasText: /re nhat|rẻ nhất/i });
    const cheapestStoreCard = page
        .locator('li')
        .filter({ has: cheapestBadge })
        .filter({ hasText: storeCase.storeMatcher })
        .first();

    await expect(cheapestStoreCard).toBeVisible({ timeout: 30_000 });

    await attachImportantScreenshot(testInfo, 'cheapest-store-card', {
        page,
        locator: cheapestStoreCard,
        prefix: reportPrefix,
    });

    const buyButton = cheapestStoreCard
        .getByRole('button', { name: /^mua$/i })
        .first();

    await expect(buyButton).toBeVisible({ timeout: 30_000 });
    await buyButton.click();

    await attachReportState(page, testInfo, 'after-cheapest-buy-click', {
        prefix: reportPrefix,
    });
}

async function clickBhxCheapestStoreBuyButton(
    page: Page,
    testInfo: TestInfo
): Promise<void> {
    const reportPrefix = getOrderReportPrefix('bhx');
    const cheapestBadge = page
        .locator('span')
        .filter({ hasText: /re nhat|rẻ nhất/i });
    const bhxStoreCard = page
        .locator('li, article, [data-testid*="store"], [data-testid*="product"], .store-card, .product-card')
        .filter({ has: cheapestBadge })
        .filter({ hasText: /bach hoa xanh|bách hóa xanh|bhx/i })
        .first();

    await expect(bhxStoreCard).toBeVisible({ timeout: 30_000 });

    await attachImportantScreenshot(testInfo, 'cheapest-store-card', {
        page,
        locator: bhxStoreCard,
        prefix: reportPrefix,
    });

    const buyButton = bhxStoreCard
        .getByRole('button', { name: /mua ngay|mua|chon mua|chọn mua/i })
        .or(bhxStoreCard.getByText(/mua ngay|mua|chon mua|chọn mua/i))
        .first();

    await expect(buyButton).toBeVisible({ timeout: 30_000 });
    await buyButton.click();

    const formMarker = page
        .getByText(/nguoi nhan|người nhận|so dien thoai|số điện thoại|de tro ly dat giup|để trợ lý đặt giúp/i)
        .first();

    if (!(await formMarker.isVisible({ timeout: 3_000 }).catch(() => false))) {
        const addToCartButton = bhxStoreCard
            .getByRole('button', { name: /them vao gio|thêm vào giỏ|\+/i })
            .first();

        if (await addToCartButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await addToCartButton.click({ force: true });
        }
    }

    await attachReportState(page, testInfo, 'after-cheapest-buy-click', {
        prefix: reportPrefix,
    });
}

async function selectBhxDeliverySlot(
    page: Page,
    recipient: OrderRecipientData
): Promise<void> {
    if (!recipient.deliverySlot) {
        return;
    }

    const slotPattern = new RegExp(escapeRegExp(recipient.deliverySlot), 'i');
    const root = page.locator('[role="dialog"]').last().or(page.locator('body')).first();
    const selectControls = root.locator('select');
    const selectCount = await selectControls.count();

    for (let index = 0; index < selectCount; index += 1) {
        const selectControl = selectControls.nth(index);
        const matchingOptionValue = await selectControl.locator('option').evaluateAll(
            (options, expectedSlot) => {
                const expected = String(expectedSlot).toLocaleLowerCase('vi-VN');
                const match = options.find(option =>
                    (option.textContent || '')
                        .toLocaleLowerCase('vi-VN')
                        .includes(expected)
                ) as HTMLOptionElement | undefined;

                return match ? match.value : undefined;
            },
            recipient.deliverySlot
        );

        if (!matchingOptionValue) {
            continue;
        }

        await selectControl.selectOption(matchingOptionValue);
        return;
    }

    const slotControl = root
        .getByRole('button', { name: slotPattern })
        .or(root.getByRole('radio', { name: slotPattern }))
        .or(root.getByRole('option', { name: slotPattern }))
        .or(root.getByText(slotPattern))
        .first();

    await expect(slotControl).toBeVisible({ timeout: 30_000 });
    await slotControl.click({ force: true });
}

async function selectBhxCheapestDeliveryStore(
    page: Page,
    testInfo: TestInfo
): Promise<void> {
    const reportPrefix = getOrderReportPrefix('bhx');
    const dialog = page.locator('[role="dialog"]').last();
    const root = (await dialog.isVisible({ timeout: 1_000 }).catch(() => false))
        ? dialog
        : page.locator('body');
    const storeSection = root
        .locator('section, div, ul')
        .filter({ hasText: /chon lai noi mua|chọn lại nơi mua|dinh vi theo dia chi giao|định vị theo địa chỉ giao/i })
        .first()
        .or(root);
    const cheapestStore = storeSection
        .locator('button, li, article, [role="option"], [data-testid*="store"], .store-card')
        .filter({ hasText: /re nhat|rẻ nhất/i })
        .first();

    await expect(cheapestStore).toBeVisible({ timeout: 30_000 });
    await cheapestStore.scrollIntoViewIfNeeded();
    await cheapestStore.click({ force: true });

    await attachReportState(page, testInfo, 'delivery-cheapest-store-selected', {
        locator: cheapestStore,
        prefix: reportPrefix,
    });
}

async function expectBhxAgenticPopup(page: Page): Promise<void> {
    await expect(page.locator('body')).toContainText(
        /phuc vu boi affree agentic|phục vụ bởi affree agentic|phuc vu boi agentic ai|phục vụ bởi agentic ai/i,
        { timeout: 30_000 }
    );
}

async function captureBhxAgentStateAfterClick(
    page: Page,
    testInfo: TestInfo
): Promise<void> {
    await attachOrderCaseState(page, testInfo, 'bhx', 'after-final-cta-click');
    await expectBhxAgenticPopup(page);
    await attachOrderCaseState(page, testInfo, 'bhx', 'agentic-ai-visible');
    await page.waitForTimeout(bhxAgentWaitMs);
    await attachOrderCaseState(page, testInfo, 'bhx', 'agentic-ai-after-wait');
}

function resolveOrderReportName(name: string): {
    name: string;
    prefix?: string;
} {
    const chainPrefixes: Array<[OrderStoreChain, string]> = [
        ['coop', 'coop-'],
        ['bhx', 'bhx-'],
        ['concung', 'concung-'],
        ['mlbl', 'mlbl-'],
    ];

    for (const [chain, chainPrefix] of chainPrefixes) {
        if (name.startsWith(chainPrefix)) {
            return {
                name: name.slice(chainPrefix.length),
                prefix: getOrderReportPrefix(chain),
            };
        }
    }

    return { name };
}

async function visibleReportRegion(page: Page): Promise<Locator | undefined> {
    const candidates = [
        page.locator('[role="dialog"]').last(),
        page.locator('form').first(),
        page.locator('main').first(),
    ];

    for (const candidate of candidates) {
        if (await candidate.isVisible().catch(() => false)) {
            return candidate;
        }
    }

    return undefined;
}

async function attachPageState(
    page: Page,
    testInfo: TestInfo,
    name: string
): Promise<void> {
    const reportName = resolveOrderReportName(name);

    await attachReportState(page, testInfo, reportName.name, {
        locator: await visibleReportRegion(page),
        prefix: reportName.prefix,
    });
}

async function attachOrderCaseState(
    page: Page,
    testInfo: TestInfo,
    chain: OrderStoreChain,
    name: string
): Promise<void> {
    await attachReportState(page, testInfo, name, {
        locator: await visibleReportRegion(page),
        prefix: getOrderReportPrefix(chain),
    });
}

async function fillTxnnField(
    page: Page,
    field: ReturnType<Page['locator']>,
    value: string
): Promise<void> {
    await expect(field).toBeVisible({ timeout: 30_000 });
    await field.fill(value);
    await expect(field).toHaveValue(value, { timeout: 5_000 });
}

function parseCurrencyValue(text: string): number | undefined {
    const match = text.match(/[\d.,]+/);

    if (!match) {
        return undefined;
    }

    const value = Number(match[0].replace(/[^\d]/g, ''));

    return Number.isFinite(value) ? value : undefined;
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function labelToPlaceholderPattern(label: RegExp): RegExp {
    return new RegExp(label.source, label.flags.includes('i') ? 'i' : undefined);
}

function normalizeCoopOptionText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('vi-VN')
        .replace(/\b0+(\d+)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
}

function coopFormRoot(page: Page): Locator {
    return page.locator('[role="dialog"]').last();
}

function coopFieldLocator(root: Locator, field: OrderStoreCase['fields'][number]): Locator {
    const placeholderPattern = labelToPlaceholderPattern(field.label);
    const labelledControl = root
        .getByLabel(field.label)
        .or(root.getByRole('textbox', { name: field.label }))
        .or(root.getByRole('combobox', { name: field.label }))
        .or(root.getByPlaceholder(placeholderPattern))
        .or(
            root
                .locator('label', { hasText: field.label })
                .locator('input, textarea, select, [role="combobox"]')
        )
        .first();

    if (field.source === 'coopPassword') {
        return labelledControl.or(root.locator('input[type="password"]').first()).first();
    }

    return labelledControl;
}

async function nativeSelectOptionValue(input: Locator, value: string): Promise<string | undefined> {
    const normalizedValue = normalizeCoopOptionText(value);

    return input.locator('option').evaluateAll(
        (options, expectedValue) => {
            const normalize = (text: string): string =>
                text
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLocaleLowerCase('vi-VN')
                    .replace(/\b0+(\d+)/g, '$1')
                    .replace(/\s+/g, ' ')
                    .trim();
            const expected = String(expectedValue);
            const match = options.find(
                option => normalize(option.textContent?.trim() || '') === expected
            ) as HTMLOptionElement | undefined;

            return match ? match.value : undefined;
        },
        normalizedValue
    );
}

async function selectCoopField(
    page: Page,
    root: Locator,
    input: Locator,
    value: string
): Promise<void> {
    const valuePattern = new RegExp(escapeRegExp(value), 'i');
    const tagName = await input.evaluate(element => element.tagName.toLowerCase());

    if (tagName === 'select') {
        await expect
            .poll(
                () => nativeSelectOptionValue(input, value),
                { message: `Expected Coop select option "${value}" to be available` }
            )
            .not.toBeUndefined();

        const matchedOption = await nativeSelectOptionValue(input, value);

        await input.evaluate((element, optionValue) => {
            const select = element as HTMLSelectElement;
            select.value = String(optionValue);
            select.dispatchEvent(new Event('input', { bubbles: true }));
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }, matchedOption);
        return;
    }

    await input.click();
    await input.fill(value).catch(() => undefined);

    const option = root
        .getByRole('option', { name: valuePattern })
        .or(
            root
                .locator('[role="option"], li, button, div')
                .filter({ hasText: valuePattern })
        )
        .first();

    if (await option.isVisible({ timeout: 10_000 }).catch(() => false)) {
        await option.click();
        return;
    }

    const pageOption = page
        .getByRole('option', { name: valuePattern })
        .or(
            page
                .locator('[role="option"], [role="listbox"] li, [data-radix-popper-content-wrapper] button')
                .filter({ hasText: valuePattern })
        )
        .first();

    await expect(pageOption).toBeVisible({ timeout: 30_000 });
    await pageOption.click();
}

async function fillCoopStoreForm(
    page: Page,
    storeCase: OrderStoreCase,
    recipient: OrderRecipientData
): Promise<void> {
    const root = coopFormRoot(page);

    for (const field of storeCase.fields) {
        if (field.source === 'streetName') {
            continue;
        }

        const value =
            field.source === 'houseNumber'
                ? `${recipient.houseNumber || ''} ${recipient.streetName || ''}`.trim()
                : resolveFieldValue(field, recipient);

        if (!value) {
            continue;
        }

        const input = coopFieldLocator(root, field);
        await expect(input).toBeVisible({ timeout: 30_000 });

        if (field.kind === 'select') {
            const selectedLabel = await input
                .locator('option:checked')
                .innerText()
                .catch(() => '');

            if (selectedLabel && !/chon|chọn|select|quận trước/i.test(selectedLabel)) {
                continue;
            }

            await selectCoopField(page, root, input, value).catch(error => {
                if (field.source === 'ward') {
                    return;
                }

                throw error;
            });
            continue;
        }

        await input.fill(value);
    }

    await ensureCoopWardSelected(root, storeCase);
}

async function ensureCoopWardSelected(
    root: Locator,
    storeCase: OrderStoreCase
): Promise<void> {
    const wardField = storeCase.fields.find(field => field.source === 'ward');

    if (!wardField) {
        return;
    }

    const wardSelect = coopFieldLocator(root, wardField);

    if (!(await wardSelect.isVisible().catch(() => false))) {
        return;
    }

    const selectedLabel = await wardSelect
        .locator('option:checked')
        .innerText()
        .catch(() => '');

    if (selectedLabel && !/chon|chọn|select/i.test(selectedLabel)) {
        return;
    }

    const optionValues = await wardSelect.locator('option').evaluateAll(options =>
        options.map((option, index) => ({
            index,
            label: option.textContent?.trim() || '',
        }))
    );
    const fallbackOption = optionValues.find(
        option => option.label && !/chon|chọn|select|quận trước/i.test(option.label)
    );

    if (fallbackOption) {
        await wardSelect.selectOption({ index: fallbackOption.index });
    }
}

async function clickFirstCoopmartStoreBuyButton(
    page: Page,
    testInfo: TestInfo
): Promise<void> {
    const storesTab = page
        .getByRole('tab', { name: /cua hang|cửa hàng/i })
        .or(page.getByRole('button', { name: /cua hang|cửa hàng/i }))
        .first();

    if (await storesTab.isVisible({ timeout: 15_000 }).catch(() => false)) {
        await storesTab.click();
    }

    const storeCardSelector =
        'li, article, [data-testid*="store"], [data-testid*="product"], .store-card, .product-card';
    const coopmartStoreCard = page
        .locator(storeCardSelector)
        .filter({ has: page.locator('span').filter({ hasText: /co\.opmart/i }) })
        .first()
        .or(
            page
                .locator(storeCardSelector)
                .filter({ hasText: /co\.opmart/i })
                .first()
        )
        .first();

    await expect(coopmartStoreCard).toBeVisible({ timeout: 30_000 });

    await attachImportantScreenshot(testInfo, 'first-coopmart-store-card', {
        page,
        locator: coopmartStoreCard,
        prefix: getOrderReportPrefix('coop'),
    });

    const buyButton = coopmartStoreCard
        .getByRole('button', { name: /mua|chon mua|chọn mua/i })
        .or(coopmartStoreCard.getByText(/mua|chon mua|chọn mua/i))
        .first();

    await expect(buyButton).toBeVisible({ timeout: 30_000 });
    await buyButton.click();

    await attachPageState(page, testInfo, 'coop-after-first-coopmart-buy-click');
}

async function clickFirstVisible(locator: Locator, timeout = 30_000): Promise<void> {
    await expect(locator.first()).toBeVisible({ timeout });
    await locator.first().click();
}

async function clickLastVisibleOption(page: Page): Promise<void> {
    const roleOptions = page.getByRole('option');
    const optionCount = await roleOptions.count();

    for (let index = optionCount - 1; index >= 0; index -= 1) {
        const option = roleOptions.nth(index);

        if (await option.isVisible().catch(() => false)) {
            await option.click();
            return;
        }
    }

    const fallbackOptions = page
        .locator('[role="listbox"] li, [role="menu"] li, [data-radix-popper-content-wrapper] button, [data-radix-popper-content-wrapper] div')
        .filter({ hasText: /\S/ });
    const fallbackCount = await fallbackOptions.count();

    for (let index = fallbackCount - 1; index >= 0; index -= 1) {
        const option = fallbackOptions.nth(index);

        if (await option.isVisible().catch(() => false)) {
            await option.click();
            return;
        }
    }

    throw new Error('Could not find a visible Coop delivery date option');
}

async function selectLastCoopDeliveryDate(page: Page): Promise<void> {
    const root = coopFormRoot(page);
    let dateSelect = root
        .getByRole('combobox', { name: /chon ngay nhan hang|chọn ngày nhận hàng/i })
        .first();

    if ((await dateSelect.count()) === 0) {
        dateSelect = root.locator('select').first();
    }

    if ((await dateSelect.count()) > 0) {
        const optionCount = await dateSelect.locator('option').count();

        if (optionCount > 0) {
            await dateSelect.selectOption({ index: optionCount - 1 }, { force: true });
            await expect
                .poll(
                    () => dateSelect.evaluate(element => (element as HTMLSelectElement).selectedIndex),
                    { message: 'Expected Coop delivery date select to move to the last available option' }
                )
                .toBe(optionCount - 1);
            return;
        }
    }

    await clickFirstVisible(
        page
            .getByRole('button', { name: /chon ngay nhan hang|chọn ngày nhận hàng|\d{2}\/\d{2}\/\d{4}/i })
            .or(page.getByText(/chon ngay nhan hang|chọn ngày nhận hàng|\d{2}\/\d{2}\/\d{4}/i))
    );
    await clickLastVisibleOption(page).catch(() => undefined);
}

async function selectFirstCoopDeliveryStore(
    page: Page,
    testInfo: TestInfo
): Promise<void> {
    const root = coopFormRoot(page);
    const storeCandidates = root
        .locator('button, li, article, [role="option"], [data-testid*="store"], .store-card')
        .filter({ hasText: /co\.opmart|co\.op|coop/i })
        .filter({ hasText: /\d+(?:[.,]\d+)?\s*km/i });
    let storeCandidate: Locator | undefined;
    const candidateCount = await storeCandidates.count();

    for (let index = 0; index < candidateCount; index += 1) {
        const candidate = storeCandidates.nth(index);

        if (await candidate.isVisible().catch(() => false)) {
            storeCandidate = candidate;
            break;
        }
    }

    if (!storeCandidate) {
        await attachPageState(page, testInfo, 'coop-delivery-store-list-missing');
        throw new Error('Could not find the first Coop delivery store');
    }

    const chooseButton = storeCandidate
        .getByRole('button', { name: /chon|chọn|mua|select/i })
        .first();

    if (await chooseButton.isVisible().catch(() => false)) {
        await chooseButton.scrollIntoViewIfNeeded();
        await chooseButton.click({ force: true });
    } else {
        await storeCandidate.scrollIntoViewIfNeeded();
        await storeCandidate.click({ force: true });
    }

    await expect
        .poll(
            async () => {
                const normalizedText = normalizeCoopOptionText(await root.innerText());

                return !/dang tim|chua chon/.test(normalizedText);
            },
            { message: 'Expected Coop delivery store to be selected' }
        )
        .toBeTruthy();

    await attachPageState(page, testInfo, 'coop-after-first-delivery-store-selected');
}

async function visibleCoopSubtotal(page: Page): Promise<number | undefined> {
    const root = coopFormRoot(page);
    const subtotalTextbox = root
        .getByRole('textbox', { name: /tam tinh|tạm tính/i })
        .first();

    if (await subtotalTextbox.isVisible().catch(() => false)) {
        const value = await subtotalTextbox.inputValue().catch(async () =>
            subtotalTextbox.innerText()
        );
        const parsedValue = parseCurrencyValue(value);

        if (parsedValue !== undefined) {
            return parsedValue;
        }
    }

    const bodyText = await root.innerText();
    const subtotalLine = bodyText
        .split('\n')
        .find(line => /tam tinh|tạm tính/i.test(line));

    if (subtotalLine) {
        const parsedValue = parseCurrencyValue(subtotalLine);

        if (parsedValue !== undefined) {
            return parsedValue;
        }
    }

    const priceText = bodyText
        .split('\n')
        .filter(line => !/co\.op chi|co\.op chỉ|don tu|đơn từ/i.test(line))
        .join('\n');
    const priceMatches = priceText.match(/([\d.,]+)\s*(?:d|đ|₫|vnd)/gi) || [];
    const totals = priceMatches
        .map(match => Number(match.replace(/[^\d]/g, '')))
        .filter(value => Number.isFinite(value));

    return totals.length > 0 ? Math.max(...totals) : undefined;
}

async function increaseCoopQuantityUntilSubtotal(
    page: Page,
    minSubtotal: number,
    maxQuantity = 20
): Promise<void> {
    const root = coopFormRoot(page);

    for (let quantity = 1; quantity <= maxQuantity; quantity += 1) {
        const subtotal = await visibleCoopSubtotal(page);

        if (subtotal !== undefined && subtotal >= minSubtotal) {
            return;
        }

        const increaseButton = root
            .getByRole('button', { name: /^\+$/ })
            .or(root.locator('button').filter({ hasText: /^\+$/ }))
            .first();

        await expect(increaseButton).toBeVisible({ timeout: 30_000 });
        await increaseButton.click({ force: true });
        await expect
            .poll(
                () => visibleCoopSubtotal(page),
                { message: 'Expected Coop subtotal to update after increasing quantity' }
            )
            .toBeGreaterThan(subtotal || 0);
    }

    throw new Error(`Coop subtotal did not reach ${minSubtotal}`);
}

async function completeCoopOrderPopup(
    page: Page,
    testInfo: TestInfo
): Promise<void> {
    const popupTitle = page
        .getByRole('heading', { name: /dat hang co\.op|đặt hàng co\.op/i })
        .or(page.getByText(/dat hang co\.op|đặt hàng co\.op/i))
        .first();
    await expect(popupTitle).toBeVisible({ timeout: 30_000 });

    await selectLastCoopDeliveryDate(page);
    await selectCoopTimeSlot(page);

    const cashOnDelivery = page
        .locator('span')
        .filter({ hasText: /thanh toan khi nhan hang|thanh toán khi nhận hàng/i })
        .first()
        .or(page.getByText(/thanh toan khi nhan hang|thanh toán khi nhận hàng/i).first())
        .first();
    await expect(cashOnDelivery).toBeVisible({ timeout: 30_000 });
    await cashOnDelivery.click();

    const paymentButton = page
        .getByRole('button', {
            name: /thanh toan khi nhan hang|thanh toán khi nhận hàng/i,
        })
        .first();
    await expect(paymentButton).toBeVisible({ timeout: 30_000 });
    await expect(paymentButton).toBeEnabled({ timeout: 30_000 });
    await paymentButton.click();

    const updateCheckoutButton = page
        .getByRole('button', {
            name: /cap nhat lich giao|cập nhật lịch giao|xac nhan dat hang|xác nhận đặt hàng/i,
        })
        .first();

    if (await updateCheckoutButton.isVisible({ timeout: 10_000 }).catch(() => false)) {
        await expect(updateCheckoutButton).toBeEnabled({ timeout: 30_000 });
        await updateCheckoutButton.click();
    }

    await attachPageState(page, testInfo, 'coop-after-cash-on-delivery-click');
}

async function clickCoopFinalCtaAndWaitForCheckout(
    page: Page,
    orderForm: OrderFormComponent,
    storeCase: OrderStoreCase,
    testInfo: TestInfo
): Promise<void> {
    const root = coopFormRoot(page);

    for (let attempt = 1; attempt <= 3; attempt += 1) {
        const finalCta = orderForm.finalCta(storeCase);

        await expect(finalCta).toBeVisible({ timeout: 30_000 });
        await expect(finalCta).toBeEnabled({ timeout: 30_000 });
        await finalCta.click();

        const checkoutReady = await page
            .getByText(/checkout co\.op|chon ngay nhan hang|chọn ngày nhận hàng/i)
            .first()
            .isVisible({ timeout: 30_000 })
            .catch(() => false);

        if (checkoutReady) {
            await attachPageState(page, testInfo, 'coop-after-login-and-add-to-cart');
            return;
        }

        const transientServerError = await root
            .getByText(/internal server error|server error|loi may chu|lỗi máy chủ/i)
            .first()
            .isVisible()
            .catch(() => false);

        if (!transientServerError) {
            break;
        }
    }

    const finalCheckoutReady = await page
        .getByText(/checkout co\.op|chon ngay nhan hang|chọn ngày nhận hàng/i)
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

    if (finalCheckoutReady) {
        await attachPageState(page, testInfo, 'coop-after-login-and-add-to-cart');
        return;
    }

    await attachPageState(page, testInfo, 'coop-checkout-handoff-not-ready');
    throw new Error('Coop checkout did not become ready after submitting the final CTA');
}

async function selectCoopTimeSlot(page: Page): Promise<void> {
    const preferredTimeSlot = page
        .getByRole('button', { name: /10:00\s*-\s*12:00/i })
        .first();

    if (
        (await preferredTimeSlot.isVisible().catch(() => false)) &&
        (await preferredTimeSlot.isEnabled().catch(() => false))
    ) {
        await preferredTimeSlot.click();
        return;
    }

    const enabledTimeSlots = page
        .locator('button')
        .filter({ hasText: /\d{2}:00\s*-\s*\d{2}:00/i });
    const timeSlotCount = await enabledTimeSlots.count();

    for (let index = 0; index < timeSlotCount; index += 1) {
        const timeSlot = enabledTimeSlots.nth(index);

        if (await timeSlot.isEnabled().catch(() => false)) {
            await timeSlot.click();
            return;
        }
    }

    throw new Error('Could not find an enabled Coop time slot');
}

async function expectCoopCheckoutReady(
    page: Page,
    testInfo: TestInfo
): Promise<void> {
    await expect(page.locator('body')).toContainText(
        /man hinh co\.op da san sang|màn hình co\.op đã sẵn sàng/i,
        { timeout: coopAgentWaitMs }
    );

    const checkoutImage = page
        .getByRole('img', { name: /co\.op checkout thao tac|co\.op checkout thao tác/i })
        .first();
    await expect(checkoutImage).toBeVisible({ timeout: 30_000 });

    await attachPageState(page, testInfo, 'coop-checkout-ready');
}

async function expectCoopOrderDialogReady(page: Page): Promise<void> {
    await expect(
        page
            .getByRole('heading', { name: /dat hang co\.op|đặt hàng co\.op/i })
            .or(page.getByText(/dat hang co\.op|đặt hàng co\.op/i))
            .first()
    ).toBeVisible({ timeout: 30_000 });
}

async function searchAndSelectCoopProduct(
    page: Page,
    orderFlow: OrderFlowComponent
): Promise<void> {
    await expect(orderFlow.searchInput).toBeVisible({ timeout: 30_000 });
    await orderFlow.searchInput.fill(coopProductName);

    const product = page
        .locator('[role="option"], [data-testid*="product"], a, button, li')
        .filter({ hasText: /sữa tươi vinamilk có đường 1l|sua tuoi vinamilk co duong 1l/i })
        .first();

    await expect(product).toBeVisible({ timeout: 30_000 });
    await product.click({ timeout: 30_000 });
}

test.describe('@flow-order Order recipient form config', () => {
    test('should prefer the typed Coop delivery address suggestion over generic matches', async ({
        page,
    }) => {
        const orderFlow = new OrderFlowComponent(page);

        await page.setContent(`
            <button>Nhập địa chỉ</button>
            <input placeholder="VD: 123 Lê Lợi, Quận 1, TP.HCM" />
            <ul id="suggestions"></ul>
            <script>
                setTimeout(() => {
                    document.querySelector('#suggestions').innerHTML = \`
                        <li>
                            <button type="button" onclick="document.body.dataset.selectedAddress = this.innerText">
                                TRÁI CÂY NỘI NGOẠI NHÃP, 246 Nguyễn Trọng Tuyển, Phường 8, Quận Phú Nhuận, Thành Phố Hồ Chí Minh
                            </button>
                        </li>
                        <li>
                            <button type="button" onclick="document.body.dataset.selectedAddress = this.innerText">
                                246 Nguyễn Trọng Tuyển, Phường 1, Quận Phú Nhuận, TP.HCM
                            </button>
                        </li>
                    \`;
                }, 2000);
            </script>
        `);

        await orderFlow.selectLocationIfAvailable(
            '246 Nguyễn Trọng Tuyển, Phường 1, Quận Phú Nhuận, TP.HCM'
        );

        await expect
            .poll(() => page.locator('body').evaluate(body => body.dataset.selectedAddress || ''))
            .toContain('Phường 1');
    });

    test('should close a blocking location modal after selecting an address', async ({
        page,
    }) => {
        const orderFlow = new OrderFlowComponent(page);

        await page.setContent(`
            <button id="open-location" type="button">Nhập địa chỉ</button>
            <main>
                <ul>
                    <li>
                        <button id="cart" type="button" onclick="document.body.dataset.clickedCart = 'true'">
                            Thêm vào giỏ
                        </button>
                    </li>
                </ul>
                <button id="product" type="button">Sữa tươi Vinamilk có đường 1L</button>
            </main>
            <script>
                document.querySelector('#open-location').addEventListener('click', () => {
                    document.querySelector('#location-modal')?.remove();
                    document.body.insertAdjacentHTML('beforeend', \`
                        <div id="location-modal" class="fixed inset-0 z-[2200]">
                            <div>
                                <button type="button" aria-label="Đóng">Đóng</button>
                                <input placeholder="VD: 123 Lê Lợi, Quận 1, TP.HCM" />
                                <ul>
                                    <li>
                                        <button type="button" id="address-suggestion">
                                            246 Nguyễn Trọng Tuyển, Quận Phú Nhuận, Thành phố Hồ Chí Minh
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    \`);
                    document.querySelector('#location-modal [aria-label="Đóng"]').addEventListener('click', () => {
                        document.querySelector('#location-modal').remove();
                    });
                    document.querySelector('#address-suggestion').addEventListener('click', event => {
                        document.body.dataset.selectedAddress = event.currentTarget.innerText;
                        document.querySelector('#location-modal ul').remove();
                    });
                });
            </script>
        `);

        await orderFlow.selectLocationIfAvailable(
            '246 Nguyễn Trọng Tuyển, Phường 1, Quận Phú Nhuận, TP.HCM'
        );

        await expect(page.locator('#location-modal')).toBeHidden();
        await expect(page.locator('#product')).toBeVisible();
        await expect
            .poll(() => page.locator('body').evaluate(body => body.dataset.clickedCart || ''))
            .toBe('');
        await expect
            .poll(() => page.locator('body').evaluate(body => body.dataset.selectedAddress || ''))
            .toContain('Nguyễn Trọng Tuyển');
    });

    test('should fill Coop recipient fields by their own labels and match padded ward options', async ({
        page,
    }) => {
        const storeCase = getOrderStoreCase('coop');
        const recipient: OrderRecipientData = {
            receiverName: 'Trách',
            phone: '0989346877',
            coopPassword: 'secret',
            province: 'Thành phố Hồ Chí Minh',
            district: 'Quận Phú Nhuận',
            ward: 'Phường 1',
            houseNumber: '246',
            streetName: 'Nguyễn Trọng Tuyển',
        };

        await page.setContent(`
            <div role="dialog">
                <div>
                    <div>Người nhận</div>
                    <input aria-label="Người nhận" placeholder="Họ và tên" />
                    <div>Số điện thoại</div>
                    <input aria-label="Số điện thoại" placeholder="VD: 0901234567" />
                </div>
                <div>
                    <div>Mật khẩu Co.op</div>
                    <input aria-label="Mật khẩu Co.op" type="password" />
                </div>
                <div>
                    <div>Tỉnh/Thành phố</div>
                    <select aria-label="Tỉnh/Thành phố">
                        <option>Chọn tỉnh/thành phố</option>
                        <option>Thành phố Hồ Chí Minh</option>
                    </select>
                    <div>Quận/Huyện</div>
                    <select aria-label="Quận/Huyện">
                        <option>Chọn quận/huyện</option>
                        <option>Quận Phú Nhuận</option>
                    </select>
                    <div>Phường/Xã</div>
                    <select aria-label="Phường/Xã">
                        <option>Chọn phường/xã</option>
                        <option>Phường 01</option>
                    </select>
                    <div>Số nhà, tên đường</div>
                    <input aria-label="Số nhà, tên đường" />
                </div>
            </div>
        `);

        await fillCoopStoreForm(page, storeCase, recipient);

        await expect(page.getByRole('textbox', { name: /người nhận/i })).toHaveValue('Trách');
        await expect(page.getByRole('textbox', { name: /số điện thoại/i })).toHaveValue(
            '0989346877'
        );
        await expect(page.getByRole('combobox', { name: /phường\/xã/i })).toHaveValue(
            'Phường 01'
        );
        await expect(page.getByRole('textbox', { name: /số nhà, tên đường/i })).toHaveValue(
            '246 Nguyễn Trọng Tuyển'
        );
    });

    test('should not treat the store count summary as the stores tab', async ({
        page,
    }, testInfo) => {
        await page.setContent(`
            <p onclick="document.body.dataset.clickedSummary = 'true'">
                Vinamilk · Hộp 1L · 5 cửa hàng
            </p>
            <ul>
                <li>
                    <span>Co.opmart</span>
                    <div>Co.opmart Đinh Tiên Hoàng</div>
                    <div>1.2 km</div>
                    <button type="button" onclick="document.body.dataset.clickedBuy = 'true'">
                        Mua
                    </button>
                </li>
            </ul>
        `);

        await clickFirstCoopmartStoreBuyButton(page, testInfo);

        await expect
            .poll(() => page.locator('body').evaluate(body => body.dataset.clickedSummary || ''))
            .toBe('');
        await expect
            .poll(() => page.locator('body').evaluate(body => body.dataset.clickedBuy || ''))
            .toBe('true');
    });

    test('should keep each store form configurable with receiver and phone fields', () => {
        for (const storeCase of orderStoreCases) {
            const fieldSources = storeCase.fields.map(field => field.source);

            expect(fieldSources).toContain('receiverName');
            expect(fieldSources).toContain('phone');
            expect(OrderRecipientFixture[storeCase.chain].receiverName).toBeTruthy();
            expect(OrderRecipientFixture[storeCase.chain].phone).toBeTruthy();
        }
    });

    test('should require Coop password for checkout handoff', () => {
        const coopCase = getOrderStoreCase('coop');
        const passwordField = coopCase.fields.find(field => field.source === 'coopPassword');

        expect(passwordField?.required).toBeTruthy();
    });

    test('should prefer the final CTA inside the active order dialog', async ({
        page,
    }) => {
        const coopCase = getOrderStoreCase('coop');
        const orderForm = new OrderFormComponent(page);

        await page.setContent(`
            <button type="button" aria-label="Thêm vào giỏ" onclick="document.body.dataset.clickedOutside = 'true'">
                +
            </button>
            <div role="dialog">
                <button type="button" onclick="document.body.dataset.clickedDialog = 'true'">
                    Đăng nhập Co.op
                </button>
            </div>
        `);

        await orderForm.finalCta(coopCase).click();

        await expect
            .poll(() => page.locator('body').evaluate(body => body.dataset.clickedOutside || ''))
            .toBe('');
        await expect
            .poll(() => page.locator('body').evaluate(body => body.dataset.clickedDialog || ''))
            .toBe('true');
    });

    test('should click the enabled final CTA when duplicate CTAs are rendered', async ({
        page,
    }) => {
        const bhxCase = getOrderStoreCase('bhx');
        const orderForm = new OrderFormComponent(page);

        await page.setContent(`
            <div role="dialog">
                <button type="button" disabled onclick="document.body.dataset.clickedDisabled = 'true'">
                    Để trợ lý đặt giúp →
                </button>
                <button type="button" onclick="document.body.dataset.clickedEnabled = 'true'">
                    Để trợ lý đặt giúp →
                </button>
            </div>
        `);

        await orderForm.finalCta(bhxCase).click({ timeout: 1_000 });

        await expect
            .poll(() => page.locator('body').evaluate(body => body.dataset.clickedEnabled || ''))
            .toBe('true');
        await expect
            .poll(() => page.locator('body').evaluate(body => body.dataset.clickedDisabled || ''))
            .toBe('');
    });

    test('should select the last native Coop delivery date option', async ({
        page,
    }) => {
        await page.setContent(`
            <div role="dialog">
                <select>
                    <option>dd/mm/yyyy</option>
                    <option>30/06/2026</option>
                    <option>01/07/2026</option>
                </select>
            </div>
        `);

        await selectLastCoopDeliveryDate(page);

        await expect(page.locator('select')).toHaveValue('01/07/2026');
    });

    test('should retry Coop final CTA after a transient server error', async ({
        page,
    }, testInfo) => {
        const coopCase = getOrderStoreCase('coop');
        const orderForm = new OrderFormComponent(page);

        await page.setContent(`
            <div role="dialog">
                <div id="state"></div>
                <button type="button" onclick="
                    const state = document.querySelector('#state');
                    const attempts = Number(document.body.dataset.attempts || '0') + 1;
                    document.body.dataset.attempts = String(attempts);
                    state.textContent = attempts === 1 ? 'Internal Server Error' : 'Checkout Co.op Chọn ngày nhận hàng';
                ">
                    Đăng nhập Co.op và thêm vào giỏ
                </button>
            </div>
        `);

        await clickCoopFinalCtaAndWaitForCheckout(
            page,
            orderForm,
            coopCase,
            testInfo
        );

        await expect(page.locator('#state')).toContainText('Checkout Co.op');
        await expect
            .poll(() => page.locator('body').evaluate(body => body.dataset.attempts || ''))
            .toBe('2');
    });

    test('should resolve field values from store-specific recipient data', () => {
        const coopCase = getOrderStoreCase('coop');

        expect(resolveFieldValue(coopCase.fields[0], OrderRecipientFixture.coop)).toBe(
            OrderRecipientFixture.coop.receiverName
        );
    });

    test('should keep Coop recipient defaults isolated from other store agents', () => {
        expect(OrderRecipientFixture.coop.receiverName).toBe('Trách');
        expect(OrderRecipientFixture.coop.phone).toBe('0989346877');
        expect(OrderRecipientFixture.coop.province).toBe('Thành phố Hồ Chí Minh');
        expect(OrderRecipientFixture.coop.district).toBe('Quận Phú Nhuận');
        expect(OrderRecipientFixture.coop.ward).toBe('Phường 1');
        expect(OrderRecipientFixture.coop.houseNumber).toBe('246');
        expect(OrderRecipientFixture.coop.streetName).toBe('Nguyễn Trọng Tuyển');

        expect(OrderRecipientFixture.bhx.receiverName).toBe('Thach');
        expect(OrderRecipientFixture.concung.receiverName).toBe('Thach');
        expect(OrderRecipientFixture.mlbl.receiverName).toBe('Thach');
    });

    test('should keep BHX recipient defaults editable and isolated', () => {
        expect(OrderRecipientFixture.bhx.receiverName).toBe('Trạch');
        expect(OrderRecipientFixture.bhx.phone).toBe('0305070809');
        expect(OrderRecipientFixture.bhx.deliveryAddress).toBe(
            'Thị trấn Tân Túc, Phường 6, Quận Gò Vấp, Thành phố Hồ Chí Minh'
        );
        expect(OrderRecipientFixture.bhx.deliverySlot).toBe('Trong hôm nay');

        expect(OrderRecipientFixture.concung.receiverName).toBe('Thach');
        expect(OrderRecipientFixture.mlbl.receiverName).toBe('Thach');
    });

    test('should select BHX cheapest buy and delivery options', async ({
        page,
    }, testInfo) => {
        const recipient = OrderRecipientFixture.bhx;

        await page.setContent(`
            <main>
                <ul>
                    <li>
                        <span>Bách Hóa Xanh</span>
                        <span>Gần nhất</span>
                        <button type="button" onclick="document.body.dataset.clickedNearest = 'true'">
                            Mua ngay
                        </button>
                    </li>
                    <li>
                        <span>Bách Hóa Xanh</span>
                        <span class="rounded-full bg-emerald-600">rẻ nhất</span>
                        <button type="button" onclick="document.body.dataset.clickedCheapest = 'true'">
                            Mua ngay
                        </button>
                    </li>
                </ul>
                <div role="dialog">
                    <button type="button" onclick="document.body.dataset.slot = 'Ngày mai'">
                        Ngày mai
                    </button>
                    <button type="button" onclick="document.body.dataset.slot = 'Trong hôm nay'">
                        Trong hôm nay
                    </button>
                    <section aria-label="Chọn lại nơi mua">
                        <p>Định vị theo địa chỉ giao</p>
                        <button type="button" onclick="document.body.dataset.selectedStore = 'nearest'">
                            Bách Hóa Xanh Tân Túc <span>gần nhất</span>
                        </button>
                        <button type="button" onclick="document.body.dataset.selectedStore = 'cheapest'">
                            Bách Hóa Xanh Gò Vấp <span>rẻ nhất</span>
                        </button>
                    </section>
                </div>
            </main>
        `);

        await clickBhxCheapestStoreBuyButton(page, testInfo);
        await selectBhxDeliverySlot(page, recipient);
        await selectBhxCheapestDeliveryStore(page, testInfo);

        await expect
            .poll(() => page.locator('body').evaluate(body => body.dataset.clickedNearest || ''))
            .toBe('');
        await expect
            .poll(() => page.locator('body').evaluate(body => body.dataset.clickedCheapest || ''))
            .toBe('true');
        await expect
            .poll(() => page.locator('body').evaluate(body => body.dataset.slot || ''))
            .toBe('Trong hôm nay');
        await expect
            .poll(() => page.locator('body').evaluate(body => body.dataset.selectedStore || ''))
            .toBe('cheapest');
    });

    test('should select BHX delivery slot from native select options', async ({
        page,
    }) => {
        const recipient = OrderRecipientFixture.bhx;

        await page.setContent(`
            <div role="dialog">
                <select aria-label="Khung giờ giao">
                    <option>Ngày mai</option>
                    <option value="Trong hôm nay (2–4 giờ)">Trong hôm nay (2–4 giờ)</option>
                </select>
            </div>
        `);

        await selectBhxDeliverySlot(page, recipient);

        await expect(page.getByLabel(/khung giờ giao/i)).toHaveValue(
            'Trong hôm nay (2–4 giờ)'
        );
    });

    test('should fill BHX phone and address fields below requirement text', async ({
        page,
    }) => {
        const recipient = OrderRecipientFixture.bhx;
        const orderForm = new OrderFormComponent(page);
        const storeCase = getOrderStoreCase('bhx');

        await page.setContent(`
            <div role="dialog">
                <section>
                    <p>Bach Hoa Xanh yeu cau de dat mon nay:</p>
                    <ul>
                        <li>So dien thoai</li>
                        <li>Dia chi giao</li>
                        <li>Khung gio giao</li>
                    </ul>
                </section>
                <div>
                    <div>Nguoi nhan</div>
                    <input data-testid="receiver" placeholder="Ho va ten" />
                </div>
                <div>
                    <div>So dien thoai</div>
                    <input data-testid="phone" placeholder="VD: 0901234567" />
                </div>
                <div>
                    <div>Dia chi giao</div>
                    <textarea data-testid="address" placeholder="So nha, duong, phuong, quan..."></textarea>
                </div>
            </div>
        `);

        await orderForm.fillStoreForm(storeCase, recipient);

        await expect(page.getByTestId('receiver')).toHaveValue(recipient.receiverName);
        await expect(page.getByTestId('phone')).toHaveValue(recipient.phone);
        await expect(page.getByTestId('address')).toHaveValue(
            recipient.deliveryAddress || ''
        );
    });

    test('should not click cheapest badges when selecting the cheapest tab', async ({
        page,
    }) => {
        const orderFlow = new OrderFlowComponent(page);

        await page.setContent(`
            <main>
                <span onclick="document.body.dataset.clickedBadge = 'true'">
                    Rẻ nhất
                </span>
            </main>
        `);

        await orderFlow.selectCheapestTab();

        await expect
            .poll(() => page.locator('body').evaluate(body => body.dataset.clickedBadge || ''))
            .toBe('');
    });

    test('should not click cheapest map markers when selecting the cheapest tab', async ({
        page,
    }) => {
        const orderFlow = new OrderFlowComponent(page);

        await page.setContent(`
            <main>
                <div
                    role="button"
                    tabindex="0"
                    onclick="document.body.dataset.clickedMarker = 'true'"
                >
                    Rẻ nhất
                </div>
            </main>
        `);

        await orderFlow.selectCheapestTab();

        await expect
            .poll(() => page.locator('body').evaluate(body => body.dataset.clickedMarker || ''))
            .toBe('');
    });

    test('should keep order report prefixes distinct by store chain', () => {
        expect(getOrderReportPrefix('coop')).toBe('co.op-');
        expect(getOrderReportPrefix('bhx')).toBe('bhx-');
        expect(getOrderReportPrefix('mlbl')).toBe('mlbl-');
        expect(buildReportAttachmentName('co.op-', 'form-filled')).toBe(
            'co.op-form-filled'
        );
        expect(buildReportAttachmentName('bhx-', 'bhx-final-cta-ready')).toBe(
            'bhx-final-cta-ready'
        );
    });

    test('should read agent runtime options from environment with safe defaults', () => {
        const options = getOrderFlowRuntimeOptions({});

        expect(options.clickFinalCta).toBeFalsy();
        expect(options.interactive).toBeFalsy();
        expect(options.agentWaitMs).toBe(30_000);
    });
});

test.describe('@flow-order @coop Co.op order flow', () => {
    test.describe.configure({ timeout: 180_000 });

    test('@coop should continue through Co.op checkout handoff', async ({
        page,
    }, testInfo) => {
        const storeCase = getOrderStoreCase('coop');
        const recipient = OrderRecipientFixture.coop;
        const orderFlow = new OrderFlowComponent(page);
        const orderForm = new OrderFormComponent(page);
        const envFile = `.env.${process.env.TEST_ENV || 'demo'}`;

        expect(
            recipient.coopPassword,
            `Set ORDER_COOP_PASSWORD or COOP_PASSWORD in ${envFile} before running @coop checkout handoff`
        ).toBeTruthy();

        await orderFlow.openHome();
        await orderFlow.selectLocationIfAvailable(recipient.deliveryAddress);
        await searchAndSelectCoopProduct(page, orderFlow);
        await orderFlow.selectLocationIfAvailable(recipient.deliveryAddress);
        await clickFirstCoopmartStoreBuyButton(page, testInfo);
        await expectCoopOrderDialogReady(page);

        await fillCoopStoreForm(page, storeCase, recipient);
        await attachOrderCaseState(page, testInfo, storeCase.chain, 'form-filled');

        await selectFirstCoopDeliveryStore(page, testInfo);
        await increaseCoopQuantityUntilSubtotal(
            page,
            storeCase.minOrderTotal || 200_000,
            storeCase.maxQuantity || 20
        );

        await clickCoopFinalCtaAndWaitForCheckout(
            page,
            orderForm,
            storeCase,
            testInfo
        );

        await completeCoopOrderPopup(page, testInfo);
        await expectCoopCheckoutReady(page, testInfo);
    });
});

test.describe('@flow-order @bhx Bách Hóa Xanh order flow', () => {
    test.describe.configure({ timeout: 180_000 });

    test('@bhx should fill recipient form and capture agentic order state', async ({
        page,
    }, testInfo) => {
        const runtimeOptions = getOrderFlowRuntimeOptions();
        const storeCase = getOrderStoreCase('bhx');
        const recipient = OrderRecipientFixture.bhx;
        const orderFlow = new OrderFlowComponent(page);
        const orderForm = new OrderFormComponent(page);

        await orderFlow.openHome();
        await orderFlow.searchAndSelectProduct(bhxProductName);
        await orderFlow.selectLocationIfAvailable(recipient.deliveryAddress);
        await orderFlow.selectCheapestTab();
        await clickBhxCheapestStoreBuyButton(page, testInfo);
        await orderFlow.openCartIfOrderFormMissing();
        await orderForm.expectStoreFormReady(storeCase, testInfo);

        await orderForm.fillStoreForm(storeCase, recipient);
        await selectBhxDeliverySlot(page, recipient);
        await selectBhxCheapestDeliveryStore(page, testInfo);
        await attachOrderCaseState(page, testInfo, storeCase.chain, 'form-filled');

        await expectBhxAgenticPopup(page);
        await attachOrderCaseState(page, testInfo, storeCase.chain, 'agentic-popup-filled');

        const finalCta = orderForm.finalCta(storeCase);
        await expect(finalCta).toBeVisible({ timeout: 30_000 });

        if (!runtimeOptions.clickFinalCta) {
            await attachOrderCaseState(
                page,
                testInfo,
                storeCase.chain,
                'final-cta-ready'
            );
            return;
        }

        await finalCta.click();
        await captureBhxAgentStateAfterClick(page, testInfo);
    });
});

test.describe('@flow-order Prepare order by store', () => {
    for (const storeCase of orderStoreCases.filter(
        candidate =>
            candidate.chain !== 'coop' &&
            candidate.chain !== 'bhx' &&
            candidate.chain !== 'mlbl'
    )) {
        test(`${storeCase.tag} should fill recipient form and capture agentic order state`, async ({
            page,
        }, testInfo) => {
            const runtimeOptions = getOrderFlowRuntimeOptions();
            const recipient = OrderRecipientFixture[storeCase.chain];
            const orderFlow = new OrderFlowComponent(page);
            const orderForm = new OrderFormComponent(page);

            await orderFlow.openHome();
            await orderFlow.selectLocationIfAvailable(recipient.deliveryAddress);
            await orderFlow.searchAndSelectProduct(orderProductName);
            await orderFlow.selectLocationIfAvailable(recipient.deliveryAddress);
            await orderFlow.selectCheapestTab();
            await clickCheapestStoreBuyButton(page, storeCase, testInfo);
            await orderFlow.openCartIfOrderFormMissing();
            await orderForm.expectStoreFormReady(storeCase, testInfo);

            if (storeCase.minOrderTotal) {
                await orderForm.increaseQuantityUntilMinTotal(
                    storeCase.minOrderTotal,
                    storeCase.maxQuantity
                );
            }

            await orderForm.fillStoreForm(storeCase, recipient);
            await attachOrderCaseState(page, testInfo, storeCase.chain, 'form-filled');

            const finalCta = orderForm.finalCta(storeCase);
            await expect(finalCta).toBeVisible({ timeout: 30_000 });

            if (!runtimeOptions.clickFinalCta) {
                await attachOrderCaseState(
                    page,
                    testInfo,
                    storeCase.chain,
                    'final-cta-ready'
                );
                return;
            }

            await finalCta.click();
            await attachOrderCaseState(
                page,
                testInfo,
                storeCase.chain,
                'after-final-cta-click'
            );

            await orderFlow.expectAgenticAiPopup();
            await attachOrderCaseState(
                page,
                testInfo,
                storeCase.chain,
                'agentic-ai-visible'
            );

            await attachOrderCaseState(
                page,
                testInfo,
                storeCase.chain,
                'agentic-ai-after-wait'
            );
        });
    }
});

test.describe('@flow-order @mlbl TXNN demo order', () => {
    test('@mlbl should order through TXNN assistant demo flow', async ({
        page,
    }, testInfo) => {
        const recipient = OrderRecipientFixture.mlbl;
        const orderFlow = new OrderFlowComponent(page);

        await orderFlow.openHome();

        const txnnButton = page.getByRole('button', {
            name: /mua hang txnn|mua hàng txnn/i,
        });
        await expect(txnnButton).toBeVisible({ timeout: 30_000 });
        await txnnButton.click();

        await fillTxnnField(
            page,
            page.getByPlaceholder(/ho va ten|họ và tên/i),
            recipient.receiverName
        );
        await fillTxnnField(
            page,
            page.getByPlaceholder(/0901234567/i),
            recipient.phone
        );
        await fillTxnnField(
            page,
            page.getByPlaceholder(/so nha|số nhà|duong|đường|phuong|phường|quan|quận/i),
            recipient.deliveryAddress || ''
        );

        await attachPageState(page, testInfo, 'mlbl-txnn-form-filled');

        const assistantOrderButton = page
            .getByRole('button', {
                name: /de tro ly dat hang|để trợ lý đặt hàng|de tro ly dat giup|để trợ lý đặt giúp/i,
            })
            .first();
        await expect(assistantOrderButton).toBeVisible({ timeout: 30_000 });
        await expect(assistantOrderButton).toBeEnabled({ timeout: 30_000 });
        await assistantOrderButton.click();

        await attachPageState(page, testInfo, 'mlbl-after-assistant-order-click');

        const paidDoneButton = page
            .getByRole('button', {
                name: /popup chua tu dong\? bao da thanh toan xong|popup chưa tự đóng\? báo đã thanh toán xong/i,
            })
            .or(
                page.getByText(
                    /popup chua tu dong\? bao da thanh toan xong|popup chưa tự đóng\? báo đã thanh toán xong/i
                )
            )
            .first();
        await expect(paidDoneButton).toBeVisible({ timeout: mlblAgentWaitMs });
        await paidDoneButton.click();

        const completedTitle = page
            .getByRole('heading', { name: /da dat hang|đã đặt hàng/i })
            .or(page.getByText(/\[?da dat hang\]?|\[?đã đặt hàng\]?/i))
            .first();
        await expect(completedTitle).toBeVisible({ timeout: 30_000 });

        await attachPageState(page, testInfo, 'mlbl-order-completed');
    });
});
