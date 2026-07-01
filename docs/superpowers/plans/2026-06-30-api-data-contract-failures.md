# API Data Contract Failures Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the six failing `api-data-contract` tests by aligning tests and shared assertions with the current API contract, while preserving real contract failure signal.

**Architecture:** Keep API request wrappers in `utils/api-client.ts`, reusable response/data assertions in `utils/data-assertions.ts`, and endpoint-specific contract expectations in `tests/api/data-contract/*.spec.ts`. Do not introduce UI locators because these failures come from Playwright `request` API tests, not browser/page tests.

**Tech Stack:** Playwright Test, TypeScript, Node fetch for investigation, `.env.demo` target `https://gia-quanh-day.vercel.app`.

---

## Evidence Summary

- Command under investigation: `npx playwright test --project=api-data-contract --grep '@p0.*@contract'`
- Current result: 11 passed, 6 failed.
- The failing tests are API contract tests. They use `request`, `ApiClient`, and response/data assertions. They do not use `page`, UI selectors, or locators.
- `/api/buyer` negative payloads currently return HTTP `200` with body `{"ok":true,"persisted":"sheet","upstream":"{\"ok\":true,\"mode\":\"update\"}"}`.
- `/api/catalog` returns `products` with `id` and `name`. Product objects do not expose `code`.
- The duplicate-code test fails because all `product.code` values are `undefined`: `uniqueValues.size` is `1`, `products.length` is `364`.

## File Structure

- Modify: `tests/api/data-contract/order.contract.spec.ts`
  - Decide whether negative `/api/buyer` cases are expected to fail as API defects or should be softened to documented current behavior.
- Modify: `tests/api/data-contract/products.contract.spec.ts`
  - Replace `code` assumptions with the actual product identifier field `id`.
- Modify: `utils/data-assertions.ts`
  - Improve reusable uniqueness assertion so field-mismatch failures report missing keys and duplicates clearly.
- Optional modify: `utils/api-client.ts`
  - Keep `expectHttpValidationError` if API should reject invalid buyer payloads.
  - Add a neutral response attachment helper only if negative buyer tests need richer diagnostics.

---

### Task 1: Confirm API Contract Decision for `/api/buyer`

**Files:**
- Review: `tests/api/data-contract/order.contract.spec.ts`
- Review: `utils/api-client.ts`
- No code change until the product/API expectation is confirmed.

- [ ] **Step 1: Re-run only the buyer negative tests**

Run:

```powershell
npx playwright test tests/api/data-contract/order.contract.spec.ts --project=api-data-contract --grep 'validate|XSS'
```

Expected current output: 4 failures, all expecting `[400, 422]` but receiving `200`.

- [ ] **Step 2: Confirm desired contract**

Decision A: Invalid buyer payloads must be rejected by the API.

Keep the current tests as valid defect detectors. Do not loosen test expectations. File an API bug against `/api/buyer`:

```text
Endpoint accepts invalid buyer payloads with HTTP 200:
- empty name
- invalid phone
- empty address
- XSS-like name

Expected: 400 or 422 validation error.
Actual: 200 {"ok":true,"persisted":"sheet","upstream":"{\"ok\":true,\"mode\":\"update\"}"}
```

Decision B: Current API intentionally accepts and persists all buyer payloads.

Rename/rewrite these four tests so they document current behavior instead of expecting validation errors. Example target behavior:

```ts
expect(response.status()).toBe(200);
expect(response.headers()['content-type']).toContain('application/json');
const body = await response.json();
expect(body.ok).toBeTruthy();
expect(body.persisted).toBe('sheet');
```

- [ ] **Step 3: Choose Decision A or B before implementation**

Expected: A clear decision in the task notes. Do not mix both approaches.

---

### Task 2: Fix Product Catalog Identifier Contract

**Files:**
- Modify: `tests/api/data-contract/products.contract.spec.ts`
- Modify: `utils/data-assertions.ts`

- [ ] **Step 1: Write/confirm the failing expectation**

Current failing code:

```ts
expectNoDuplicateByKey(body.products, 'code');
```

Current API product sample:

```json
{
  "id": "milk-vnm-1l",
  "name": "Sua tuoi Vinamilk co duong 1L",
  "brand": "Vinamilk"
}
```

Expected current failure: field `code` is absent, so every mapped value is `undefined`.

- [ ] **Step 2: Update uniqueness check to use `id`**

Replace the duplicate check with:

```ts
expectNoDuplicateByKey(body.products, 'id');
```

- [ ] **Step 3: Update required fields check**

Replace:

```ts
expect(product.code).toBeTruthy();
expect(product.name).toBeTruthy();
```

with:

```ts
expect(product.id).toBeTruthy();
expect(product.name).toBeTruthy();
```

- [ ] **Step 4: Run only catalog contract tests**

Run:

```powershell
npx playwright test tests/api/data-contract/products.contract.spec.ts --project=api-data-contract
```

Expected: 3 passed.

---

### Task 3: Improve Reusable Assertion Diagnostics

**Files:**
- Modify: `utils/data-assertions.ts`

- [ ] **Step 1: Improve missing-key signal before checking duplicates**

Current helper:

```ts
export function expectNoDuplicateByKey<T>(
    items: T[],
    key: keyof T
) {
    const values = items.map((item) => item[key]);
    const uniqueValues = new Set(values);

    expect(uniqueValues.size).toBe(values.length);
}
```

Replace with a version that fails clearly when a key is absent:

```ts
export function expectNoDuplicateByKey<T extends Record<string, unknown>>(
    items: T[],
    key: keyof T
) {
    const missingKeyItems = items.filter((item) => !item[key]);

    expect(
        missingKeyItems,
        `Expected every item to have truthy key "${String(key)}", but ${missingKeyItems.length} item(s) were missing it`
    ).toHaveLength(0);

    const values = items.map((item) => item[key]);
    const uniqueValues = new Set(values);

    expect(
        uniqueValues.size,
        `Expected key "${String(key)}" to be unique, but found ${values.length - uniqueValues.size} duplicate value(s)`
    ).toBe(values.length);
}
```

- [ ] **Step 2: Run catalog contract tests**

Run:

```powershell
npx playwright test tests/api/data-contract/products.contract.spec.ts --project=api-data-contract
```

Expected after Task 2: 3 passed.

---

### Task 4: Verify Full P0 Contract Suite

**Files:**
- Verify: `tests/api/data-contract/*.contract.spec.ts`
- Verify: `utils/api-client.ts`
- Verify: `utils/data-assertions.ts`

- [ ] **Step 1: Run all current P0 contract tests**

Run:

```powershell
npx playwright test --project=api-data-contract --grep '@p0.*@contract'
```

Expected if `/api/buyer` Decision A is chosen: product catalog failures are fixed, 4 buyer validation failures remain and are tracked as API defects.

Expected if `/api/buyer` Decision B is chosen: all 17 tests pass after rewriting buyer expectations.

- [ ] **Step 2: Check report**

Run:

```powershell
npx playwright show-report artifacts/report/playwright
```

Expected: report matches the chosen contract decision.

---

## Reuse and Cleanup Notes

- Keep using `ApiClient` for endpoint wrappers. It is useful and not redundant.
- Keep `expectJsonResponse` and `expectHtmlResponse`; they are small and reused by contract tests.
- Keep `expectHttpValidationError` only if invalid buyer payloads are supposed to be rejected. If Decision B is chosen and no other tests use it, it becomes unused and should be removed or replaced by a neutral `attachResponseBody` helper.
- `expectNoDuplicateByKey` is useful but currently too opaque. Improve it instead of duplicating uniqueness assertions inside each spec.

## Self-Review

- Spec coverage: Covers all 6 failures: 4 buyer validation failures and 2 product catalog schema failures.
- Placeholder scan: No placeholder implementation steps remain.
- Type consistency: Product identifier is consistently `id`; old `code` assumption is limited to the evidence section.
