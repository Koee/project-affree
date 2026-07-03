import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import { type OrderStoreCase } from '../fixtures/order-store-form.fixture';
import { selectPreferredAddressSuggestionIndex } from './location.component';

export class OrderFlowComponent {
    constructor(private readonly page: Page) { }

    get searchInput(): Locator {
        return this.page
            .getByPlaceholder(/tim san pham|tìm sản phẩm/i)
            .or(this.page.locator('input[type="search"]'))
            .or(this.page.locator('input[type="text"]'))
            .first();
    }

    async openHome(
        url = process.env.ORDER_FLOW_BASE_URL || 'https://affree.timdaythay.com/'
    ): Promise<void> {
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    }

    async searchAndSelectProduct(productName: string): Promise<void> {
        await expect(this.searchInput).toBeVisible({ timeout: 30_000 });
        await this.searchInput.fill(productName);

        const exactProduct = this.productResult(productName);
        const firstProduct = this.firstProductResult();
        const product = (await exactProduct.isVisible({ timeout: 10_000 }).catch(() => false))
            ? exactProduct
            : firstProduct;

        await expect(product).toBeVisible({ timeout: 30_000 });
        await product.click({ timeout: 30_000 });
    }

    async selectLocationIfAvailable(address?: string): Promise<void> {
        if (!address) {
            return;
        }

        const addressInput = this.page
            .getByPlaceholder(/VD: 123|Le Loi|Lê Lợi|dia chi|địa chỉ/i)
            .or(this.page.locator('input[type="text"]'))
            .first();

        const locationTriggers = [
            this.page.getByRole('button', { name: /nhap dia chi|nhập địa chỉ/i }).first(),
            this.page.getByRole('button', { name: /chon vi tri|chọn vị trí/i }).first(),
        ];

        let openedLocationInput = false;
        let openedBy = locationTriggers[0];

        for (const trigger of locationTriggers) {
            const canClick = await trigger.isVisible({ timeout: 3_000 }).catch(() => false);

            if (!canClick) {
                continue;
            }

            await trigger.click();

            if (await addressInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
                openedLocationInput = true;
                openedBy = trigger;
                break;
            }
        }

        if (!openedLocationInput) {
            return;
        }

        await addressInput.fill(address);

        const selectedSuggestion = await this.preferredLocationSuggestion(
            address,
            addressInput
        );

        if (await selectedSuggestion.isVisible({ timeout: 15_000 }).catch(() => false)) {
            await selectedSuggestion.click({ force: true });
        }

        await this.closeLocationDropdown(openedBy, selectedSuggestion, addressInput);
    }

    private async preferredLocationSuggestion(
        address: string,
        addressInput: Locator
    ): Promise<Locator> {
        const overlay = this.page
            .locator('.fixed.inset-0')
            .filter({ has: addressInput })
            .first();
        const root = (await overlay.isVisible({ timeout: 1_000 }).catch(() => false))
            ? overlay
            : this.page.locator('body');
        const suggestionCandidates = root.locator(
            'li button, [role="option"], [data-testid*="address"], [data-testid*="location"]'
        );

        await expect(suggestionCandidates.first())
            .toBeVisible({ timeout: 15_000 })
            .catch(() => undefined);

        const visibleSuggestions: Array<{ locator: Locator; text: string }> = [];
        const suggestionCount = await suggestionCandidates.count();

        for (let index = 0; index < suggestionCount; index += 1) {
            const suggestion = suggestionCandidates.nth(index);
            const isVisible = await suggestion.isVisible().catch(() => false);

            if (!isVisible) {
                continue;
            }

            const text = (await suggestion.innerText().catch(() => '')).trim();

            if (text) {
                visibleSuggestions.push({ locator: suggestion, text });
            }
        }

        if (visibleSuggestions.length === 0) {
            return this.page.locator('__missing_location_suggestion__');
        }

        const selectedSuggestionIndex = selectPreferredAddressSuggestionIndex(
            visibleSuggestions.map(suggestion => suggestion.text),
            address,
            /nguyen trong tuyen|phu nhuan|ho chi minh/i
        );

        return visibleSuggestions[selectedSuggestionIndex].locator;
    }

    private async closeLocationDropdown(
        _chooseLocationButton: Locator,
        suggestion: Locator,
        addressInput: Locator
    ): Promise<void> {
        await this.page.keyboard.press('Escape').catch(() => undefined);
        await this.page.mouse.click(20, 90).catch(() => undefined);

        await expect(suggestion).toBeHidden({ timeout: 5_000 }).catch(() => undefined);

        const blockingOverlay = this.page
            .locator('.fixed.inset-0')
            .filter({ has: addressInput })
            .first()
            .or(this.page.locator('header .fixed.inset-0').first())
            .first();

        if (await blockingOverlay.isVisible({ timeout: 1_000 }).catch(() => false)) {
            await this.dismissLocationOverlay(blockingOverlay);
        }
    }

    private async dismissLocationOverlay(blockingOverlay: Locator): Promise<void> {
        for (let attempt = 0; attempt < 3; attempt += 1) {
            if (!(await blockingOverlay.isVisible({ timeout: 1_000 }).catch(() => false))) {
                return;
            }

            await this.page.keyboard.press('Escape').catch(() => undefined);

            const closeButton = blockingOverlay
                .getByRole('button', { name: /dong|đóng|close|huy|hủy|x/i })
                .or(blockingOverlay.locator('button[aria-label], button[title]').first())
                .first();

            if (await closeButton.isVisible({ timeout: 1_000 }).catch(() => false)) {
                await closeButton.click({ force: true }).catch(() => undefined);
            }

            if (!(await blockingOverlay.isVisible({ timeout: 1_000 }).catch(() => false))) {
                return;
            }

            if (await blockingOverlay.isVisible({ timeout: 1_000 }).catch(() => false)) {
                const panelBox = await blockingOverlay
                    .locator('div')
                    .first()
                    .boundingBox()
                    .catch(() => undefined);

                if (panelBox) {
                    await this.page.mouse
                        .click(panelBox.x + panelBox.width - 28, panelBox.y + 28)
                        .catch(() => undefined);
                }
            }
        }

        await expect(blockingOverlay).toBeHidden({ timeout: 5_000 });
    }

    async selectCheapestTab(): Promise<void> {
        const cheapestTab = this.page
            .getByRole('tab', { name: /re nhat|rẻ nhất/i })
            .or(
                this.page
                    .locator('button')
                    .filter({ hasText: /gia re|giá rẻ|re nhat|rẻ nhất/i })
            )
            .first();

        if (await cheapestTab.isVisible({ timeout: 15_000 }).catch(() => false)) {
            await cheapestTab.click();
        }
    }

    async clickBuyForStore(storeCase: OrderStoreCase): Promise<void> {
        const storeCard = await this.findStoreCard(storeCase.storeMatcher);

        await expect(storeCard).toBeVisible({ timeout: 30_000 });

        const buyButton = storeCard
            .getByRole('button', { name: /mua|chon mua|chọn mua/i })
            .or(storeCard.getByText(/mua|chon mua|chọn mua/i))
            .first();

        await expect(buyButton).toBeVisible({ timeout: 30_000 });
        await buyButton.click();
    }

    async openCartIfOrderFormMissing(): Promise<void> {
        const orderFormMarker = this.page
            .getByText(/nguoi nhan|người nhận|so dien thoai|số điện thoại|de tro ly dat giup|để trợ lý đặt giúp/i)
            .first();

        if (await orderFormMarker.isVisible({ timeout: 5_000 }).catch(() => false)) {
            return;
        }

        const cartButton = this.page
            .getByRole('button', { name: /gio hang|giỏ hàng/i })
            .first();

        for (let attempt = 1; attempt <= 3; attempt += 1) {
            if (await orderFormMarker.isVisible({ timeout: 2_000 }).catch(() => false)) {
                return;
            }

            if (!(await cartButton.isVisible({ timeout: 5_000 }).catch(() => false))) {
                return;
            }

            await cartButton.click();

            const dialogOpened = await this.page
                .locator('[role="dialog"]')
                .last()
                .isVisible({ timeout: 5_000 })
                .catch(() => false);

            if (
                dialogOpened ||
                (await orderFormMarker.isVisible({ timeout: 3_000 }).catch(() => false))
            ) {
                return;
            }

            await this.page.waitForTimeout(1_000);
        }
    }

    async expectAgenticAiPopup(): Promise<void> {
        await expect(this.page.locator('body')).toContainText(/Phuc vu boi Agentic AI|Phục vụ bởi Agentic AI/i, {
            timeout: 30_000,
        });
    }

    async attachAgentState(
        testInfo: TestInfo,
        name: string
    ): Promise<void> {
        await testInfo.attach(`${name}-screenshot`, {
            body: await this.page.screenshot({ fullPage: true }),
            contentType: 'image/png',
        });

        await testInfo.attach(`${name}-state`, {
            body: JSON.stringify(
                {
                    url: this.page.url(),
                    text: (await this.page.locator('body').innerText()).slice(0, 10_000),
                },
                null,
                2
            ),
            contentType: 'application/json',
        });
    }

    private productResult(productName: string): Locator {
        return this.page
            .locator('[role="option"], [data-testid*="product"], a, button, li')
            .filter({ hasText: productName })
            .first();
    }

    private firstProductResult(): Locator {
        return this.page
            .locator('[role="option"], [data-testid*="product"], a, button, li')
            .filter({ hasText: /bia|tiger|crystal/i })
            .first();
    }

    private async findStoreCard(storeMatcher: RegExp): Promise<Locator> {
        const candidates = this.page
            .locator(
                [
                    'li',
                    'article',
                    '[data-testid*="store"]',
                    '[data-testid*="product"]',
                    '.store-card',
                    '.product-card',
                ].join(', ')
            )
            .filter({ hasText: storeMatcher });

        const count = await candidates.count();

        for (let index = 0; index < count; index += 1) {
            const candidate = candidates.nth(index);
            const hasBuyButton = await candidate
                .getByRole('button', { name: /mua|chon mua|chọn mua/i })
                .first()
                .isVisible()
                .catch(() => false);

            if (hasBuyButton) {
                return candidate;
            }
        }

        return candidates.first();
    }
}
