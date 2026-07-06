# Agent Rules

This document outlines the strict execution boundaries and rules governing the behavior of AI coding agents working on this project. All AI agents must follow these rules without exception.

---

## 1. Operational Scope & Limitations

AI Agents must respect the boundaries of their active milestone tasks.

- **File Modifications Limit**: Do not modify more than 10 files in a single execution cycle unless explicitly requested.
- **No Out-of-Scope Refactoring**: Do not clean, modify, or rewrite code unrelated to the target task.
- **No Folder Renaming**: Never rename project folders or directories.
- **No Package Changes**: Avoid changing library packages or editing root configuration files.
- **No Dependency Additions**: Do not introduce new external libraries or packages unless specifically instructed.
- **Prisma Restrictions**: Do not edit database models or modify `prisma/schema.prisma` unless the milestone explicitly requires database adjustments.
- **Playwright Restrictions**: Do not modify global configs (`playwright.config.ts`).
- **Scheduler Restrictions**: Do not modify service schedulers unless the current milestone requires scheduler updates.

---

## 2. Required Agent Output Format

Upon completing any task, the agent's final report must document the changes in a structured format:

1. **Files Created**: A clear list of any new files introduced.
2. **Files Modified**: A clear list of any files changed.
3. **Files Deleted**: A list of any removed files.
4. **Breaking Changes**: Identification of any modifications that could disrupt other parts of the system or data flows.
5. **Manual Verification**: Step-by-step description of verification steps performed (e.g., test runs, output files checked).
6. **Risks**: Potential side effects, fragile paths, or rate-limiting concerns.
7. **Todo**: Next steps or pending items that need to be addressed.
