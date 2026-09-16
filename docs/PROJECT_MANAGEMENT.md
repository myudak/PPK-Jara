# Project Management

## Responsibilities

### Nayla Husna — 24060124140158 (Project Manager)

Owns the SRS, architecture, initial scaffold, backlog, milestone planning, integration, Pull Request review, merging, cross-module bugs, final QA, deployment, and documentation consistency.

### Muhammad Zaidaan Ardiyansyah — 24060124140200

**Fitur/SRS:** Frontend, Authentication, Users, dan Admin — SRS-002 sampai SRS-005, SRS-019 sampai SRS-021, SRS-024, SRS-026, SRS-028, serta SRS-031 sampai SRS-032.

Menangani seluruh frontend React, shadcn design system, landing page, login/logout/session, pengelolaan akun administrator, logical account deletion, integrasi API, serta pengujiannya.

### Muchammad Yuda

**Fitur/SRS:** Task Lists, Membership, Security, dan Atomic Operations — SRS-006 sampai SRS-010 serta SRS-022, SRS-023, SRS-029, dan SRS-030.

Menangani backend CRUD daftar/list/project, query scoping, membership, transaksi atomic, validasi dan keamanan query, serta pengujiannya.

### Muhammad Hafidh Zufar Dewantara — 24060124140164

**Fitur/SRS:** Tasks, Assignment, Priority, dan Progress — SRS-011 sampai SRS-018 serta SRS-027.

Menangani CRUD tugas, validasi assignee, prioritas, tenggat waktu, status dan penyelesaian tugas, perhitungan progres, UI tugas, serta pengujiannya.

Ownership establishes a primary reviewer and implementer. Shared contracts still require cross-team discussion and coordinated changes.

## Suggested milestones

### Milestone 1 — Foundation

Repository, environment, schema, authentication skeleton, shared contracts, frontend shell, documentation, and quality gates.

### Milestone 2 — Core Task Management

Owned list CRUD, task CRUD, dates, statuses, and foundational list/task UI.

### Milestone 3 — Collaboration

Membership management, shared-list visibility, participant assignment, and progress monitoring.

### Milestone 4 — Administration

User directory, creation/editing, disabling, and admin authorization/UI.

### Milestone 5 — Integration & QA

Cross-module scenarios, access-control audit, error/loading states, regression testing, and documentation reconciliation.

### Milestone 6 — Deployment & Demo

Production configuration, build/release pipeline, migrations, smoke tests, monitoring, backup expectations, and demo rehearsal.

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
