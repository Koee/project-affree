# Coding Rules

This document details the code implementation standards, patterns, and quality gates for the development of crawlers, API endpoints, and QA automation tests.

---

## 1. Architectural Patterns

### Folder Structure
- Maintain the existing folder structure; do not move or rename files/directories outside of scope.

### Crawling & Parsing
- **Base Implementations**: Every crawler must inherit from the abstract `BaseCrawler` class. Every parser must inherit from the abstract `BaseParser` class.
- **Data Boundaries**: Crawlers and parsers must return standardized `Product` DTO structures. **Never leak Prisma models** or internal database entities to the upper layers.

### Repository Design
- Implement repositories using the **Interface-first approach** before writing the concrete database implementations.
- Database access and data mutations must reside exclusively within the repository implementations.

### Configuration
- All configurations must be read from the unified config layer (`claw-costco/config/env.ts` or similar).
- **Do not read `process.env` directly** inside individual crawlers, parsers, or API controllers.

### Logging
- Use the unified project logger (based on Pino).
- **Do not use `console.log`** or other browser/terminal console write methods in production code.

---

## 2. Test Automation Quality Gates (Playwright & TypeScript)

QA automation tests must adhere to strict quality rules to prevent flakiness and maintain clean test reporting.

### 🔴 Critical Rules (Must be followed - PR Blockers)

#### 1. No Hardcoded Wait Timeouts
- **Avoid** using arbitrary timeouts like `await page.waitForTimeout(3000)`.
- **Use** dynamic waits such as `page.waitForSelector()`, `page.waitForResponse()`, or `page.waitForLoadState('domcontentloaded')`.

#### 2. Stable Selector Selection
- **Avoid** fragile, auto-generated, or layout-dependent selectors (e.g., `.css-xyz123` or `div > nth-child(3) > span`).
- **Use** standard user-facing roles, labels, placeholder texts, or explicit test IDs (e.g., `page.getByRole()`, `page.getByLabel()`, `page.getByTestId()`).

#### 3. Assertions & Validation
- Every user/browser interaction must be followed by a state validation.
- All assertions must include custom error messages to clarify failure context on CI builds:
  ```typescript
  await expect(cartCount, 'Cart count should update to 3 after adding item').toHaveText('3');
  ```

#### 4. No Debug Code or Temporary Fixes
- Do not commit any temporary debug state, such as `test.only`, `test.skip` (without active track tickets), or `await page.pause()`.
- Do not write empty `catch (e) {}` blocks that mask execution failures. Always rethrow or log exceptions.

#### 5. Data Isolation & Parallel Execution Safety
- Ensure tests do not share mutable state. Each test must perform its own setup and teardown.
- Avoid using static data that conflicts when running in parallel (e.g., static emails or order IDs). Generate random strings or use faker libraries.

---

## 3. Configuration & Secrets Management

- All sensitive keys, passwords, and target base URLs must be fed through environment variables via `.env.*` files.
- Ensure no real credentials or sensitive secrets are committed to the git repository. Document dummy values in `.env.example`.
