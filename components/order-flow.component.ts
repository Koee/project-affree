import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import { type OrderStoreCase } from '../fixtures/order-store-form.fixture';

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

        const suggestion = this.page
            .locator('li button, [role="option"], [data-testid*="address"], [data-testid*="location"]')
            .filter({
                hasText: /dong da|đống đa|tan son hoa|tân sơn hòa|ho chi minh|hồ chí minh/i,
            })
            .first();

        if (await suggestion.isVisible({ timeout: 15_000 }).catch(() => false)) {
            await suggestion.click({ force: true });
        }

        await this.closeLocationDropdown(openedBy, suggestion);
    }

    private async closeLocationDropdown(
        chooseLocationButton: Locator,
        suggestion: Locator
    ): Promise<void> {
        await this.page.keyboard.press('Escape').catch(() => undefined);
        await this.page.mouse.click(20, 90).catch(() => undefined);

        if (await suggestion.isVisible({ timeout: 1_000 }).catch(() => false)) {
            await chooseLocationButton.click().catch(() => undefined);
        }

        await expect(suggestion).toBeHidden({ timeout: 5_000 }).catch(() => undefined);
    }

    async selectCheapestTab(): Promise<void> {
        const cheapestTab = this.page
            .getByRole('tab', { name: /re nhat|rẻ nhất/i })
            .or(this.page.getByRole('button', { name: /re nhat|rẻ nhất/i }))
            .or(this.page.getByText(/re nhat|rẻ nhất/i))
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

        if (await orderFormMarker.isVisible({ timeout: 3_000 }).catch(() => false)) {
            return;
        }

        const cartButton = this.page
            .getByRole('button', { name: /gio hang|giỏ hàng/i })
            .first();

        if (await cartButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await cartButton.click();
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
