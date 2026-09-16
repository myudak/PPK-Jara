# Project Management

## Responsibilities

### Project Manager — Nayla Husna (24060124140158)

Owns the SRS, architecture, backlog, milestone planning, integration, Pull Request review, merging, cross-module bugs, final QA, deployment, and documentation consistency. Effective the 2026-09-16 revision, Nayla is the Project Manager, reviewer, integration coordinator, and documentation owner.

**Fitur/SRS:** Foundation, Task Lists, Membership, Collaboration, UI, dan Project Standards — SRS-001, SRS-006 sampai SRS-010, serta SRS-024 sampai SRS-025.

Menangani CRUD daftar/list/project, pembatasan daftar yang dapat dilihat, pengelolaan anggota, aksi khusus pemilik, UI kolaborasi daftar, serta pengujiannya.

### Muhammad Zaidaan Ardiyansyah — 24060124140200

**Fitur/SRS:** Authentication, Users, Admin, API, dan Access Control — SRS-002 sampai SRS-005 serta SRS-019 sampai SRS-023.

Menangani login, logout, session pengguna, pembatasan akun nonaktif, daftar pengguna, pembuatan dan perubahan akun, role/status, endpoint administrator, UI, serta pengujiannya.

**Revisi 2026-09-16 — tambahan:** SRS-026 (integrasi seluruh frontend React), SRS-028 (penghapusan akun oleh admin, menunggu keputusan ADR-011), SRS-031 (design system shadcn preset `bhOibP160`), SRS-032 (landing page publik `/`).

### Muhammad Hafidh Zufar Dewantara — 24060124140164

**Fitur/SRS:** Tasks, Assignment, Priority, dan Progress — SRS-011 sampai SRS-018, serta SRS-027.

Menangani CRUD tugas, validasi assignee, prioritas, tenggat waktu, status dan penyelesaian tugas, perhitungan progres, UI tugas, serta pengujiannya.

**Revisi 2026-09-16 — tambahan:** SRS-027 (multiple task assignees: pivot `task_assignees`, input `assignee_ids`, respons `assignees`, penghapusan assignment saat anggota dikeluarkan). Supersedes bagian single-assignee pada SRS-017.

### Muchammad Yuda Tri Ananda

**Fitur/SRS:** Database integrity dan validasi — SRS-029 (atomic database operations) dan SRS-030 (validasi input dan perlindungan SQL injection).

Menangani pembungkusan seluruh operasi multi-record dalam transaksi database, automated rollback tests, audit Form Requests, dan pengujiannya.

Ownership establishes a primary reviewer and implementer. Shared contracts still require cross-team discussion and coordinated changes.

### New shared contracts introduced by the 2026-09-16 revision

- Task assignment is many-to-many: input uses `assignee_ids`, responses return `assignees`, storage uses the `task_assignees` pivot (SRS-027).
- Multi-record writes are atomic with full rollback (SRS-029).
- All input is validated and all queries are parameterized (SRS-030).
- The whole frontend uses shadcn preset `bhOibP160` (SRS-031) and a public landing page exists at `/` (SRS-032).

## Suggested milestones

### Milestone 1 — Foundation

Repository, environment, schema, authentication skeleton, shared contracts, frontend shell, documentation, and quality gates.

### Milestone 2 — Core Task Management

Owned list CRUD, task CRUD, dates, statuses, and foundational list/task UI.

### Milestone 3 — Collaboration

Membership management, shared-list visibility, participant assignment, and progress monitoring.

### Milestone 4 — Administration

User directory, creation/editing, disabling, admin authorization/UI, and the planned account-deletion endpoint (SRS-028) once the ADR-011 deletion-strategy decision is approved.

### Milestone 5 — Integration & QA

Cross-module scenarios, access-control audit, error/loading states, regression testing, and documentation reconciliation.

### Milestone 6 — Deployment & Demo

Production configuration, build/release pipeline, migrations, smoke tests, monitoring, backup expectations, and demo rehearsal.

## Revised milestones — 2026-09-16 scope (SRS-026 to SRS-032)

Sequenced so shared-contract and data-integrity work lands before UI polish:

| Order | Milestone | SRS | Owner |
| --- | --- | --- | --- |
| R1 | Data integrity & validation foundation | SRS-029, SRS-030 | Muchammad Yuda |
| R2 | Multiple task assignees (pivot, `assignee_ids`, `assignees`, UI) | SRS-027 | Muhammad Hafidh Zufar Dewantara |
| R3 | shadcn setup with preset `bhOibP160` | SRS-031 | Muhammad Zaidaan Ardiyansyah |
| R4 | Frontend integration sweep on shadcn | SRS-026, SRS-032 | Muhammad Zaidaan Ardiyansyah |
| R5 | Account deletion endpoint (after stakeholder decision) | SRS-028 | Muhammad Zaidaan Ardiyansyah |

R1 must land before R2 because assignee operations are atomic. R3 must land before R4 and R5 UI work so pages are built on the design system once. R5 waits on the ADR-011 stakeholder decision; see "Implementation sequence" below for the recommended order for the three programmers.

## Pull Request expectations

- One coherent feature or fix with a clear owner
- Acceptance criteria linked to requirement IDs where applicable
- Validation and authorization described
- Relevant automated checks passing
- Screenshots for meaningful UI work
- Schema/API/shared-contract changes clearly identified
- Documentation updated with actual behavior

## Definition of Done

A task is done only when implementation works, authorization is correct, input validation exists, relevant tests pass, UI handles basic loading/error/empty states, no obvious regressions remain, changed contracts are documented, and the Pull Request has been reviewed.

## Integration rules

- The Project Manager sequences migrations and shared-contract changes.
- Domain owners review changes that consume or alter their contracts.
- Merge small vertical slices instead of maintaining long-running integration branches.
- A red required check blocks merge.
- Cross-module bugs are assigned by root cause, with the Project Manager coordinating when ownership is ambiguous.
- SRS-027 (`assignee_ids`/`assignees`/`task_assignees`) changes a shared task contract: Hafidh coordinates with Zaidaan (frontend) and the Project Manager before merging.
- SRS-028 introduces a destructive admin endpoint: Zaidaan waits for the ADR-011 stakeholder decision and coordinates with the Project Manager on relational cleanup.

## Implementation sequence — recommendation for the three programmers

Recommended order after each step's checks pass and its PR is reviewed:

1. **Muchammad Yuda — SRS-029 & SRS-030 (first, no dependencies).** Wrap existing multi-record operations (list delete, member removal) in `DB::transaction`, audit every Form Request, and add the rollback and SQL-injection-shaped-input test suites. This gives every later feature its atomicity and validation foundation.
2. **Muhammad Hafidh Zufar Dewantara — SRS-027 (depends on step 1).** Ship the `task_assignees` pivot migration, switch task APIs to `assignee_ids`/`assignees`, delete a removed member's assignments in the same transaction, and build the multi-assignee UI. Coordinate the contract change with Zaidaan and the Project Manager.
3. **Muhammad Zaidaan Ardiyansyah — SRS-031, SRS-026, SRS-032 (parallel with steps 1-2, merged after R2).** Configure shadcn preset `bhOibP160`, migrate existing pages to the design system, complete the full React feature integration (auth, admin, lists, members, tasks, assignment, progress) with loading/empty/success/error states, then add the public landing page at `/` with the `/login` CTA and logged-in dashboard link.
4. **Muhammad Zaidaan Ardiyansyah — SRS-028 (last, blocked on stakeholder decision).** Implement `DELETE /api/admin/users/{user}` per the approved ADR-011 strategy, with atomic relational cleanup, `403`/self-delete protections, and tests. Steps 1-3 may proceed without this decision.
