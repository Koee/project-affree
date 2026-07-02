# Claw Data Costco Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated `claw-data-costco` crawl-data pipeline that reuses the existing `claw-costco` infrastructure but is clearly separated by file name (`claw-data-costco.*`) so the data-crawl side is prioritized and distinguishable from the existing claw tests. Introduce an `OpenClawAgent` as the open agent layer that orchestrates crawlers, with Costco as the first registered crawler.

**Architecture:**
- Keep the existing `claw-costco/` runtime modules (agent, api, browser, config, crawler, db, scheduler, types) as the reusable core.
- Add a new `claw-data-costco/` module that wires an `OpenClawAgent` (open agent) on top of the existing `CostcoCrawlerAgent`, exposing a unified `runCrawl(input)` entry point that dispatches to registered crawlers by `store`.
- Add new test files named `claw-data-costco.*.spec.ts` under `tests/api/claw-data-costco/` so they are visually and mechanically separated from the existing `claw-costco.*.spec.ts` files.
- Add a new Playwright project `claw-data-costco` in `playwright.config.ts` matching `.*claw-data-costco\/.*\.spec\.ts/` so the new suite runs independently via `npm run test:claw-data-costco`.
- Reuse the existing `.env.costco`, `prisma/schema.prisma`, `createBrowser()`, `Product` interface, `pino` logger, `node-cron` scheduler, and `fastify` server builder. Do not duplicate these.

**Tech Stack:** Playwright Test, TypeScript, Fastify, Prisma + PostgreSQL, node-cron, pino, dotenv, zod (for input validation).

---

## File Structure

### New runtime files
- Create: `claw-data-costco/open-claw-agent.ts` — `OpenClawAgent` class that registers crawlers by store and exposes `runCrawl(input)`.
- Create: `claw-data-costco/open-claw-types.ts` — shared types: `OpenClawCrawlInput`, `OpenClawCrawlResult`, `CrawlerRegistration`, `StoreName`.
- Create: `claw-data-costco/index.ts` — entry point that builds `OpenClawAgent`, registers the existing `CostcoCrawlerAgent` as the `costco` crawler, starts scheduler + Fastify server.
- Create: `claw-data-costco/api/open-claw-server.ts` — Fastify server builder exposing `/health` and `/claw-data/crawl` (POST) that delegates to `OpenClawAgent.runCrawl`.
- Create: `claw-data-costco/scheduler/open-claw-scheduler.ts` — scheduler that triggers `OpenClawAgent.runCrawl` for registered stores on `CRAWL_INTERVAL_COSTCO`.

### New test files (clearly named `claw-data-costco.*`)
- Create: `tests/api/claw-data-costco/claw-data-costco.open-claw-agent.spec.ts`
- Create: `tests/api/claw-data-costco/claw-data-costco.config.spec.ts`
- Create: `tests/api/claw-data-costco/claw-data-costco.api.spec.ts`
- Create: `tests/api/claw-data-costco/claw-data-costco.scheduler.spec.ts`
- Create: `tests/api/claw-data-costco/claw-data-costco.e2e.spec.ts` (live crawl against `.env.costco` target, gated by env flag)

### Modified files
- Modify: `playwright.config.ts` — add project `claw-data-costco`.
- Modify: `package.json` — add scripts `test:claw-data-costco`, `claw:data-costco:start`, `build` already covers new folder via `tsconfig.json`.
- Modify: `tsconfig.json` — add `claw-data-costco/**/*.ts` to `include`.
- Modify: `.env.costco` — add `OPEN_CLAW_STORES=costco` and `CLAW_DATA_COSTCO_ENABLED=true` (optional gate for live tests).

---

## Milestones

### Milestone 1: OpenClaw Agent Core (TDD)

**Goal:** Introduce the open agent layer that can register crawlers by store and dispatch crawl jobs, reusing the existing `CostcoCrawlerAgent` as the `costco` crawler.

**Files:**
- Create: `claw-data-costco/open-claw-types.ts`
- Create: `claw-data-costco/open-claw-agent.ts`
- Create: `tests/api/claw-data-costco/claw-data-costco.open-claw-agent.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/api/claw-data-costco/claw-data-costco.open-claw-agent.spec.ts` with `@claw-data-costco @open-claw-agent` tags. Assert:
1. `OpenClawAgent` can register a fake `costco` crawler and `runCrawl({ store: 'costco', source: 'manual' })` returns normalized products.
2. `runCrawl` throws a clear error when the requested `store` is not registered.
3. `OpenClawAgent` wraps the real `CostcoCrawlerAgent` (injected with a fake crawler + fake repositories) and returns a `CrawlJobResult` with `store: 'costco'`.
4. `OpenClawAgent.listRegisteredStores()` returns `['costco']` after registration.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/api/claw-data-costco/claw-data-costco.open-claw-agent.spec.ts --project=claw-data-costco`
Expected: FAIL because `claw-data-costco/open-claw-agent.ts` and types do not exist yet, and the `claw-data-costco` project is not configured.

- [ ] **Step 3: Add Playwright project + tsconfig include**

In `playwright.config.ts`, add:
```ts
{
  name: 'claw-data-costco',
  testMatch: /.*claw-data-costco\/.*\.spec\.ts/,
  timeout: 120_000,
  outputDir: 'test-results/claw-data-costco',
}
```
In `tsconfig.json`, add `"claw-data-costco/**/*.ts"` to `include`.

- [ ] **Step 4: Write minimal implementation**

Create `claw-data-costco/open-claw-types.ts`:
```ts
import type { Product } from '../claw-costco/types/product';
import type { CrawlJobSource } from '../claw-costco/agent/types';

export type StoreName = 'costco' | string;

export type OpenClawCrawlInput = {
    store: StoreName;
    source: CrawlJobSource;
    limit?: number;
    categoryUrl?: string;
    category?: string;
    productName?: string;
    productUrl?: string;
};

export type OpenClawCrawlResult = {
    store: StoreName;
    source: CrawlJobSource;
    runId?: string;
    startedAt: Date;
    finishedAt: Date;
    products: Product[];
};

export type CrawlerRegistration = {
    store: StoreName;
    crawl(input: OpenClawCrawlInput): Promise<OpenClawCrawlResult>;
};
```

Create `claw-data-costco/open-claw-agent.ts`:
```ts
import type {
    OpenClawCrawlInput,
    OpenClawCrawlResult,
    CrawlerRegistration,
    StoreName,
} from './open-claw-types';

export class OpenClawAgent {
    private readonly crawlers = new Map<StoreName, CrawlerRegistration>();

    register(registration: CrawlerRegistration): void {
        this.crawlers.set(registration.store, registration);
    }

    listRegisteredStores(): StoreName[] {
        return [...this.crawlers.keys()];
    }

    async runCrawl(input: OpenClawCrawlInput): Promise<OpenClawCrawlResult> {
        const crawler = this.crawlers.get(input.store);

        if (!crawler) {
            throw new Error(`No crawler registered for store "${input.store}"`);
        }

        return crawler.crawl(input);
    }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx playwright test tests/api/claw-data-costco/claw-data-costco.open-claw-agent.spec.ts --project=claw-data-costco`
Expected: PASS.

---

### Milestone 2: Wire CostcoCrawlerAgent into OpenClawAgent

**Goal:** Create an adapter that wraps the existing `CostcoCrawlerAgent` so it can be registered into `OpenClawAgent` as the `costco` crawler, without modifying `claw-costco/` runtime code.

**Files:**
- Modify: `claw-data-costco/open-claw-agent.ts` (or add adapter in same file)
- Modify: `tests/api/claw-data-costco/claw-data-costco.open-claw-agent.spec.ts`

- [ ] **Step 1: Write the failing test**

Add a test that:
1. Constructs `CostcoCrawlerAgent` with a fake `CostcoProductCrawler` and fake repositories.
2. Wraps it via `wrapCostcoAgent(agent)` to produce a `CrawlerRegistration` with `store: 'costco'`.
3. Registers it into `OpenClawAgent`, calls `runCrawl({ store: 'costco', source: 'manual', limit: 5 })`, and asserts the result matches the `CostcoCrawlerAgent` output (products, runId, store).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/api/claw-data-costco/claw-data-costco.open-claw-agent.spec.ts --project=claw-data-costco -g "wrapCostcoAgent"`
Expected: FAIL because `wrapCostcoAgent` is not exported.

- [ ] **Step 3: Write minimal implementation**

Add to `claw-data-costco/open-claw-agent.ts`:
```ts
import type { CrawlAgent, CrawlJobInput } from '../claw-costco/agent/types';

export function wrapCostcoAgent(agent: CrawlAgent): CrawlerRegistration {
    return {
        store: 'costco',
        crawl: (input) => agent.runCostcoCrawl(input as CrawlJobInput) as Promise<OpenClawCrawlResult>,
    };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/api/claw-data-costco/claw-data-costco.open-claw-agent.spec.ts --project=claw-data-costco -g "wrapCostcoAgent"`
Expected: PASS.

---

### Milestone 3: OpenClaw Fastify API

**Goal:** Expose a Fastify server with `/health` and `POST /claw-data/crawl` that delegates to `OpenClawAgent`, validating input with zod.

**Files:**
- Create: `claw-data-costco/api/open-claw-server.ts`
- Create: `tests/api/claw-data-costco/claw-data-costco.api.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/api/claw-data-costco/claw-data-costco.api.spec.ts` with `@claw-data-costco @api` tags. Assert:
1. `GET /health` returns `{ service: 'claw-data-costco', status: 'ok' }`.
2. `POST /claw-data/crawl` with `{ store: 'costco', limit: 3 }` returns a `OpenClawCrawlResult` (using a recording fake agent).
3. `POST /claw-data/crawl` with `{ store: 'unknown' }` returns HTTP 400 with a clear error message.
4. `POST /claw-data/crawl` with missing `store` returns HTTP 400 (zod validation).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/api/claw-data-costco/claw-data-costco.api.spec.ts --project=claw-data-costco`
Expected: FAIL because `open-claw-server.ts` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `claw-data-costco/api/open-claw-server.ts`:
```ts
import fastify from 'fastify';
import { z } from 'zod';
import type { OpenClawAgent } from '../open-claw-agent';
import { logger } from '../../claw-costco/logger';

const CrawlBodySchema = z.object({
    store: z.string().min(1),
    source: z.enum(['manual', 'scheduler', 'openclaw']).default('manual'),
    limit: z.number().int().positive().optional(),
    categoryUrl: z.string().url().optional(),
    category: z.string().optional(),
    productName: z.string().optional(),
    productUrl: z.string().url().optional(),
});

export type BuildOpenClawServerOptions = {
    agent: OpenClawAgent;
};

export function buildOpenClawServer(options: BuildOpenClawServerOptions) {
    const server = fastify({ loggerInstance: logger });

    server.get('/health', async () => ({
        service: 'claw-data-costco',
        status: 'ok',
    }));

    server.post('/claw-data/crawl', async (request, reply) => {
        const parsed = CrawlBodySchema.safeParse(request.body);

        if (!parsed.success) {
            return reply.status(400).send({
                error: 'INVALID_CRAWL_INPUT',
                details: parsed.error.issues,
            });
        }

        try {
            return await options.agent.runCrawl(parsed.data);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return reply.status(400).send({ error: 'CRAWL_FAILED', message });
        }
    });

    return server;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/api/claw-data-costco/claw-data-costco.api.spec.ts --project=claw-data-costco`
Expected: PASS.

---

### Milestone 4: OpenClaw Scheduler

**Goal:** Add a scheduler that triggers `OpenClawAgent.runCrawl` for each registered store on `CRAWL_INTERVAL_COSTCO`, reusing the existing `intervalToCronExpression` helper.

**Files:**
- Create: `claw-data-costco/scheduler/open-claw-scheduler.ts`
- Create: `tests/api/claw-data-costco/claw-data-costco.scheduler.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/api/claw-data-costco/claw-data-costco.scheduler.spec.ts` with `@claw-data-costco @scheduler` tags. Assert:
1. `scheduleOpenClawCrawl(agent, config, stores)` returns an object with `start()` and `stop()`.
2. The cron expression derived from `CRAWL_INTERVAL_COSTCO=24h` is `0 */24 * * *` (reuse `intervalToCronExpression`).
3. A recording `OpenClawAgent` receives `runCrawl({ store: 'costco', source: 'scheduler', ... })` when the scheduled task fires (use a fake cron task that invokes the callback immediately).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/api/claw-data-costco/claw-data-costco.scheduler.spec.ts --project=claw-data-costco`
Expected: FAIL because `open-claw-scheduler.ts` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `claw-data-costco/scheduler/open-claw-scheduler.ts`:
```ts
import type { OpenClawAgent } from '../open-claw-agent';
import type { ClawCostcoConfig } from '../../claw-costco/config/env';
import { intervalToCronExpression } from '../../claw-costco/scheduler/costco-scheduler';
import { logger } from '../../claw-costco/logger';

export type OpenClawScheduledTask = {
    start(): void;
    stop(): void;
};

export async function scheduleOpenClawCrawl(
    agent: OpenClawAgent,
    config: ClawCostcoConfig,
    stores: string[] = ['costco']
): Promise<OpenClawScheduledTask> {
    const cron = await import('node-cron');
    const expression = intervalToCronExpression(config.crawlInterval);

    return cron.createTask(expression, async () => {
        for (const store of stores) {
            logger.info({ store }, 'OpenClaw scheduled crawl starting');
            try {
                await agent.runCrawl({
                    store,
                    source: 'scheduler',
                    categoryUrl: config.categoryUrl,
                    category: config.category,
                    productName: config.productName,
                    productUrl: config.productUrl,
                });
            } catch (error) {
                logger.error({ store, error }, 'OpenClaw scheduled crawl failed');
            }
        }
    });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/api/claw-data-costco/claw-data-costco.scheduler.spec.ts --project=claw-data-costco`
Expected: PASS.

---

### Milestone 5: Config & Env Isolation Tests

**Goal:** Verify the `claw-data-costco` pipeline reads env from `.env.costco` and that the new `OPEN_CLAW_STORES` env is parsed correctly.

**Files:**
- Create: `tests/api/claw-data-costco/claw-data-costco.config.spec.ts`
- Modify: `.env.costco` (add `OPEN_CLAW_STORES=costco`)

- [ ] **Step 1: Write the failing test**

Create `tests/api/claw-data-costco/claw-data-costco.config.spec.ts` with `@claw-data-costco @config` tags. Assert:
1. `COSTCO_ENV_FILE` is `.env.costco` (reuse existing export).
2. `createClawCostcoConfig()` reads `DATABASE_URL_COSTCO`, `HEADLESS_COSTCO=true`, `TIMEOUT_COSTCO=30000`, `CRAWL_INTERVAL_COSTCO=24h`.
3. A new helper `parseOpenClawStores('costco,amazon')` returns `['costco', 'amazon']`.
4. `parseOpenClawStores(undefined)` defaults to `['costco']`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/api/claw-data-costco/claw-data-costco.config.spec.ts --project=claw-data-costco`
Expected: FAIL because `parseOpenClawStores` is not exported.

- [ ] **Step 3: Write minimal implementation**

Add `parseOpenClawStores` to `claw-data-costco/open-claw-types.ts` or a new `claw-data-costco/config/env.ts`:
```ts
export function parseOpenClawStores(value?: string): string[] {
    if (!value) return ['costco'];
    return value.split(',').map(s => s.trim()).filter(Boolean);
}
```
Add `OPEN_CLAW_STORES=costco` to `.env.costco`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/api/claw-data-costco/claw-data-costco.config.spec.ts --project=claw-data-costco`
Expected: PASS.

---

### Milestone 6: Entry Point & npm Scripts

**Goal:** Wire the full pipeline entry point and add npm scripts so the service and tests can be run with clear names.

**Files:**
- Create: `claw-data-costco/index.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the entry point**

Create `claw-data-costco/index.ts`:
```ts
import { OpenClawAgent, wrapCostcoAgent } from './open-claw-agent';
import { buildOpenClawServer } from './api/open-claw-server';
import { scheduleOpenClawCrawl } from './scheduler/open-claw-scheduler';
import { CostcoCrawlerAgent } from '../claw-costco/agent/costco-crawler-agent';
import { createClawCostcoConfig, parseOpenClawStores } from '../claw-costco/config/env';
import { logger } from '../claw-costco/logger';

const config = createClawCostcoConfig();
const stores = parseOpenClawStores(process.env.OPEN_CLAW_STORES);

const openAgent = new OpenClawAgent();
const costcoAgent = new CostcoCrawlerAgent();
openAgent.register(wrapCostcoAgent(costcoAgent));

const server = buildOpenClawServer({ agent: openAgent });

async function start() {
    const task = await scheduleOpenClawCrawl(openAgent, config, stores);
    task.start();

    await server.listen({
        port: Number(process.env.PORT || 3002),
        host: process.env.HOST || '0.0.0.0',
    });

    logger.info({ stores, port: process.env.PORT || 3002 }, 'claw-data-costco service started');
}

start().catch(error => {
    logger.error({ error }, 'Failed to start claw-data-costco service');
    process.exit(1);
});
```

- [ ] **Step 2: Add npm scripts**

In `package.json`, add:
```json
"test:claw-data-costco": "npx playwright test --project=claw-data-costco --reporter=list",
"claw:data-costco:start": "node dist/claw-data-costco/index.js"
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: `dist/claw-data-costco/index.js` is generated without TypeScript errors.

---

### Milestone 7: Live E2E Crawl Test (Gated)

**Goal:** Add a live end-to-end test that crawls the real Costco category URL from `.env.costco`, upserts into PostgreSQL, and asserts at least one product is returned. Gated by `CLAW_DATA_COSTCO_ENABLED=true` to avoid running in CI by default.

**Files:**
- Create: `tests/api/claw-data-costco/claw-data-costco.e2e.spec.ts`

- [ ] **Step 1: Write the test**

Create `tests/api/claw-data-costco/claw-data-costco.e2e.spec.ts` with `@claw-data-costco @e2e @live` tags. Use `test.skipIf(!process.env.CLAW_DATA_COSTCO_ENABLED)`. Assert:
1. `OpenClawAgent` with a real `CostcoCrawlerAgent` (default `PlaywrightCostcoProductCrawler`) returns `products.length > 0`.
2. Every product has non-empty `sku`, `name`, `url`, and `price >= 0`.
3. The `store` is `'costco'` and `source` is `'manual'`.

- [ ] **Step 2: Run the live test manually**

Run (with PostgreSQL running and `.env.costco` configured):
```cmd
set CLAW_DATA_COSTCO_ENABLED=true && npx playwright test tests/api/claw-data-costco/claw-data-costco.e2e.spec.ts --project=claw-data-costco
```
Expected: PASS with at least one product crawled.

- [ ] **Step 3: Verify it is skipped by default**

Run: `npx playwright test tests/api/claw-data-costco/claw-data-costco.e2e.spec.ts --project=claw-data-costco`
Expected: SKIPPED.

---

### Milestone 8: Full Suite Verification

**Goal:** Run the complete `claw-data-costco` suite and the existing `claw-costco` suite to confirm no regressions.

**Files:**
- Verify: all `tests/api/claw-data-costco/*.spec.ts`
- Verify: all `tests/api/claw-costco/*.spec.ts`

- [ ] **Step 1: Run the new suite**

Run: `npm run test:claw-data-costco`
Expected: all unit/integration tests PASS, live e2e SKIPPED.

- [ ] **Step 2: Run the existing claw-costco suite**

Run: `npm run test:claw-costco`
Expected: all existing tests still PASS (no regression).

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: no TypeScript errors.

- [ ] **Step 4: Check report**

Run: `npx playwright show-report artifacts/report/playwright`
Expected: report shows both `claw-costco` and `claw-data-costco` projects.

---

## Reuse and Cleanup Notes

- **Reuse, do not duplicate:** `.env.costco`, `prisma/schema.prisma`, `createBrowser()`, `Product` interface, `pino` logger, `intervalToCronExpression`, `CostcoCrawlerAgent`, `CostcoProductCrawler`, repositories.
- **Do not modify `claw-costco/` runtime files** unless adding a new exported helper (e.g., `parseOpenClawStores`). Prefer adding new helpers in `claw-data-costco/`.
- **File naming convention:** all new test files MUST start with `claw-data-costco.` so the Playwright project `testMatch` regex and visual inspection clearly separate them from `claw-costco.*` files.
- **Port separation:** `claw-costco` service runs on `3001`, `claw-data-costco` service runs on `3002` to allow both to run simultaneously.
- **OpenClawAgent is extensible:** future stores (e.g., amazon, walmart) can be registered without changing the agent core.

---

## Self-Review

- **Spec coverage:** OpenClaw agent registration/dispatch (M1), Costco adapter wiring (M2), Fastify API + zod validation (M3), scheduler (M4), env/config isolation (M5), entry point + scripts (M6), live e2e (M7), full regression (M8).
- **Placeholder scan:** no placeholder steps remain; every step has a concrete file, command, and expected result.
- **Type consistency:** `OpenClawCrawlInput`/`OpenClawCrawlResult` reuse `Product` and `CrawlJobSource` from `claw-costco`; `StoreName` is `'costco' | string` to allow future stores.
- **Convention alignment:** new test files follow `claw-data-costco.*.spec.ts` naming; new runtime files live under `claw-data-costco/`; env stays in `.env.costco`; prisma schema unchanged.
- **Risk:** live e2e depends on Costco DOM stability and PostgreSQL availability; mitigated by `CLAW_DATA_COSTCO_ENABLED` gate and existing parser selectors.