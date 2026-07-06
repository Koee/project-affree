# Đánh Giá Milestone (M0–M8) — Repo clawer-db

> Ngày: 2026-07-03  
> Scope: `claw-costco/`, `claw-data-costco/`, `prisma/schema.prisma`, `tests/`, `playwright.config.ts`  
> Mục tiêu: Đối chiếu bảng milestone của user với code thực tế trong repo, đánh giá mức độ đáp ứng, và lên kế hoạch triển khai.

---

## 1. Kết Luận Tổng Quan

| Khía cạnh | Đánh giá |
|---|---|
| **Costco** | Đã implement đầy đủ M0–M8 (crawling, DB, scheduler, API, AI agent) |
| **Premium Outlets** | **KHÔNG có code** — bảng milestone đánh dấu ✅ nhưng repo không có file nào |
| **Walmart** | **KHÔNG có code** — bảng milestone đánh dấu ✅ nhưng repo không có file nào |
| **Architecture** | Có `OpenClawAgent` registry pattern nhưng mới đăng ký 1 store (costco) |
| **DB Schema** | Chỉ có model `Costco*` — chưa có model generic cho multi-store |
| **BaseCrawler/BaseParser** | Chưa tách thành abstract base — `PlaywrightCostcoProductCrawler` + `product-parser.ts` là Costco-specific |

**⚠️ Phát hiện chính:** Bảng milestone của user đánh dấu Premium Outlets (M4–M8) và Walmart (M5–M8) là ✅, nhưng **thực tế repo không có bất kỳ dòng code nào** cho 2 store này (xác nhận qua `search_files` regex `premium|outlet|walmart` → 0 kết quả).

---

## 2. Đánh Giá Chi Tiết Theo Milestone

### Bảng đánh giá thực tế (dựa trên code trong repo)

| Milestone | Nội dung | Costco | Premium Outlets | Walmart | Ghi chú |
|---|---|:---:|:---:|:---:|---|
| **M0** | Framework + DB + Logger + Repository | ✅ | ❌ | ❌ | Costco: Fastify + Prisma + Pino + 3 repositories. PO/Walmart: không có model DB, không có repository |
| **M1** | Crawl 1 category (POC) | ✅ | ❌ | ❌ | Costco: `PlaywrightCostcoProductCrawler` + `product-parser.ts`. PO/Walmart: không có crawler |
| **M2** | Upsert Product + Price History | ✅ | ❌ | ❌ | Costco: `upsertMany()` upsert product + tạo `CostcoPriceHistory`. PO/Walmart: không có |
| **M3** | Chuẩn hóa `BaseCrawler` + `BaseParser` | ⚠️ | ❌ | ❌ | Costco: có `CostcoProductCrawler` interface + parser nhưng **chưa tách thành abstract base class**. PO/Walmart: N/A |
| **M4** | Adapter cho website thứ hai | ✅ | ❌ | ❌ | Costco: `OpenClawAgent` registry. **Premium Outlets: KHÔNG có adapter** (bảng user ghi ✅ nhưng không có code) |
| **M5** | Adapter cho website thứ ba | ✅ | ✅* | ❌ | *Bảng user ghi ✅ cho PO nhưng không có code. **Walmart: KHÔNG có adapter** (bảng user ghi ✅ nhưng không có code) |
| **M6** | Scheduler + Retry + Monitoring | ✅ | ❌ | ❌ | Costco: `scheduleCostcoCrawl` + `runWithRetry` + `/status` endpoint. PO/Walmart: không có scheduler riêng |
| **M7** | API + Dashboard | ✅ | ❌ | ❌ | Costco: 7 routes (`/crawl`, `/runs`, `/products`, `/history`, `/status`, `/insights`, `/health`). **Không có dashboard UI**. PO/Walmart: không có |
| **M8** | AI Agent (OpenClaw/GLM) | ✅ | ❌ | ❌ | Costco: `OpenClawAgent` + `CostcoInsightAgent` (price signals). PO/Walmart: không có |

### So sánh: Bảng user vs Thực tế repo

| Milestone | User ghi Costco | Thực tế Costco | User ghi PO | Thực tế PO | User ghi Walmart | Thực tế Walmart |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| M0 | ⬜ | ✅ | ⬜ | ❌ | ⬜ | ❌ |
| M1 | ✅ | ✅ | ⬜ | ❌ | ⬜ | ❌ |
| M2 | ✅ | ✅ | ⬜ | ❌ | ⬜ | ❌ |
| M3 | ✅ | ⚠️ | ⬜ | ❌ | ⬜ | ❌ |
| M4 | ✅ | ✅ | ⬜ | ❌ | ⬜ | ❌ |
| M5 | ✅ | ✅ | ✅ | ❌ | ⬜ | ❌ |
| M6 | ✅ | ✅ | ✅ | ❌ | ⬜ | ❌ |
| M7 | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| M8 | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |

> **Kết luận:** Bảng milestone của user **không khớp với thực tế repo**. Cần cập nhật lại trạng thái và triển khai thêm cho Premium Outlets + Walmart.

---

## 3. Phân Tích Architecture Hiện Tại

### 3.1. Cấu trúc hiện tại

```
claw-costco/                    ← Service chính (port 3001)
├── index.ts                    ← Entry point
├── logger.ts                   ← Pino logger
├── agent/
│   ├── costco-crawler-agent.ts ← Crawl + upsert DB
│   ├── costco-insight-agent.ts ← Price signal insights
│   └── types.ts                ← CrawlAgent, CrawlJobInput, CrawlJobResult
├── api/server.ts               ← Fastify 7 routes /claw-costco/*
├── browser/create-browser.ts   ← Playwright launcher
├── config/env.ts               ← Config từ .env.costco
├── crawler/
│   ├── costco-product-crawler.ts ← PlaywrightCostcoProductCrawler
│   └── product-parser.ts        ← DOM parser (Costco selectors)
├── db/
│   ├── prisma-client.ts        ← Prisma singleton
│   └── repositories.ts         ← Product/Run/Read repositories
├── scheduler/
│   ├── costco-scheduler.ts     ← Cron scheduler
│   └── retry.ts                ← runWithRetry
└── types/product.ts            ← Product interface

claw-data-costco/               ← OpenClaw layer (port 3002)
├── index.ts                    ← Entry point #2
├── open-claw-agent.ts          ← OpenClawAgent registry + wrapCostcoAgent
├── open-claw-types.ts          ← OpenClawCrawlInput, OpenClawCrawlResult
├── api/open-claw-server.ts     ← Fastify 2 routes
├── config/env.ts               ← parseOpenClawStores (4 dòng)
└── scheduler/open-claw-scheduler.ts ← Multi-store scheduler

prisma/schema.prisma            ← 3 models: CostcoProduct, CostcoPriceHistory, CostcoCrawlRun
```

### 3.2. Vấn đề architecture cần giải quyết

| # | Vấn đề | Impact | Giải pháp |
|---|---|---|---|
| 1 | **Không có `BaseCrawler` / `BaseParser`** | M3 chưa đạt — mỗi store phải copy-paste crawler | Tạo abstract `BaseCrawler` + `BaseParser` với template method pattern |
| 2 | **DB schema Costco-specific** | Không thể thêm PO/Walmart mà không tạo model mới | Tạo generic models: `Product`, `PriceHistory`, `CrawlRun` với field `store` |
| 3 | **2 service trùng lặp** | `claw-costco` + `claw-data-costco` cùng crawl Costco → crawl 2 lần/24h | Gộp theo plan `2026-07-02-consolidate-claw-costco.md` |
| 4 | **`OpenClawAgent` chỉ đăng ký 1 store** | Registry pattern chưa tạo giá trị thực sự | Đăng ký thêm PO + Walmart adapters |
| 5 | **Parser hardcoded Costco selectors** | Không thể reuse cho PO/Walmart | Tách `BaseParser` + `CostcoParser`, `PremiumOutletsParser`, `WalmartParser` |
| 6 | **Không có Dashboard UI** | M7 ghi ✅ nhưng chỉ có API, không có UI | Thêm dashboard đơn giản (HTML/React) hoặc Fastify static serve |
| 7 | **Config env Costco-specific** | `DATABASE_URL_COSTCO`, `CRAWL_INTERVAL_COSTCO` — không scale cho multi-store | Tạo generic config + per-store override |

---

## 4. Kế Hoạch Triển Khai

### 4.1. Bảng kế hoạch tổng quan

| Phase | Milestone | Nội dung | Ưu tiên | Store | Status |
|---|---|---|:---:|---|:---:|
| **P0** | M3 | Tách `BaseCrawler` + `BaseParser` abstract | 1 | Costco | ⬜ |
| **P1** | M0 | Refactor DB schema → generic multi-store models | 1 | ALL | ⬜ |
| **P2** | M0–M3 | Refactor `claw-costco` dùng `BaseCrawler` + generic repo | 1 | Costco | ⬜ |
| **P3** | — | Gộp `claw-data-costco` vào `claw-costco` (theo plan cũ) | 2 | Costco | ⬜ |
| **P4** | M0–M2 | Premium Outlets: DB + Crawler + Parser + Repository | 2 | PO | ⬜ |
| **P5** | M4 | Premium Outlets: Adapter + đăng ký vào `OpenClawAgent` | 2 | PO | ⬜ |
| **P6** | M0–M2 | Walmart: DB + Crawler + Parser + Repository | 3 | Walmart | ⬜ |
| **P7** | M5 | Walmart: Adapter + đăng ký vào `OpenClawAgent` | 3 | Walmart | ⬜ |
| **P8** | M6 | Multi-store Scheduler + Retry + Monitoring | 3 | ALL | ⬜ |
| **P9** | M7 | Unified API + Dashboard UI | 4 | ALL | ⬜ |
| **P10** | M8 | AI Agent multi-store (insights cho từng store) | 4 | ALL | ⬜ |

### 4.2. Chi tiết từng phase

#### Phase 0 — Tách `BaseCrawler` + `BaseParser` (M3)

| Task | File mới | Mô tả |
|---|---|---|
| Tạo `BaseCrawler` | `claw-costco/crawler/base-crawler.ts` | Abstract class: `crawlProducts(input)`, template method pattern, chia sẻ browser lifecycle |
| Tạo `BaseParser` | `claw-costco/crawler/base-parser.ts` | Abstract class: `extractProductsFromPage(page, options)`, chia sẻ logic parse price/sku/image/url |
| Refactor `CostcoParser` | `claw-costco/crawler/product-parser.ts` | Extend `BaseParser`, override selectors cho Costco |
| Refactor `CostcoCrawler` | `claw-costco/crawler/costco-product-crawler.ts` | Extend `BaseCrawler`, inject `CostcoParser` |

```typescript
// base-crawler.ts (pseudo)
export abstract class BaseCrawler implements ProductCrawler {
    protected abstract createParser(): BaseParser;
    protected abstract baseUrl: string;

    async crawlProducts(input: CrawlJobInput): Promise<Product[]> {
        const browser = await createBrowser();
        try {
            const page = await browser.newPage();
            if (input.categoryUrl) {
                await page.goto(input.categoryUrl, { waitUntil: 'domcontentloaded' });
            }
            const parser = this.createParser();
            return parser.extractProductsFromPage(page, { ...input, baseUrl: this.baseUrl });
        } finally {
            await browser.close();
        }
    }
}
```

#### Phase 1 — Refactor DB Schema → Generic Multi-Store (M0)

| Task | File | Mô tả |
|---|---|---|
| Tạo generic models | `prisma/schema.prisma` | `Product` (thêm `store` field), `PriceHistory`, `CrawlRun` — thay thế `CostcoProduct`, `CostcoPriceHistory`, `CostcoCrawlRun` |
| Migration | `prisma/migrations/` | Tạo migration chuyển data cũ + thêm field `store` |
| Refactor repositories | `claw-costco/db/repositories.ts` | `PrismaProductRepository`, `PrismaCrawlRunRepository`, `PrismaReadRepository` — generic, nhận `store` param |

```prisma
// schema.prisma (generic)
model Product {
    id        String   @id @default(cuid())
    store     String   // 'costco' | 'premium-outlets' | 'walmart'
    sku       String
    name      String
    price     Decimal
    category  String
    image     String
    url       String
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    @@unique([store, sku])
    @@index([store])
}

model PriceHistory {
    id          String   @id @default(cuid())
    store       String
    sku         String
    price       Decimal
    currency    String   @default("USD")
    source      String
    crawlRunId  String?
    capturedAt  DateTime
    createdAt   DateTime @default(now())
    @@index([store, sku])
    @@index([capturedAt])
}

model CrawlRun {
    id             String   @id @default(cuid())
    store          String
    source         String
    status         String
    productCount   Int      @default(0)
    errorMessage   String?
    startedAt      DateTime
    finishedAt     DateTime?
    createdAt      DateTime @default(now())
    @@index([store])
}
```

#### Phase 2 — Refactor `claw-costco` dùng Base + Generic Repo (M0–M3)

| Task | File | Mô tả |
|---|---|---|
| Refactor `CostcoCrawlerAgent` | `claw-costco/agent/costco-crawler-agent.ts` | Đổi thành `StoreCrawlerAgent` hoặc giữ tên nhưng dùng generic repo |
| Cập nhật config | `claw-costco/config/env.ts` | Thêm `STORE=costco` config, hỗ trợ per-store override |
| Cập nhật API routes | `claw-costco/api/server.ts` | Routes thành `/claw/:store/crawl`, `/claw/:store/products`, etc. |
| Cập nhật tests | `tests/api/claw-costco/` | Update assertions cho generic schema |

#### Phase 3 — Gộp `claw-data-costco` vào `claw-costco`

| Task | Mô tả |
|---|---|
| Di chuyển `OpenClawAgent` | `claw-data-costco/open-claw-agent.ts` → `claw-costco/agent/open-claw-agent.ts` |
| Di chuyển `OpenClawTypes` | `claw-data-costco/open-claw-types.ts` → `claw-costco/agent/open-claw-types.ts` |
| Gộp `parseOpenClawStores` | Vào `claw-costco/config/env.ts` |
| Gộp scheduler | `open-claw-scheduler.ts` logic vào `costco-scheduler.ts` |
| Xóa `claw-data-costco/` | Xóa toàn bộ thư mục sau khi gộp |
| Cập nhật `package.json` | Xóa script `claw:data-costco:start`, `test:claw-data-costco` |
| Cập nhật `playwright.config.ts` | Xóa project `claw-data-costco` |
| Cập nhật `tsconfig.json` | Xóa `claw-data-costco/**/*.ts` khỏi `include` |

> Tham khảo: `docs/superpowers/plans/2026-07-02-consolidate-claw-costco.md`

#### Phase 4–5 — Premium Outlets Adapter (M0–M2, M4)

| Task | File mới | Mô tả |
|---|---|---|
| `PremiumOutletsParser` | `claw-costco/crawler/premium-outlets-parser.ts` | Extend `BaseParser`, selectors cho premiumoutlets.com |
| `PremiumOutletsCrawler` | `claw-costco/crawler/premium-outlets-crawler.ts` | Extend `BaseCrawler`, inject `PremiumOutletsParser` |
| `PremiumOutletsAgent` | `claw-costco/agent/premium-outlets-agent.ts` | Hoặc dùng generic `StoreCrawlerAgent` với `store='premium-outlets'` |
| Đăng ký vào `OpenClawAgent` | `claw-costco/index.ts` | `openAgent.register(wrapStoreAgent('premium-outlets', poAgent))` |
| Config | `.env.costco` hoặc `.env` | `CATEGORY_URL_PREMIUM_OUTLETS`, `CRAWL_INTERVAL_PREMIUM_OUTLETS` |
| Tests | `tests/api/claw-costco/premium-outlets-*.spec.ts` | Parser, crawler, agent tests |

**Premium Outlets selectors (cần research):**
- Product card: `.product-tile`, `.product-card`, `[data-product-id]`
- Name: `.product-name`, `.pdp-link a`
- Price: `.price`, `.product-price`
- Image: `.product-image img`
- URL: `.pdp-link a[href]`

#### Phase 6–7 — Walmart Adapter (M0–M2, M5)

| Task | File mới | Mô tả |
|---|---|---|
| `WalmartParser` | `claw-costco/crawler/walmart-parser.ts` | Extend `BaseParser`, selectors cho walmart.com |
| `WalmartCrawler` | `claw-costco/crawler/walmart-crawler.ts` | Extend `BaseCrawler`, inject `WalmartParser` |
| `WalmartAgent` | `claw-costco/agent/walmart-agent.ts` | Hoặc dùng generic `StoreCrawlerAgent` với `store='walmart'` |
| Đăng ký vào `OpenClawAgent` | `claw-costco/index.ts` | `openAgent.register(wrapStoreAgent('walmart', walmartAgent))` |
| Config | `.env` | `CATEGORY_URL_WALMART`, `CRAWL_INTERVAL_WALMART` |
| Tests | `tests/api/claw-costco/walmart-*.spec.ts` | Parser, crawler, agent tests |

**Walmart selectors (cần research):**
- Product card: `[data-testid="item-stack"]`, `[data-automation-id="product"]`
- Name: `[data-automation-id="title"]`, `.product-title`
- Price: `[data-automation-id="price"]`, `.price-group`
- Image: `img[src*="walmartimages"]`
- URL: `a[href*="/ip/"]`

> ⚠️ **Walmart có anti-bot mạnh** — cần stealth plugin, user-agent rotation, có thể cần `playwright-extra` + `puppeteer-extra-plugin-stealth`.

#### Phase 8 — Multi-store Scheduler + Monitoring (M6)

| Task | File | Mô tả |
|---|---|---|
| Multi-store scheduler | `claw-costco/scheduler/costco-scheduler.ts` | Loop qua `stores[]`, mỗi store có interval riêng |
| Per-store config | `claw-costco/config/env.ts` | `CRAWL_INTERVAL_COSTCO`, `CRAWL_INTERVAL_PREMIUM_OUTLETS`, `CRAWL_INTERVAL_WALMART` |
| Monitoring endpoint | `claw-costco/api/server.ts` | `GET /claw/status` → status tất cả stores |
| Health check | `claw-costco/api/server.ts` | `GET /health` → status từng store |
| Alerting | (optional) | Webhook/Slack khi crawl fail N lần liên tiếp |

#### Phase 9 — Unified API + Dashboard (M7)

| Task | File | Mô tả |
|---|---|---|
| Unified API routes | `claw-costco/api/server.ts` | `/claw/:store/*` pattern, hỗ trợ tất cả stores |
| Dashboard HTML | `claw-costco/dashboard/index.html` | Static HTML + JS, hiển thị: product count, last run, price signals |
| Serve dashboard | `claw-costco/api/server.ts` | `fastify-static` serve `/dashboard` |
| API docs | `claw-costco/api/docs.ts` | OpenAPI/Swagger hoặc simple JSON |

#### Phase 10 — AI Agent Multi-Store (M8)

| Task | File | Mô tả |
|---|---|---|
| Generic `InsightAgent` | `claw-costco/agent/insight-agent.ts` | Refactor `CostcoInsightAgent` → nhận `store` param |
| Multi-store insights | `claw-costco/api/server.ts` | `GET /claw/:store/insights/summary` |
| Cross-store comparison | `claw-costco/agent/insight-agent.ts` | So sánh giá cùng sản phẩm across stores (nếu map được SKU) |
| GLM/OpenClaw integration | `claw-costco/agent/ai-agent.ts` | Gọi LLM để generate insight narrative (optional) |

---

## 5. Bảng Milestone Cập Nhật (Dự Kiến Sau Triển Khai)

| Milestone | Nội dung | Costco | Premium Outlets | Walmart |
|---|---|:---:|:---:|:---:|
| **M0** | Framework + DB + Logger + Repository | ✅ | ⬜→✅ | ⬜→✅ |
| **M1** | Crawl 1 category (POC) | ✅ | ⬜→✅ | ⬜→✅ |
| **M2** | Upsert Product + Price History | ✅ | ⬜→✅ | ⬜→✅ |
| **M3** | Chuẩn hóa `BaseCrawler` + `BaseParser` | ⚠️→✅ | ⬜→✅ | ⬜→✅ |
| **M4** | Adapter cho website thứ hai | ✅ | ❌→✅ | ⬜ |
| **M5** | Adapter cho website thứ ba | ✅ | ✅ | ❌→✅ |
| **M6** | Scheduler + Retry + Monitoring | ✅ | ❌→✅ | ⬜→✅ |
| **M7** | API + Dashboard | ✅→✅+ | ❌→✅ | ❌→✅ |
| **M8** | AI Agent (OpenClaw/GLM) | ✅ | ❌→✅ | ❌→✅ |

---

## 6. Thứ Tự Ưu Tiên Triển Khai

| Thứ tự | Phase | Milestone | Effort ước tính | Dependency |
|:---:|---|---|:---:|---|
| 1 | P0 | M3 | 2 ngày | Không |
| 2 | P1 | M0 | 1 ngày | Không |
| 3 | P2 | M0–M3 | 2 ngày | P0 + P1 |
| 4 | P3 | — | 1 ngày | P2 |
| 5 | P4–P5 | M0–M2, M4 | 3 ngày | P2 + P3 |
| 6 | P6–P7 | M0–M2, M5 | 3 ngày | P2 + P3 |
| 7 | P8 | M6 | 2 ngày | P5 + P7 |
| 8 | P9 | M7 | 2 ngày | P8 |
| 9 | P10 | M8 | 2 ngày | P9 |
| | **Tổng** | | **~18 ngày** | |

---

## 7. Rủi Ro & Mitigation

| Risk | Mức độ | Mitigation |
|---|:---:|---|
| Walmart anti-bot block | 🔴 Cao | Dùng `playwright-extra` + stealth plugin, rotate user-agent, thêm delay random |
| Premium Outlets SPA (JS-heavy) | 🟡 TB | Dùng `waitUntil: 'networkidle'`, wait cho product cards render |
| DB migration mất data Costco cũ | 🔴 Cao | Backup trước, migration có rollback, test trên staging trước |
| Refactor BaseCrawler break test Costco | 🟡 TB | Giữ test suite Costco chạy pass sau mỗi phase |
| 2 service cùng chạy gây crawl 2 lần | 🟡 TB | Gộp P3 sớm, hoặc stop `claw-data-costco` trước khi deploy |
| Selectors thay đổi khi website update | 🟡 TB | Dùng multiple fallback selectors (như `product-parser.ts` hiện tại) |
| Rate limit từ 3 website cùng crawl | 🟡 TB | Stagger schedule, mỗi store crawl ở giờ khác nhau |

---

## 8. Checklist Thực Hiện

- [ ] **P0:** Tách `BaseCrawler` + `BaseParser`, refactor `CostcoParser` + `CostcoCrawler` extend base
- [ ] **P1:** Refactor `prisma/schema.prisma` → generic models (`Product`, `PriceHistory`, `CrawlRun` với `store` field)
- [ ] **P2:** Refactor `claw-costco` dùng generic repositories + `BaseCrawler`
- [ ] **P3:** Gộp `claw-data-costco` vào `claw-costco` (xóa thư mục, gộp tests, cập nhật config)
- [ ] **P4:** Premium Outlets: `PremiumOutletsParser` + `PremiumOutletsCrawler` + tests
- [ ] **P5:** Premium Outlets: đăng ký vào `OpenClawAgent` + config + API route
- [ ] **P6:** Walmart: `WalmartParser` + `WalmartCrawler` + stealth + tests
- [ ] **P7:** Walmart: đăng ký vào `OpenClawAgent` + config + API route
- [ ] **P8:** Multi-store scheduler + per-store config + monitoring endpoint
- [ ] **P9:** Unified API `/claw/:store/*` + Dashboard HTML
- [ ] **P10:** Generic `InsightAgent` multi-store + cross-store comparison
- [ ] **Verify:** `npm run build` pass, `npm run test:claw-costco` pass, không còn import `claw-data-costco`