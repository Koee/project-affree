# Folder Structure

This document describes the directory hierarchy and the responsibility layer assigned to each folder in the clawer-db repository.

---

## 1. Project Directory Tree

```
clawer-db/
├── claw-costco/               # Main crawler microservice
│   ├── agent/                 # Agent orchestration layer
│   ├── api/                   # Fastify HTTP server & controllers
│   ├── browser/               # Playwright browser launchers
│   ├── config/                # Environment config parser
│   ├── crawler/               # Site-specific crawl & DOM parsing scripts
│   ├── db/                    # DB connection pool & repositories
│   ├── scheduler/             # Cron scheduling & run retry engines
│   └── types/                 # Shared data interfaces
├── components/                # Checkout & ordering flow components
├── docs/                      # Project documentation and guidelines
│   ├── architecture/          # Architecture guidelines (Contracts, Rules)
│   ├── reviews/               # Code reviews & milestone assessments
│   ├── rules/                 # Detailed QA automated test constraints
│   └── superpowers/           # Technical consolidation & design plans
├── fixtures/                  # Test data mocks
├── prisma/                    # Database schema and database migrations
├── scripts/                   # Workspace helper scripts
├── tests/                     # Playwright test suite
│   ├── api/                   # API validation & data contract specs
│   └── e2e/                   # Customer journey end-to-end specs
└── utils/                     # Shared QA helper utilities
```

---

## 2. Directory Responsibilities

### `claw-costco/`
The primary microservice responsible for site-crawling, data-parsing, and loading catalog datasets into the database.
- **`agent/`**: Contains core agent dispatchers (`costco-crawler-agent.ts`, `costco-insight-agent.ts`) and the OpenClaw coordinator mapping system (`open-claw-agent.ts`).
- **`api/`**: Sets up Fastify router endpoints, schema validations (via Zod), and controllers.
- **`browser/`**: Manages Playwright browser setup, instance lifecycles, and configuration parameters.
- **`config/`**: Parses system/service configurations and environment variables securely.
- **`crawler/`**: Implements extraction algorithms. Concrete crawlers (e.g. Costco) map page structures using target DOM selectors.
- **`db/`**: Hosts repositories implementing the database access interfaces (Prisma clients and queries).
- **`scheduler/`**: Coordinates cron intervals, job retries, and run metrics reporting.

### `components/`
Encapsulates step-by-step browser interactions required to complete order workflows, search inputs, and location validations on target web systems.

### `docs/`
Houses system documentation, reviews, specifications, and architecture rules to align developer and agent efforts.

### `fixtures/`
Stores static test objects (mock accounts, brand names, product items, and recipients) for test repeatability.

### `prisma/`
Contains the structural mapping of the PostgreSQL/SQLite databases (`schema.prisma`) defining Products, Price Histories, and Crawl Runs.

### `tests/`
Houses the QA automation test suite (built on Playwright).
- **`api/`**: Includes data-contract testing, API health validations, catalog/buyer endpoints verification.
- **`e2e/`**: Runs end-to-end user actions and transaction flows.

### `utils/`
Provides common wrappers for API requests (`api-client.ts`), reporting formatting (`report.ts`), and dataset assertion checks (`data-assertions.ts`).
