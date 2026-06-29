import { expect, Locator, Page } from '@playwright/test';

export class ProductSearchComponent {
    constructor(private readonly page: Page) { }

    get searchInput(): Locator {
        return this.page
            .locator(
                [
                    'input[placeholder*="Tìm sản phẩm"]',
                    'input[placeholder*="Tìm"]',
                    'input[placeholder*="sản phẩm"]',
                    'input[type="search"]',
                    'input[type="text"]',
                ].join(', ')
            )
            .first();
    }

    productOption(productName: string): Locator {
        return this.page
            .locator(
                [
                    '[role="option"]',
                    '[data-testid*="product"]',
                    'a',
                    'button',
                    'li',
                ].join(', ')
            )
            .filter({
                hasText: productName,
            })
            .first();
    }

    async searchAndSelectProduct(productName: string) {
        await expect(this.searchInput).toBeVisible({ timeout: 30_000 });
        await this.searchInput.fill(productName);

        const option = this.productOption(productName);
        await expect(option).toBeVisible({ timeout: 30_000 });
        await option.click();
    }
}
