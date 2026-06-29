import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { OrderRecipientFixture } from '../../../fixtures/order-recipient.fixture';
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

const orderProductName = 'Bia Tiger Crystal lốc 6 lon x 330ml';
const mlblAgentWaitMs = Number(process.env.ORDER_AGENT_WAIT_MS || 120_000);

async function clickCheapestStoreBuyButton(
    page: Page,
    storeCase: OrderStoreCase,
    testInfo: TestInfo
): Promise<void> {
    const cheapestBadge = page
        .locator('span.rounded-full.bg-emerald-600')
        .filter({ hasText: /re nhat|rẻ nhất/i });
    const cheapestStoreCard = page
        .locator('li')
        .filter({ has: cheapestBadge })
        .filter({ hasText: storeCase.storeMatcher })
        .first();

    await expect(cheapestStoreCard).toBeVisible({ timeout: 30_000 });

    await testInfo.attach(`${storeCase.chain}-cheapest-store-card`, {
        body: await cheapestStoreCard.screenshot(),
        contentType: 'image/png',
    });

    const buyButton = cheapestStoreCard
        .getByRole('button', { name: /^mua$/i })
        .first();

    await expect(buyButton).toBeVisible({ timeout: 30_000 });
    await buyButton.click();

    await testInfo.attach(`${storeCase.chain}-after-cheapest-buy-click`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
    });
}

async function attachPageState(
    page: Page,
    testInfo: TestInfo,
    name: string
): Promise<void> {
    await testInfo.attach(`${name}-screenshot`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
    });

    await testInfo.attach(`${name}-state`, {
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

async function fillTxnnField(
    page: Page,
    field: ReturnType<Page['locator']>,
    value: string
): Promise<void> {
    await expect(field).toBeVisible({ timeout: 30_000 });
    await field.fill(value);
    await expect(field).toHaveValue(value, { timeout: 5_000 });
}

test.describe('@flow-order Order recipient form config', () => {
    test('should keep each store form configurable with receiver and phone fields', () => {
        for (const storeCase of orderStoreCases) {
            const fieldSources = storeCase.fields.map(field => field.source);

            expect(fieldSources).toContain('receiverName');
            expect(fieldSources).toContain('phone');
            expect(OrderRecipientFixture[storeCase.chain].receiverName).toBeTruthy();
            expect(OrderRecipientFixture[storeCase.chain].phone).toBeTruthy();
        }
    });

    test('should resolve field values from store-specific recipient data', () => {
        const coopCase = getOrderStoreCase('coop');

        expect(resolveFieldValue(coopCase.fields[0], OrderRecipientFixture.coop)).toBe(
            OrderRecipientFixture.coop.receiverName
        );
    });

    test('should read agent runtime options from environment with safe defaults', () => {
        const options = getOrderFlowRuntimeOptions({});

        expect(options.clickFinalCta).toBeFalsy();
        expect(options.interactive).toBeFalsy();
        expect(options.agentWaitMs).toBe(30_000);
    });
});

test.describe('@flow-order Prepare order by store', () => {
    for (const storeCase of orderStoreCases.filter(candidate => candidate.chain !== 'mlbl')) {
        test(`${storeCase.tag} should fill recipient form and capture agentic order state`, async ({
            page,
        }, testInfo) => {
            const runtimeOptions = getOrderFlowRuntimeOptions();
            const recipient = OrderRecipientFixture[storeCase.chain];
            const orderFlow = new OrderFlowComponent(page);
            const orderForm = new OrderFormComponent(page);

            test.skip(
                runtimeOptions.clickFinalCta &&
                storeCase.chain === 'coop' &&
                !recipient.coopPassword,
                'COOP_PASSWORD is required before clicking the final Coop CTA'
            );

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
            await orderForm.attachFilledFormScreenshot(testInfo, storeCase.chain);

            const finalCta = orderForm.finalCta(storeCase);
            await expect(finalCta).toBeVisible({ timeout: 30_000 });

            if (!runtimeOptions.clickFinalCta) {
                await orderFlow.attachAgentState(
                    testInfo,
                    `${storeCase.chain}-final-cta-ready`
                );
                return;
            }

            await finalCta.click();
            await orderFlow.attachAgentState(
                testInfo,
                `${storeCase.chain}-after-final-cta-click`
            );

            await orderFlow.expectAgenticAiPopup();
            await orderFlow.attachAgentState(
                testInfo,
                `${storeCase.chain}-agentic-ai-visible`
            );

            await page.waitForTimeout(runtimeOptions.agentWaitMs);
            await orderFlow.attachAgentState(
                testInfo,
                `${storeCase.chain}-agentic-ai-after-wait`
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
