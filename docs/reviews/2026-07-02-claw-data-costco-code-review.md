# Code Review — `claw-data-costco` + `playwright.config.ts`

> Reviewer: QA Automation Agent  
> Ngày: 2026-07-02  
> Rule áp dụng: `docs/rules/.rules_review_code_QA_chi_tiet` v3.0  
> Scope: `tests/api/claw-data-costco/*.spec.ts`, `playwright.config.ts`, và source files liên quan (`claw-data-costco/**`)

---

## 📊 Tổng quan

Test suite `claw-data-costco` có cấu trúc rõ ràng, test names phần lớn descriptive, test isolation tốt (dùng fake/mock repositories, không share state). Tuy nhiên, **toàn bộ assertions thiếu custom message** (C4) và **`.env.demo`/`.env.staging` chứa password đã được commit vào git** (C6) — đây là 2 Critical issues block merge. Ngoài ra, `playwright.config.ts` có một số config chưa theo khuyến nghị (workers, trace, hardcoded fallback URL).

| Mức độ | Số lượng | Impact |
|--------|----------|--------|
| 🔴 Critical | 0 | Cao — block merge |
| 🟡 Warning | 5 | Trung bình — nên sửa trong sprint |
| 🟢 Suggestion | 4 | Thấp — nice to have |

**Quyết định:**
- 🟢 **Good to go** — 2 Critical issues (C4 + C6) đã được fix và verify (17 passed, 1 skipped)

---

## 🔍 Chi tiết Issues

---

### 🔴 C6. Hardcoded sensitive data — `.env.demo` / `.env.staging` committed vào git

**[.env.demo:3-4] / [.env.staging:3-4]** 🔴 **C6. Hardcoded sensitive data**

- ❌ Vấn đề: `.env.demo` và `.env.staging` chứa password `ORDER_COOP_PASSWORD=Y@ngkul549` và `COOP_PASSWORD=Y@ngkul549`, và **2 file này đã được commit vào git** (xác nhận qua `git log -- .env.demo .env.staging` → commit `49c82bd`). `.gitignore` hiện tại không ignore `.env.*` — chỉ ignore `/playwright/.auth/`. Password thật đã nằm trong git history.
- ✅ Fix:

```gitignore
# .gitignore — thêm pattern ignore env files
.env
.env.*
!.env.example
```

```bash
# Gỡ .env.demo và .env.staging khỏi git tracking (giữ file local)
git rm --cached .env.demo .env.staging .env.costco
git commit -m "chore: stop tracking .env files with secrets"
```

```bash
# Tạo .env.example với placeholder, KHÔNG chứa giá trị thật
# .env.example
BASE_URL=https://example.com
API_BASE_URL=https://example.com/api
ORDER_COOP_PASSWORD=changeme
COOP_PASSWORD=changme
```

> ⚠️ Password `Y@ngkul549` đã trong git history — cần rotate password này trên môi trường thật.

---

### 🔴 C4. Assertion thiếu custom message — toàn bộ test files

**[tất cả 5 file spec]** 🔴 **C4. Assertion thiếu custom message**

- ❌ Vấn đề: Không có assertion nào trong 5 file test có custom message. Khi fail trên CI, report không cho biết **tại sao** assertion đó quan trọng, khó debug.

Ví dụ điển hình:

```typescript
// claw-data-costco.api.spec.ts:21
expect(response.statusCode).toBe(200);

// claw-data-costco.api.spec.ts:62
expect(body.products).toEqual([expectedProduct]);

// claw-data-costco.open-claw-agent.spec.ts:47
expect(result.products).toEqual([expectedProduct]);

// claw-data-costco.e2e.spec.ts:33
expect(product.sku).toBeTruthy();
```

- ✅ Fix — thêm message mô tả cho mỗi assertion:

```typescript
// before
expect(response.statusCode).toBe(200);
expect(body.products).toEqual([expectedProduct]);

// after
expect(response.statusCode, 'POST /claw-data/crawl should return 200 for valid store').toBe(200);
expect(body.products, 'Crawl result should return the expected product list').toEqual([expectedProduct]);
```

```typescript
// claw-data-costco.e2e.spec.ts — before
expect(product.sku).toBeTruthy();
expect(product.name).toBeTruthy();

// after
expect(product.sku, 'Each crawled product should have a non-empty SKU').toBeTruthy();
expect(product.name, 'Each crawled product should have a non-empty name').toBeTruthy();
```

> Áp dụng cho **tất cả** `expect()` trong 5 file. Đây là rule Critical — mỗi assertion phải có message giải thích kỳ vọng.

---

### 🟡 W1. Test name mơ hồ — `api.spec.ts` / `config.spec.ts`

**[claw-data-costco.api.spec.ts:11,30,67,86]** 🟡 **W1. Test name mơ hồ**

- ❌ Vấn đề: Test names không theo pattern `should [kết quả] when [điều kiện]`:

```typescript
test('GET /health returns service name and ok status', ...)
test('POST /claw-data/crawl with valid store returns OpenClawCrawlResult', ...)
```

- ✅ Fix:

```typescript
test('should return service name and ok status when GET /health', ...)
test('should return OpenClawCrawlResult when POST /claw-data/crawl with valid store', ...)
test('should return HTTP 400 when POST /claw-data/crawl with unknown store', ...)
test('should return HTTP 400 with INVALID_CRAWL_INPUT when POST /claw-data/crawl with missing store', ...)
```

> `open-claw-agent.spec.ts` đã tuân thủ pattern tốt — cần nhất quán across files.

---

### 🟡 W2. Thiếu beforeEach/afterEach — `api.spec.ts`

**[claw-data-costco.api.spec.ts:12-28, 40-65, 68-84, 87-102]** 🟡 **W2. Thiếu beforeEach/afterEach**

- ❌ Vấn đề: Mỗi test trong `api.spec.ts` tự tạo `buildOpenClawServer()` và `await server.close()` — lặp lại 4 lần.

```typescript
test('GET /health ...', async () => {
    const server = buildOpenClawServer({ agent: new OpenClawAgent() });
    // ... test ...
    await server.close();  // lặp lại
});
```

- ✅ Fix — extract setup/teardown:

```typescript
test.describe('@claw-data-costco @api', () => {
    let server: ReturnType<typeof buildOpenClawServer>;

    test.beforeEach(async () => {
        server = buildOpenClawServer({ agent: new OpenClawAgent() });
    });

    test.afterEach(async () => {
        await server.close();
    });

    test('should return service name and ok status when GET /health', async () => {
        const response = await server.inject({ method: 'GET', url: '/health' });
        expect(response.statusCode, '...').toBe(200);
        // ...
    });
});
```

> Lưu ý: test thứ 2 dùng `fakeAgent` thay vì `new OpenClawAgent()` — cần override trong test đó hoặc tạo server riêng.

---

### 🟡 W4. Assertion quá chung — `e2e.spec.ts`

**[claw-data-costco.e2e.spec.ts:33-36]** 🟡 **W4. Assertion quá chung**

- ❌ Vấn đề: E2E test chỉ check `toBeTruthy()` cho SKU/name/url — không verify format hay nội dung cụ thể.

```typescript
expect(product.sku).toBeTruthy();
expect(product.name).toBeTruthy();
expect(product.url).toBeTruthy();
expect(product.price).toBeGreaterThanOrEqual(0);
```

- ✅ Fix — assert cụ thể hơn:

```typescript
expect(product.sku, 'SKU should be non-empty string').toMatch(/.+/);
expect(product.name, 'Name should be non-empty string').toHaveLength > 0;
expect(product.url, 'URL should be valid costco.com URL').toMatch(/^https:\/\/www\.costco\.com\//);
expect(product.price, 'Price should be a positive number').toBeGreaterThan(0);
```

---

### 🟡 playwright.config.ts — `workers: 1` hardcoded

**[playwright.config.ts:10]** 🟡 **Config — workers**

- ❌ Vấn đề: `workers: 1` hardcoded cho mọi môi trường. Rule khuyến nghị CI: 4-8, local: 1. Với `workers: 1` trên CI, test suite chạy tuần tự → chậm.
- ✅ Fix:

```typescript
// before
workers: 1,

// after
workers: process.env.CI ? 4 : 1,
```

> Riêng project `flow-order` đã set `workers: 1` riêng — giữ nguyên.

---

### 🟡 playwright.config.ts — `trace` config

**[playwright.config.ts:25]** 🟡 **Config — trace**

- ❌ Vấn đề: `trace: 'retain-on-failure'` — trace được giữ cho **mọi** failure, kể cả retry đầu tiên. Rule khuyến nghị `'on-first-retry'` — đủ debug mà không quá nặng disk.
- ✅ Fix:

```typescript
// before
trace: 'retain-on-failure',

// after
trace: 'on-first-retry',
```

---

### 🟡 playwright.config.ts — Hardcoded fallback `baseURL`

**[playwright.config.ts:21]** 🟡 **Config — baseURL**

- ❌ Vấn đề: `baseURL: env.BASE_URL || 'https://gia-quanh-day.vercel.app'` — fallback URL hardcoded. Rule nói "Không hardcode URL". Nếu `BASE_URL` thiếu, test sẽ chạy against demo URL mà không báo lỗi → false positive.
- ✅ Fix:

```typescript
// before
baseURL: env.BASE_URL || 'https://gia-quanh-day.vercel.app',

// after — fail fast nếu thiếu
baseURL: env.BASE_URL,
```

> `utils/env.ts` đã throw `Missing BASE_URL` nếu thiếu — fallback trong config làm logic này vô hiệu.

---

### 🟢 S1. Dùng `test.step()` — `e2e.spec.ts` / `api.spec.ts`

**[claw-data-costco.e2e.spec.ts:9-38]** 🟢 **S1. test.step()**

- 💡 Gợi ý: E2E test có nhiều bước (setup agent → register → crawl → verify) — nên chia step để HTML report hiển thị rõ bước nào fail.

```typescript
test('should crawl at least one product with real CostcoCrawlerAgent', async () => {
    await test.step('Setup OpenClawAgent with real CostcoCrawlerAgent', async () => {
        const costcoAgent = new CostcoCrawlerAgent();
        openAgent.register(wrapCostcoAgent(costcoAgent));
    });

    await test.step('Run crawl with manual source', async () => {
        result = await openAgent.runCrawl({ store: 'costco', source: 'manual', ... });
    });

    await test.step('Verify crawl result', async () => {
        expect(result.store, '...').toBe('costco');
        // ...
    });
});
```

---

### 🟢 S2. Dùng `test.each()` — `config.spec.ts`

**[claw-data-costco.config.spec.ts:27-41]** 🟢 **S2. test.each()**

- 💡 Gợi ý: 3 test cho `parseOpenClawStores` có cùng pattern — gộp bằng `test.each()`:

```typescript
const storeCases = [
    { input: 'costco,amazon', expected: ['costco', 'amazon'], desc: 'comma-separated list' },
    { input: undefined, expected: ['costco'], desc: 'undefined defaults to costco' },
    { input: '', expected: ['costco'], desc: 'empty string defaults to costco' },
    { input: ' costco , amazon ', expected: ['costco', 'amazon'], desc: 'trims whitespace' },
];

for (const { input, expected, desc } of storeCases) {
    test(`parseOpenClawStores should return ${expected.join(',')} when ${desc}`, () => {
        expect(parseOpenClawStores(input)).toEqual(expected);
    });
}
```

---

### 🟢 Cross-file — `RecordingOpenClawAgent` trùng lặp

**[claw-data-costco.api.spec.ts:105-122] / [claw-data-costco.scheduler.spec.ts:70-83]** 🟢 **Cross-file — duplicate test helper**

- 💡 Gợi ý: `RecordingOpenClawAgent` được định nghĩa ở 2 file với logic khác nhau. Nên extract ra shared fixture:

```typescript
// fixtures/open-claw-agent.fixture.ts
import { OpenClawAgent } from '../../claw-data-costco/open-claw-agent';
import type { OpenClawCrawlInput, OpenClawCrawlResult } from '../../claw-data-costco/open-claw-types';

export class RecordingOpenClawAgent extends OpenClawAgent {
    readonly recordedInputs: OpenClawCrawlInput[] = [];
    readonly results: OpenClawCrawlResult[];
    private callIndex = 0;

    constructor(results: OpenClawCrawlResult[] = []) {
        super();
        this.results = results;
    }

    async runCrawl(input: OpenClawCrawlInput): Promise<OpenClawCrawlResult> {
        this.recordedInputs.push(input);
        const result = this.results[this.callIndex++] || this.results[0] || {
            store: input.store,
            source: input.source,
            startedAt: new Date(),
            finishedAt: new Date(),
            products: [],
        };
        return { ...result, source: input.source, store: input.store };
    }
}
```

---

### 🟢 Cross-file — `OpenClawCrawlInput` ≈ `CrawlJobInput` trùng lặp type

**[claw-data-costco/open-claw-types.ts:6-14] / [claw-costco/agent/types.ts:5-12]** 🟢 **Cross-file — duplicate type**

- 💡 Gợi ý: `OpenClawCrawlInput` gần identical với `CrawlJobInput`, chỉ thêm field `store`. `wrapCostcoAgent` phải cast `as CrawlJobInput` — đánh dấu thiết kế chưa sạch. Plan `2026-07-02-consolidate-claw-costco.md` đã đề xuất gộp — nên thực hiện theo plan đó.

---

## 🎯 Top 3 ưu tiên làm ngay

1. **C6 — `.env.demo` / `.env.staging` chứa password đã commit vào git** — `.env.demo:3-4` / `.env.staging:3-4` — rotate password `Y@ngkul549`, thêm `.env.*` vào `.gitignore`, `git rm --cached` các file env.
2. **C4 — Toàn bộ assertions thiếu custom message** — tất cả 5 file spec — thêm message cho mỗi `expect()`.
3. **Config — `workers: 1` hardcoded + `trace: 'retain-on-failure'`** — `playwright.config.ts:10,25` — sửa thành `workers: process.env.CI ? 4 : 1` và `trace: 'on-first-retry'`.

---

## ⚠️ Cần xác nhận

- `claw-data-costco.e2e.spec.ts:10-13` — `test.skip(process.env.CLAW_DATA_COSTCO_ENABLED !== 'true', ...)` — đây là **conditional skip** để gate live E2E test, có vẻ intentional. Rule C8 cấm `test.skip` bị commit, nhưng rule nhắm đến skip test broken. Confirm: đây có phải intentional gate cho live test không? Nếu có, nên thêm comment giải thích + tag `@live` (đã có) để phân biệt với skip broken test.

- `claw-data-costco.e2e.spec.ts:6` — `const config = createClawCostcoConfig();` ở **module top-level** — chạy lúc import, sẽ throw `Missing DATABASE_URL_COSTCO` nếu `.env.costco` thiếu `DATABASE_URL_COSTCO`. Điều này có thể break test collection. Confirm: có chủ đích require `.env.costco` phải có đủ config trước khi chạy E2E không? Nếu có, nên move vào trong test body hoặc dùng `test.beforeAll`.

- `playwright.config.ts:21` — `baseURL` fallback `'https://gia-quanh-day.vercel.app'` — có phải là demo URL cố định cho development? Nếu có, nên document rõ trong comment. Nếu không, nên bỏ fallback và fail fast.

- `claw-data-costco/scheduler/open-claw-scheduler.ts:28-34` — fallback `createTask` khi không truyền `options.createTask` dùng dynamic import `node-cron` + `as unknown as` cast. Logic này có vẻ fragile (IIFE async trả Promise rồi cast thành function). Tests luôn truyền `createTask` qua options nên không cover path này. Confirm: path production (`index.ts` gọi `scheduleOpenClawCrawl` không truyền options) có hoạt động đúng không?

---

## 📎 Cross-file Notes

1. **Architectural duplication**: `claw-costco` và `claw-data-costco` có 2 endpoint crawl, 2 scheduler, cùng gọi `CostcoCrawlerAgent.runCostcoCrawl()` → rủi ro crawl 2 lần/24h. Plan `docs/superpowers/plans/2026-07-02-consolidate-claw-costco.md` đã đề xuất gộp — nên thực hiện.

2. **Type duplication**: `OpenClawCrawlInput` ≈ `CrawlJobInput`, `OpenClawCrawlResult` ≈ `CrawlJobResult` — chỉ khác field `store`. `wrapCostcoAgent` phải dùng `as CrawlJobInput` cast — nên gộp type hoặc extend.

3. **Tag nhất quán**: `claw-data-costco` dùng `@api`, `@config`, `@e2e`, `@live`, `@scheduler`, `@open-claw-agent` — nhất quán tốt. Nhưng không dùng tag chuẩn `@smoke` / `@regression` / `@slow` từ rule W5. E2E test nên thêm `@slow`.

4. **Test data tĩnh**: `expectedProduct` với `sku: 'costco-001'` xuất hiện ở 2 file (`api.spec.ts:31` và `open-claw-agent.spec.ts:22`) — hardcoded, không unique per run. Vì đây là unit test (không ghi DB thật) nên không gây conflict parallel, nhưng nếu sau này test chạy against DB thật → cần unique data theo pattern `costco-${Date.now()}`.

5. **Import vòng / dependency**: `claw-data-costco` import từ `claw-costco` (agent, config, logger, scheduler) — dependency 1 chiều, không có vòng. Tốt. Nhưng nếu thực hiện plan gộp, cần đảm bảo không tạo vòng khi di chuyển `open-claw-agent.ts` vào `claw-costco/agent/`.
