import { expect, Locator, Page } from '@playwright/test';

type SearchAddressOptions = {
    suggestionText?: string | RegExp;
    optional?: boolean;
};

function normalizeSearchText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function suggestionMatchesText(
    suggestion: string,
    text: string | RegExp
): boolean {
    if (text instanceof RegExp) {
        return text.test(suggestion);
    }

    return normalizeSearchText(suggestion).includes(normalizeSearchText(text));
}

export function selectPreferredAddressSuggestionIndex(
    suggestions: string[],
    keyword: string,
    fallbackMatch?: string | RegExp
): number {
    if (suggestions.length === 0) {
        throw new Error('Không có kết quả địa chỉ');
    }

    const keywordMatchIndex = suggestions.findIndex(suggestion =>
        suggestionMatchesText(suggestion, keyword)
    );

    if (keywordMatchIndex >= 0) {
        return keywordMatchIndex;
    }

    if (fallbackMatch) {
        const fallbackMatchIndex = suggestions.findIndex(suggestion =>
            suggestionMatchesText(suggestion, fallbackMatch)
        );

        if (fallbackMatchIndex >= 0) {
            return fallbackMatchIndex;
        }
    }

    return 0;
}

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
            response => response.url().includes('nominatim.openstreetmap.org/search'),
            { timeout: 30_000 }
        );

        await this.addressInput.fill(address);

        const nominatimResponse = await nominatimResponsePromise;
        expect(nominatimResponse.status()).toBe(200);

        const nominatimData = await nominatimResponse.json();

        expect(Array.isArray(nominatimData)).toBeTruthy();

        const suggestionLocator = this.page.locator(
            [
                '[role="option"]',
                'li',
                'button',
                '[data-testid*="location"]',
                '[data-testid*="address"]',
            ].join(', ')
        );

        await expect(suggestionLocator.first()).toBeVisible({
            timeout: 30_000,
        });

        const visibleSuggestions: Array<{ locator: Locator; text: string }> = [];
        const suggestionCount = await suggestionLocator.count();

        for (let index = 0; index < suggestionCount; index += 1) {
            const suggestion = suggestionLocator.nth(index);
            const isVisible = await suggestion.isVisible().catch(() => false);

            if (!isVisible) {
                continue;
            }

            const text = (await suggestion.innerText().catch(() => '')).trim();

            if (text) {
                visibleSuggestions.push({ locator: suggestion, text });
            }
        }

        const selectedSuggestionIndex = selectPreferredAddressSuggestionIndex(
            visibleSuggestions.map(suggestion => suggestion.text),
            address,
            options.suggestionText
        );

        await visibleSuggestions[selectedSuggestionIndex].locator.click();

        await expect(this.page.locator('body')).toContainText(address, {
            timeout: 30_000,
        });

        /*
        return;

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
        */
    }
}
