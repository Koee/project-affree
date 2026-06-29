import { expect, Locator, Page } from '@playwright/test';

type SearchAddressOptions = {
    suggestionText?: string | RegExp;
    optional?: boolean;
};

export class LocationComponent {
    constructor(private readonly page: Page) { }

    get chooseLocationButton(): Locator {
        return this.page
            .locator(
                [
                    'button:has-text("Chọn vị trí")',
                    'button:has-text("Nhập địa chỉ")',
                ].join(', ')
            )
            .first();
    }

    get addressInput(): Locator {
        return this.page
            .locator(
                [
                    'input[placeholder*="VD: 123 Lê Lợi"]',
                    'input[placeholder*="Lê Lợi"]',
                    'input[placeholder*="địa chỉ"]',
                    'input[type="search"]',
                    'input[type="text"]',
                ].join(', ')
            )
            .first();
    }

    async searchAndSelectAddress(address: string, options: SearchAddressOptions = {}) {
        await this.page.waitForLoadState('domcontentloaded');

        if (options.optional) {
            const canChooseLocation = await this.chooseLocationButton
                .isVisible({ timeout: 5_000 })
                .catch(() => false);

            if (!canChooseLocation) {
                return;
            }
        }

        await expect(this.chooseLocationButton).toBeVisible({
            timeout: 30_000,
        });

        await this.chooseLocationButton.click();

        await expect(this.addressInput).toBeVisible({
            timeout: 30_000,
        });

        const nominatimResponsePromise = this.page.waitForResponse(
            response =>
                response.url().includes('nominatim.openstreetmap.org/search') &&
                response.status() === 200,
            { timeout: 30_000 }
        );

        await this.addressInput.fill(address);

        const nominatimResponse = await nominatimResponsePromise;
        const nominatimData = await nominatimResponse.json();

        expect(Array.isArray(nominatimData)).toBeTruthy();
        expect(nominatimData.length).toBeGreaterThan(0);

        const firstSuggestion = this.page
            .locator(
                [
                    '[role="option"]',
                    'li',
                    'button',
                    '[data-testid*="location"]',
                    '[data-testid*="address"]',
                ].join(', ')
            )
            .filter({
                hasText: options.suggestionText ?? /đống đa|dong da|hồ chí minh|ho chi minh|tp\.?hcm/i,
            })
            .first();

        await expect(firstSuggestion).toBeVisible({
            timeout: 30_000,
        });

        await firstSuggestion.click();

        await expect(this.page.locator('body')).toContainText(address, {
            timeout: 30_000,
        });
    }
}
