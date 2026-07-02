# BHX Order Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated `@flow-order @bhx` Playwright flow for Bách Hóa Xanh without changing Co.op, MLBL, or other store flows.

**Architecture:** Keep BHX-specific product, recipient, delivery slot, and store selection data in fixtures so it can be edited through env overrides. Add small BHX helpers in `flow-order.spec.ts` for cheapest-store selection, delivery slot selection, popup capture, and agent wait screenshots. Remove BHX from the generic store loop to prevent duplicate or conflicting behavior.

**Tech Stack:** Playwright Test, TypeScript fixtures, existing report attachment utilities.

---

### Task 1: Add BHX Data Coverage

**Files:**
- Modify: `fixtures/order-recipient.fixture.ts`
- Modify: `tests/e2e/order/flow-order.spec.ts`

- [ ] **Step 1: Write the failing test**

Add assertions that `OrderRecipientFixture.bhx` contains `Trạch`, `0305070809`, the Tân Túc delivery address, and a BHX-specific delivery slot.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/order/flow-order.spec.ts -g "should keep BHX recipient defaults"`
Expected: FAIL because BHX still uses the shared default recipient.

- [ ] **Step 3: Write minimal implementation**

Update `OrderRecipientData` with optional `deliverySlot`, and set BHX defaults with env overrides:
`ORDER_BHX_RECEIVER_NAME`, `ORDER_BHX_RECEIVER_PHONE`, `ORDER_BHX_DELIVERY_ADDRESS`, `ORDER_BHX_DELIVERY_SLOT`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/e2e/order/flow-order.spec.ts -g "should keep BHX recipient defaults"`
Expected: PASS.

### Task 2: Add Dedicated BHX Flow

**Files:**
- Modify: `tests/e2e/order/flow-order.spec.ts`

- [ ] **Step 1: Write the failing test**

Add a DOM-backed Playwright test proving the BHX helper selects the card with both `Bách Hóa Xanh` and `rẻ nhất`, clicks `Mua ngay`, chooses the `Trong hôm nay` slot, and selects the `rẻ nhất` store inside the delivery-store area.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/order/flow-order.spec.ts -g "should select BHX cheapest buy and delivery options"`
Expected: FAIL because the BHX helper functions do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add helpers in `flow-order.spec.ts`:
`clickBhxCheapestStoreBuyButton`, `selectBhxDeliverySlot`, `selectBhxCheapestDeliveryStore`, and `captureBhxAgentStateAfterClick`.

- [ ] **Step 4: Add live BHX spec**

Add `test.describe('@flow-order @bhx Bách Hóa Xanh order flow')` that searches `Trà xanh Không Độ chanh 455ml`, selects the cheapest BHX card, fills the BHX form, captures popup/form state, finds `Để trợ lý đặt giúp →`, optionally clicks it via `ORDER_FLOW_CLICK_FINAL_CTA`, waits for the agent with `ORDER_AGENT_WAIT_MS`, and captures the processing state.

- [ ] **Step 5: Exclude BHX from generic loop**

Change the generic loop filter to exclude `bhx` along with `coop` and `mlbl`.

- [ ] **Step 6: Run focused checks**

Run:
`npx playwright test tests/e2e/order/flow-order.spec.ts -g "BHX recipient defaults|select BHX cheapest buy and delivery options"`
Expected: PASS.

Run:
`npx eslint tests/e2e/order/flow-order.spec.ts fixtures/order-recipient.fixture.ts`
Expected: PASS.
