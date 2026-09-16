# JARA Engineering Guide

## Project

JARA is a Laravel + React collaborative task-management application. This is a monorepo: Laravel owns HTTP/API and persistence, while React is built and served through Laravel’s Vite integration.

## Technology

- Laravel 13, PHP 8.3+, Eloquent, migrations, Form Requests, Policies
- Laravel Sanctum with cookie-based SPA authentication
- React 19, TypeScript, React Router, Axios
- MySQL 8, Vite, npm
- PHPUnit, Vitest, ESLint, Prettier, Laravel Pint

## Engineering principles

- Follow the existing architecture and Laravel conventions.
- Keep scope limited; avoid speculative abstraction and dependencies.
- Keep controllers thin. Use Form Requests for significant validation and Policies for resource authorization.
- Use Eloquent relationships and migrations; avoid raw SQL unless documented and justified.
- Preserve the API response and error envelopes in `App\Support\ApiResponse`.
- Use TypeScript strictly. Avoid `any`, giant components, and duplicated API logic.
- Keep feature-specific React behavior inside its feature; pages should primarily compose it.
- Provide loading, empty, and error states for asynchronous UI.
- Do not introduce Redux unless measured complexity justifies it.
- Never commit secrets, `.env`, dependencies, logs, caches, or generated builds.
- Update documentation when architecture, schema, endpoints, or shared contracts change.

## Domain ownership

| Owner | Responsibilities |
| --- | --- |
| Muhammad Zaidaan Ardiyansyah (24060124140200) | Authentication, users, administration |
| Nayla Husna (24060124140158) | Task lists, membership, collaboration |
| Muhammad Hafidh Zufar Dewantara (24060124140164) | Tasks, assignment, priority, progress |
| Project Manager | Architecture, scaffolding, integration, PR review, merge, deployment, cross-module fixes, documentation |

Domain ownership does not allow a developer to break a shared contract without discussion. Cross-domain work should identify affected owners in the Pull Request.

## Shared contracts

Treat these as cross-team contracts:

- Authenticated user JSON shape and user identity
- JSON success, error, and validation-error envelopes
- Entity identifiers and endpoint naming
- Roles: `USER`, `ADMIN`
- Account statuses: `ACTIVE`, `DISABLED`
- Task statuses: `TODO`, `IN_PROGRESS`, `COMPLETED`
- Task priorities: `LOW`, `MEDIUM`, `HIGH`
- The owner-as-implicit-list-participant rule

Changing a shared contract requires updating affected backend and frontend code, updating the relevant document, and calling out the change in the Pull Request. Run dependent-module tests when they are useful for the change; testing is not a mandatory contribution gate.

## Git workflow

- Do not work directly on `main`.
- Start work from the latest `main` and create a focused branch for one coherent task.
- Feature branches use `feat/<deskripsi-singkat>`.
- Use a matching prefix when the work is clearly not a feature, for example `fix/`, `refactor/`, `docs/`, `test/`, or `chore/`.
- Branch descriptions must be lowercase, use kebab-case, and be written in natural Indonesian.
- Prefer names such as `feat/tambah-filter-tugas`, `fix/perbaiki-validasi-login`, or `docs/perbarui-panduan-api`.
- Avoid vague names such as `update-code`, `final-fix`, `new-feature`, `my-branch`, or names based only on a developer.
- Keep one branch focused on one task. Do not mix unrelated cleanup or features into the same branch.

## Commit rules

- Make commits atomic: one commit should represent one logical change that can be understood and reverted on its own.
- Do not wait until the end and put unrelated work into one large commit.
- Split feature work, unrelated refactors, documentation, formatting, and fixes when they are separate logical changes.
- Stage only files or hunks that belong to the commit. Avoid blindly committing unrelated working-tree changes.
- Use Conventional Commit prefixes when applicable: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, or `perf`.
- Write the commit summary in natural Indonesian. Keep it short and specific to what actually changed.
- Good examples:
  - `feat(tugas): tambah filter berdasarkan status`
  - `fix(auth): perbaiki validasi akun nonaktif`
  - `refactor(daftar): rapikan pengecekan anggota`
  - `docs(api): perbarui contoh respons tugas`
- Avoid generic or AI-sounding messages such as `implement seamless task management experience`, `enhance overall architecture`, `update various things`, or `final changes`.
- Do not claim tests passed in a commit or PR unless they were actually run.

## Writing style for repository work

Anything written by an agent for this repository should sound like a real member of the team wrote it. This includes branch names, commit messages, Pull Request titles and descriptions, documentation, code comments, and user-facing copy.

- Use natural Indonesian for branch names, commit summaries, and team-facing Git text unless an established technical term is clearer in English.
- Be direct. Say what changed instead of dressing it up.
- Avoid generic openings such as "In today's fast-paced world", "It is worth noting", or similar filler.
- Avoid stock AI words such as `seamless`, `robust`, `crucial`, `comprehensive`, or `enhance` when a simpler and more specific phrase works.
- Do not force symmetrical three-part lists, long formal transitions, or em dashes just to make prose look polished.
- Prefer project-specific wording over generic corporate language.
- Keep explanations proportional to the change. A small fix does not need an essay.
- Do not invent motivation, test results, implementation details, or confidence that is not supported by the actual change.

## Pull Requests

- Open a focused Pull Request to `main` after the branch contains a coherent change.
- Use a concise Conventional Commit-style title with a natural Indonesian summary when it fits, for example `feat(tugas): tambah filter dan pencarian tugas`.
- Keep the description practical: explain what changed, any important behavior or contract impact, and anything reviewers should know.
- Do not pad the description with generic summaries or AI-style prose.
- Mention tests only when they were actually run. Testing is optional unless the task or reviewer explicitly requires it.
- Do not merge without review.

## Laravel rules

- Controllers orchestrate; extract services only for reusable business rules.
- Validate substantial requests with Form Requests.
- Authorize list/task resources with Policies and admin areas with the admin middleware.
- Scope list queries to owned or joined lists; a policy check does not replace query scoping.
- Validate that a task assignee is the list owner or a current member.
- Use enums from `app/Enums` rather than raw status strings.
- Use API Resources for stable public shapes.
- Prefer disabling users. Hard deletion must preserve ownership/history and be explicitly designed.
- Membership must remain unique on `(task_list_id, user_id)`.
- Never manually modify a production schema.

## React rules

- Use functional components and strict TypeScript.
- Keep API calls in shared utilities or feature modules; do not scatter Axios calls across pages.
- Use the cookie-based `AuthProvider`; never store auth tokens in browser storage.
- Import modules directly rather than creating broad barrel files.
- Derive simple state during render instead of synchronizing it with effects.
- Keep independent asynchronous work parallel and avoid request waterfalls.
- Preserve accessible labels, keyboard behavior, focus states, and reduced-motion handling.

## Before completing work

1. Read the relevant documents and inspect the implementation.
2. Confirm the scope and any shared contracts that could be affected.
3. Implement the smallest coherent change.
4. Keep the work split into atomic commits with natural Indonesian commit summaries.
5. Run lint, typecheck, tests, or a production build when they are useful for the change. They are not mandatory by default.
6. Review the diff for secrets, generated files, unrelated changes, accidental contract changes, and missing documentation.
7. Open a focused Pull Request to `main`; do not merge without review.
