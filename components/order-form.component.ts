import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import {
    type OrderFormField,
    type OrderStoreCase,
} from '../fixtures/order-store-form.fixture';
import { type OrderRecipientData } from '../fixtures/order-recipient.fixture';

export type OrderFlowRuntimeOptions = {
    clickFinalCta: boolean;
    interactive: boolean;
    agentWaitMs: number;
};

export function getOrderFlowRuntimeOptions(
    env: NodeJS.ProcessEnv = process.env
): OrderFlowRuntimeOptions {
    return {
        clickFinalCta: env.ORDER_FLOW_CLICK_FINAL_CTA === 'true',
        interactive: env.ORDER_FLOW_INTERACTIVE === 'true',
        agentWaitMs: Number(env.ORDER_AGENT_WAIT_MS || 30_000),
    };
}

export function resolveFieldValue(
    field: OrderFormField,
    recipient: OrderRecipientData
): string {
    const value = recipient[field.source];

    if (field.required && !value) {
        throw new Error(`Missing required order recipient value: ${field.source}`);
    }

    return value || '';
}

function labelToPlaceholderPattern(label: RegExp): RegExp {
    return new RegExp(label.source, label.flags.includes('i') ? 'i' : undefined);
}

export class OrderFormComponent {
    constructor(private readonly page: Page) { }

    finalCta(storeCase: OrderStoreCase): Locator {
        return this.page
            .getByRole('button', { name: storeCase.finalCta })
            .or(this.page.getByText(storeCase.finalCta))
            .first();
    }

    async fillStoreForm(
        storeCase: OrderStoreCase,
        recipient: OrderRecipientData
    ): Promise<void> {
        for (const field of storeCase.fields) {
            const value = resolveFieldValue(field, recipient);

            if (!value) {
                continue;
            }

            await this.fillField(field, value);
        }
    }

    async expectStoreFormReady(
        storeCase: OrderStoreCase,
        testInfo: TestInfo
    ): Promise<void> {
        const marker = this.page
            .getByText(/nguoi nhan|người nhận|so dien thoai|số điện thoại/i)
            .or(this.finalCta(storeCase))
            .first();
        const isReady = await marker.isVisible({ timeout: 10_000 }).catch(() => false);

        if (isReady) {
            return;
        }

        await testInfo.attach(`${storeCase.chain}-order-form-missing`, {
            body: await this.page.screenshot({ fullPage: true }),
            contentType: 'image/png',
        });

        await testInfo.attach(`${storeCase.chain}-order-form-missing-state`, {
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

        throw new Error(
            `Order form did not open for ${storeCase.chain} after clicking Mua/cart`
        );
    }

    async increaseQuantityUntilMinTotal(
        minTotal: number,
        maxQuantity = 12
    ): Promise<void> {
        for (let quantity = 1; quantity < maxQuantity; quantity += 1) {
            const currentTotal = await this.currentVisibleTotal();

            if (currentTotal !== undefined && currentTotal >= minTotal) {
                return;
            }

            const increaseButton = this.page
                .getByRole('button', { name: /tang|tăng|\+/i })
                .first();
            const canIncrease = await increaseButton.isVisible().catch(() => false);

            if (!canIncrease) {
                return;
            }

            await increaseButton.click();
        }
    }

    async attachFilledFormScreenshot(
        testInfo: TestInfo,
        chain: string
    ): Promise<void> {
        await testInfo.attach(`${chain}-form-filled`, {
            body: await this.page.screenshot({ fullPage: true }),
            contentType: 'image/png',
        });
    }

    private async fillField(field: OrderFormField, value: string): Promise<void> {
        const input = this.fieldLocator(field);

        await expect(input).toBeVisible({ timeout: 30_000 });

        if (field.kind === 'select') {
            await this.selectField(input, value);
            return;
        }

        await input.fill(value);
    }

    private fieldLocator(field: OrderFormField): Locator {
        const placeholderPattern = labelToPlaceholderPattern(field.label);

        return this.page
            .getByLabel(field.label)
            .or(this.page.getByPlaceholder(placeholderPattern))
            .or(
                this.page
                    .locator('label, div, section', { hasText: field.label })
                    .locator('input, textarea, [role="combobox"]')
            )
            .first();
    }

    private async selectField(locator: Locator, value: string): Promise<void> {
        const tagName = await locator.evaluate(element =>
            element.tagName.toLowerCase()
        );

        if (tagName === 'select') {
            await locator.selectOption({ label: value }).catch(async () => {
                await locator.selectOption(value);
            });
            return;
        }

        await locator.click();
        await locator.fill(value).catch(() => undefined);

        const option = this.page
            .getByRole('option', { name: new RegExp(value, 'i') })
            .or(this.page.getByText(new RegExp(value, 'i')))
            .first();

        if (await option.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await option.click();
        }
    }

    private async currentVisibleTotal(): Promise<number | undefined> {
        const bodyText = await this.page.locator('body').innerText();
        const priceMatches = bodyText.match(/([\d.,]+)\s*(?:d|đ|vnd)/gi) || [];
        const totals = priceMatches
            .map(match => Number(match.replace(/[^\d]/g, '')))
            .filter(value => Number.isFinite(value));

        if (totals.length === 0) {
            return undefined;
        }

        return Math.max(...totals);
    }
}
