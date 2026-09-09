# Architecture Decision Log

Lightweight ADRs record decisions that affect multiple modules. Add a dated entry when a decision changes; do not silently rewrite history after team adoption.

## ADR-001 — Laravel + React monorepo

**Status:** Accepted

**Decision:** Use one Laravel repository with React compiled through Laravel’s Vite integration.

**Reason:** A single deployment, origin, dependency workflow, and review surface simplifies coordination for a four-person team.

## ADR-002 — Laravel Sanctum SPA sessions

**Status:** Accepted

**Decision:** Use Sanctum’s stateful, cookie-based SPA authentication and Laravel’s web guard. Do not store first-party tokens in local storage.

**Reason:** Session cookies and CSRF protection fit a first-party SPA served from the Laravel application.

## ADR-003 — User deactivation

**Status:** Accepted

**Decision:** Disable accounts with `ACTIVE`/`DISABLED` instead of providing normal hard deletion.

**Reason:** Historical ownership, membership, and task context must remain intact.

## ADR-004 — Authorization Policies

**Status:** Accepted

**Decision:** Use Laravel Policies for list/task resources and middleware for active/admin access.

**Reason:** Central authorization rules are testable and avoid scattered controller conditionals. Collection queries still require explicit scoping.

## ADR-005 — Feature-oriented React structure

**Status:** Accepted

**Decision:** Keep domain behavior in feature folders, route-level composition in pages/routes, and transport helpers/types in shared modules.

**Reason:** Developers can work in parallel without creating one giant component or utility directory.

## ADR-006 — Owner is an implicit participant

**Status:** Accepted

**Decision:** Do not duplicate a list owner in `list_members`. Access and assignment logic treat `owner_id` as participation.

**Reason:** This removes duplicate sources of ownership truth and prevents accidental owner removal through membership operations.

## ADR-007 — String-backed statuses with application enums

**Status:** Accepted

**Decision:** Store contract values in indexed string columns and cast them to PHP backed enums; mirror values as TypeScript unions.

**Reason:** The application retains type safety without making future status additions depend on database-specific enum alteration.

## ADR-008 — MySQL runtime, SQLite test isolation

**Status:** Accepted

**Decision:** Run the application on MySQL 8 and the default automated test suite on SQLite in memory. Exercise integrated manual acceptance on MySQL.

**Reason:** In-memory tests are fast and repeatable, while portable migrations and a MySQL acceptance pass reduce database-specific risk.

## ADR-009 — API implementation boundary

**Status:** Accepted

**Decision:** The foundation implements only login, logout, and current-user APIs. List, membership, task, and admin-user endpoints are documented as planned.

**Reason:** The scaffold establishes shared contracts without taking feature ownership away from the three programmers.
