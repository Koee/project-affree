# Kịch Bản Gộp & Tái Cấu Trúc claw-costco + claw-data-costco

> **Mục tiêu:** Xóa trùng lặp crawl, thống nhất 1 endpoint + 1 scheduler, gỡ bỏ code lang mang/dư thừa, giữ khả năng mở rộng multi-store.

---

## 1. Phân Tích Hiện Trạng

### 1.1. Cấu trúc `claw-costco/` (thư mục gốc — runtime core)

| File | Vai trò |
|---|---|
| `index.ts` | Entry point #1 — server port **3001** + `scheduleCostcoCrawl` |
| `agent/costco-crawler-agent.ts` | `CostcoCrawlerAgent` — crawl + upsert DB |
| `agent/costco-insight-agent.ts` | `CostcoInsightAgent` — insight summary |
| `agent/types.ts` | `CrawlAgent`, `CrawlJobInput`, `CrawlJobResult`, `CostcoProductCrawler` |
| `api/server.ts` | Fastify server #1 — 7 routes dưới `/claw-costco/*` |
| `browser/create-browser.ts` | Playwright browser launcher |
| `config/env.ts` | `createClawCostcoConfig`, `parseCrawlIntervalMs` |
| `crawler/costco-product-crawler.ts` | `PlaywrightCostcoProductCrawler` |
| `crawler/product-parser.ts` | DOM parser |
| `db/prisma-client.ts` | Prisma client singleton |
| `db/repositories.ts` | Product / Run / Read repositories |
| `scheduler/costco-scheduler.ts` | `scheduleCostcoCrawl` + `intervalToCronExpression` |
| `scheduler/retry.ts` | `runWithRetry` |
| `types/product.ts` | `Product` interface |
| `logger.ts` | pino logger |

### 1.2. Cấu trúc `claw-data-costco/` (thư mục mới — open-claw layer)

| File | Vai trò |
|---|---|
| `index.ts` | Entry point #2 — server port **3002** + `scheduleOpenClawCrawl` |
| `open-claw-agent.ts` | `OpenClawAgent` (registry) + `wrapCostcoAgent` adapter |
| `open-claw-types.ts` | `OpenClawCrawlInput`, `OpenClawCrawlResult`, `CrawlerRegistration`, `StoreName` |
| `api/open-claw-server.ts` | Fastify server #2 — chỉ 2 routes: `/health` + `/claw-data/crawl` |
| `config/env.ts` | `parseOpenClawStores` (4 dòng) |
| `scheduler/open-claw-scheduler.ts` | `scheduleOpenClawCrawl` |

### 1.3. Tests

| Thư mục test | Số file | Nội dung |
|---|---|---|
| `tests/api/claw-costco/` | 5 file | agent, config, product-parser, repository, scheduler |
| `tests/api/claw-data-costco/` | 5 file | open-claw-agent, config, api, scheduler, e2e |

---

## 2. Vấn Đề & Rủi Ro Phát Hiện

### 2.1. RỦI RO Nghiêm Trọng — Cùng 1 hành động crawl, 2 endpoint khác nhau

| Service | Endpoint | Chuỗi gọi |
|---|---|---|
| `claw-costco` (port 3001) | `POST /claw-costco/crawl` | → `CostcoCrawlerAgent.runCostcoCrawl()` |
| `claw-data-costco` (port 3002) | `POST /claw-data/crawl` | → `OpenClawAgent.runCrawl()` → `wrapCostcoAgent()` → `CostcoCrawlerAgent.runCostcoCrawl()` |

**Cả hai cuối cùng đều gọi cùng `CostcoCrawlerAgent.runCostcoCrawl()`** — developer không biết nên dùng endpoint nào.

### 2.2. RỦI RO — Costco bị crawl 2 lần theo lịch

| Scheduler | Cron source | Hành động |
|---|---|---|
| `scheduleCostcoCrawl` | `CRAWL_INTERVAL_COSTCO` (24h) | `agent.runCostcoCrawl({ source: 'scheduler', ... })` |
| `scheduleOpenClawCrawl` | `CRAWL_INTERVAL_COSTCO` (24h) | `openAgent.runCrawl({ store: 'costco', source: 'scheduler', ... })` → cùng `runCostcoCrawl` |

Nếu cả 2 service cùng chạy → **Costco bị crawl 2 lần mỗi 24h**, gây:
- Lãng phí tài nguyên (Playwright browser launch 2 lần)
- Duplicate data trong PostgreSQL (2 crawl runs, 2 lần upsert product + price history)
- Rate-limit / block từ Costco

### 2.3. Code Lang Mang / Dư Thừa

| Vấn đề | Chi tiết |
|---|---|
| `OpenClawCrawlInput` ≈ `CrawlJobInput` | Gần identical, chỉ thêm field `store` |
| `OpenClawCrawlResult` ≈ `CrawlJobResult` | Gần identical, `store` thay từ hardcode `'costco'` thành `StoreName` |
| `OpenClawAgent` chỉ là wrapper mỏng | Registry pattern nhưng chỉ đăng ký 1 store (costco) → không tạo giá trị thực sự |
| `wrapCostcoAgent` chỉ là type cast | `(input) => agent.runCostcoCrawl(input as CrawlJobInput) as Promise<OpenClawCrawlResult>` — không có logic |
| `claw-data-costco/config/env.ts` | Chỉ 1 hàm `parseOpenClawStores` 4 dòng — file quá nhỏ, nên gộp |
| `open-claw-server.ts` thiếu routes đọc | Không có `/runs`, `/products`, `/history`, `/status`, `/insights` → không thay thế được `claw-costco` server |
| 2 entry point + 2 npm script | `claw:costco:start` + `claw:data-costco:start` — chạy song song gây crawl 2 lần |

---

## 3. Kịch Bản Xử Lý (Recommended: Hướng C — Gộp vào `claw-costco`, OpenClawAgent thành internal layer)

### Nguyên tắc
1. **1 service duy nhất** — `claw-costco` chạy port 3001
2. **1 endpoint crawl duy nhất** — `POST /claw-costco/crawl` (thêm field `store` optional, default `'costco'`)
3. **1 scheduler duy nhất** — `scheduleCostcoCrawl` (hỗ trợ multi-store nội bộ)
4. **Giữ `OpenClawAgent` làm internal orchestrator** — trong `claw-costco/agent/`, giữ khả năng mở rộng
5. **Xóa thư mục `claw-data-costco/` hoàn toàn**
6. **Gộp tests** — chuyển test cases giá trị từ `claw-data-costco` sang `claw-costco`

### 3.1. Phase 1 — Di chuyển OpenClawAgent vào `claw-costco/`

**Di chuyển file:**
- `claw-data-costco/open-claw-agent.ts` → `claw-costco/agent/open-claw-agent.ts`
- `claw-data-costco/open-claw-types.ts` → `claw-costco/agent/open-claw-types.ts`
- `claw-data-costco/config/env.ts` (`parseOpenClawStores`) → gộp vào `claw-costco/config/env.ts`

**Cập nhật import paths:**
- `open-claw-agent.ts`: `import type { CrawlAgent, CrawlJobInput } from './types'` (thay `'../claw-costco/agent/types'`)
- `open-claw-types.ts`: `import type { Product } from '../types/product'` + `import type { CrawlJobSource } from './types'`

**Gộp `parseOpenClawStores` vào `claw-costco/config/env.ts`:**
```ts
export function parseOpenClawStores(value?: string): string[] {
    if (!value) return ['costco'];
    return value.split(',').map(s => s.trim()).filter(Boolean);
}
```

### 3.2. Phase 2 — Nâng cấp `claw-costco/api/server.ts`

**Thay đổi route `POST /claw-costco/crawl`:**
- Thêm field `store` (optional, default `'costco'`)
- Dùng `OpenClawAgent` nội bộ thay vì gọi `CostcoCrawlerAgent` trực tiếp
- Thêm zod validation (merge từ `open-claw-server.ts`)

```ts
// Pseudo-code cho route mới
server.post('/claw-costco/crawl', async (request, reply) => {
    const parsed = CrawlBodySchema.safeParse(request.body);
    if (!parsed.success) {
        return reply.status(400).send({ error: 'INVALID_CRAWL_INPUT', details: parsed.error.issues });
    }
    try {
        return await openAgent.runCrawl(parsed.data);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return reply.status(400).send({ error: 'CRAWL_FAILED', message });
    }
});
```

**Giữ nguyên các routes đọc:** `/claw-costco/runs`, `/claw-costco/products`, `/claw-costco/products/:sku/history`, `/claw-costco/status`, `/claw-costco/insights/summary`

**Xóa file:** `claw-data-costco/api/open-claw-server.ts`

### 3.3. Phase 3 — Nâng cấp `claw-costco/scheduler/costco-scheduler.ts`

**Gộp logic multi-store từ `open-claw-scheduler.ts`:**
- `scheduleCostcoCrawl` nhận thêm `stores: string[]` (default `['costco']`)
- Dùng `OpenClawAgent` nội bộ thay vì `CrawlAgent` trực tiếp
- Giữ `runWithRetry` + `intervalToCronExpression`

```ts
// Pseudo-code
export async function scheduleCostcoCrawl(
    agent: OpenClawAgent,
    config: ClawCostcoConfig,
    stores: string[] = ['costco']
): Promise<CostcoScheduledTask> {
    // ... cron setup ...
    return cron.createTask(expression, async () => {
        for (const store of stores) {
            await runWithRetry(
                () => agent.runCrawl({ store, source: 'scheduler', ...config }),
                { retries: config.crawlRetry, delayMs: config.crawlRetryDelayMs, ... }
            );
        }
    });
}
```

**Xóa file:** `claw-data-costco/scheduler/open-claw-scheduler.ts`

### 3.4. Phase 4 — Cập nhật `claw-costco/index.ts`

```ts
import { buildClawCostcoServer } from './api/server';
import { OpenClawAgent, wrapCostcoAgent } from './agent/open-claw-agent';
import { CostcoCrawlerAgent } from './agent/costco-crawler-agent';
import { createClawCostcoConfig, parseOpenClawStores } from './config/env';
import { scheduleCostcoCrawl } from './scheduler/costco-scheduler';
import { logger } from './logger';

const config = createClawCostcoConfig();
const stores = parseOpenClawStores(process.env.OPEN_CLAW_STORES);

const openAgent = new OpenClawAgent();
const costcoAgent = new CostcoCrawlerAgent();
openAgent.register(wrapCostcoAgent(costcoAgent));

const server = buildClawCostcoServer({ agent: openAgent, ... });

async function start() {
    const task = await scheduleCostcoCrawl(openAgent, config, stores);
    task.start();
    await server.listen({ port: Number(process.env.PORT || 3001), host: process.env.HOST || '0.0.0.0' });
    logger.info({ stores, port: 3001 }, 'claw-costco service started');
}
```

### 3.5. Phase 5 — Xóa `claw-data-costco/` và dọn dẹp

**Xóa toàn bộ thư mục:**
- `claw-data-costco/index.ts`
- `claw-data-costco/open-claw-agent.ts`
- `claw-data-costco/open-claw-types.ts`
- `claw-data-costco/api/open-claw-server.ts`
- `claw-data-costco/config/env.ts`
- `claw-data-costco/scheduler/open-claw-scheduler.ts`

**Xóa tests `claw-data-costco` (chuyển test cases giá trị sang `claw-costco`):**
- `tests/api/claw-data-costco/claw-data-costco.open-claw-agent.spec.ts` → gộp vào `tests/api/claw-costco/claw-costco.open-claw-agent.spec.ts`
- `tests/api/claw-data-costco/claw-data-costco.api.spec.ts` → gộp vào `tests/api/claw-costco/claw-costco.agent.spec.ts` (test route `/claw-costco/crawl` với `store` param)
- `tests/api/claw-data-costco/claw-data-costco.scheduler.spec.ts` → gộp vào `tests/api/claw-costco/claw-costco.scheduler.spec.ts`
- `tests/api/claw-data-costco/claw-data-costco.config.spec.ts` → gộp vào `tests/api/claw-costco/claw-costco.config.spec.ts`
- `tests/api/claw-data-costco/claw-data-costco.e2e.spec.ts` → gộp vào `tests/api/claw-costco/claw-costco.e2e.spec.ts` (nếu có) hoặc tạo mới

**Cập nhật `package.json`:**
- Xóa script `test:claw-data-costco`
- Xóa script `claw:data-costco:start`
- Giữ `test:claw-costco` và `claw:costco:start`

**Cập nhật `playwright.config.ts`:**
- Xóa project `claw-data-costco`
- Giữ project `claw-costco`

**Cập nhật `tsconfig.json`:**
- Xóa `"claw-data-costco/**/*.ts"` khỏi `include`

**Cập nhật `.env.costco`:**
- Giữ `OPEN_CLAW_STORES=costco` (vẫn dùng cho multi-store)
- Đổi `CLAW_DATA_COSTCO_ENABLED` → `CLAW_COSTCO_E2E_ENABLED` (gate cho live test)

### 3.6. Phase 6 — Cập nhật plan doc

- Archive `docs/superpowers/plans/2026-07-01-claw-data-costco.md` (đánh dấu DEPRECATED)
- Plan mới này thay thế

---

## 4. Bảng So Sánh Trước / Sau

| Khía cạnh | Trước (hiện tại) | Sau (kịch bản C) |
|---|---|---|
| Số service chạy | 2 (port 3001 + 3002) | **1** (port 3001) |
| Số endpoint crawl | 2 (`/claw-costco/crawl` + `/claw-data/crawl`) | **1** (`/claw-costco/crawl`) |
| Số scheduler | 2 (`scheduleCostcoCrawl` + `scheduleOpenClawCrawl`) | **1** (`scheduleCostcoCrawl`) |
| Số lần crawl Costco/24h | **2 lần** (rủi ro) | **1 lần** |
| Số thư mục runtime | 2 (`claw-costco/` + `claw-data-costco/`) | **1** (`claw-costco/`) |
| Số file runtime | 15 + 6 = 21 file | **17 file** (gộp `parseOpenClawStores`, thêm `open-claw-agent.ts` + `open-claw-types.ts`) |
| Số test suite | 2 project (10 file) | **1 project** (~7-8 file sau gộp) |
| Multi-store capability | Có (OpenClawAgent) | **Có** (OpenClawAgent nội bộ trong `claw-costco`) |
| Routes đọc dữ liệu | Có (7 routes) | **Có** (giữ nguyên 7 routes) |
| Zod validation | Chỉ `claw-data-costco` | **Có** (merge vào `claw-costco`) |

---

## 5. Checklist Thực Hiện

- [ ] **Phase 1:** Di chuyển `open-claw-agent.ts` + `open-claw-types.ts` vào `claw-costco/agent/`, gộp `parseOpenClawStores` vào `claw-costco/config/env.ts`
- [ ] **Phase 2:** Nâng cấp `claw-costco/api/server.ts` — thêm `store` param + zod validation, dùng `OpenClawAgent`
- [ ] **Phase 3:** Nâng cấp `claw-costco/scheduler/costco-scheduler.ts` — hỗ trợ multi-store qua `OpenClawAgent`
- [ ] **Phase 4:** Cập nhật `claw-costco/index.ts` — wire `OpenClawAgent` nội bộ
- [ ] **Phase 5:** Xóa `claw-data-costco/` + gộp tests + cập nhật `package.json`, `playwright.config.ts`, `tsconfig.json`, `.env.costco`
- [ ] **Phase 6:** Archive plan cũ, cập nhật docs
- [ ] **Verify:** `npm run build` pass, `npm run test:claw-costco` pass, không còn import `claw-data-costco` nào

---

## 6. Risk & Mitigation

| Risk | Mitigation |
|---|---|
| Test `claw-data-costco` có test cases riêng cho `OpenClawAgent` | Chuyển các test case này sang `claw-costco.open-claw-agent.spec.ts` mới |
| Route `/claw-data/crawl` có thể đang được gọi từ external service | Kiểm tra không có external caller (chỉ là internal QA tool) |
| `OpenClawAgent` type interface thay đổi | Cập nhật import paths, giữ API surface `runCrawl()` + `register()` + `listRegisteredStores()` |
| `CLAW_DATA_COSTCO_ENABLED` env thay tên | Đổi thành `CLAW_COSTCO_E2E_ENABLED`, cập nhật test gate |