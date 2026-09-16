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

> **Update 2026-09-16:** List, membership, task, progress, and admin-user endpoints are now implemented. ADR-009's boundary applied only to the initial scaffold; see API.md for current endpoint status.

## ADR-010 — Many-to-many task assignees

**Status:** Accepted

**Decision:** Replace the single `tasks.assignee_id` column with a `task_assignees` pivot table (`task_id`, `user_id`, unique on the pair). Task API input uses `assignee_ids` (array of IDs) and task responses return an `assignees` collection. An assignee must be the list owner or a current member; removing a member deletes their assignments in the same list inside one transaction.

**Reason:** SRS-027 requires one task to be assignable to more than one participant. A pivot preserves referential integrity, enforces uniqueness, and supports atomic assignment changes (SRS-029).

## ADR-011 — Account deletion strategy

**Status:** Open decision — requires stakeholder approval (SRS-028)

**Decision:** Not yet made. Until stakeholders choose, the deletion strategy for `DELETE /api/admin/users/{user}` is unresolved among:

1. **Hard delete** — remove the user row and all owned lists, memberships, and assignments in one transaction. Simplest, but destroys collaborative history.
2. **Soft delete** — mark the user deleted (for example `deleted_at`), keep rows for audit, exclude the user from authentication and directory queries. Preserves history, but every consumer must filter deleted users and ownership references require explicit handling.
3. **Disable only** — keep the current `ACTIVE`/`DISABLED` lifecycle (ADR-003) and document that "delete" means disable; SRS-028 is then not marked superseding SRS-021.

**Constraints regardless of choice:** only active administrators may delete; an administrator cannot delete their own account; no orphaned foreign keys; all relational changes run in one transaction; response uses the standard envelope. When decided, record the outcome here, update SRS-021/SRS-028 supersession notes, DATABASE.md deletion behavior, and API.md.

## ADR-012 — Atomic multi-record operations

**Status:** Accepted

**Decision:** Every operation that writes or removes multiple records runs inside a database transaction (Laravel `DB::transaction`). This covers list deletion (tasks, assignments, memberships), task creation and assignee-set changes with multiple assignees, member removal with related assignment cleanup, and account deletion with its relations. A failure at any step rolls back the entire operation, proven by automated rollback tests.

**Reason:** SRS-029 requires all-or-nothing behavior so a mid-operation failure never leaves partial relations such as a member without membership but with assignments.

## ADR-013 — Validation and parameterized queries

**Status:** Accepted

**Decision:** All user input is validated through Form Requests (or Laravel equivalents), and all queries use Eloquent, the Query Builder, parameter binding, or prepared statements. User input is never concatenated into raw SQL. Validation errors return the shared envelope with status `422`. Automated tests cover invalid input and SQL-injection-shaped input.

**Reason:** SRS-030 makes validation and injection protection explicit, testable acceptance criteria instead of implied practice.

## ADR-014 — shadcn design system with preset `bhOibP160`

**Status:** Accepted

**Decision:** The entire React frontend uses shadcn configured with preset `bhOibP160`. Form, button, dialog, table, navigation, feedback, and layout components come from the design system; custom CSS is allowed only for layout or visual identity not available as a shadcn component.

**Reason:** SRS-031 requires one consistent, accessible design system. A fixed preset keeps the four-person team's UI uniform and preserves keyboard navigation, focus, and reduced-motion behavior.

## ADR-015 — Public landing page at `/`

**Status:** Accepted

**Decision:** Add a public, unauthenticated landing page at route `/` describing JARA for personal and team tasks, showing list/project, priority, deadline, multiple assignee, and progress features, with a CTA to `/login` and a dashboard link for logged-in users, built with the shadcn preset.

**Reason:** SRS-032 requires a public entry point that separates public from protected routes; `/` was previously an unassigned catch-all falling through to the not-found page.
