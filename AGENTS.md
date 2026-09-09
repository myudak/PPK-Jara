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

Changing a shared contract requires updating affected backend and frontend code, updating the relevant document, running dependent-module tests, and calling out the change in the Pull Request.

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
2. Confirm scope and shared contracts.
3. Implement the smallest coherent change.
4. Run `composer lint` and relevant PHP tests.
5. Run `npm run typecheck`, `npm run lint`, `npm run format:check`, relevant Vitest tests, and a production build for frontend changes.
6. Review the diff for secrets, generated files, accidental contract changes, and missing documentation.
7. Open a focused Pull Request to `main`; do not merge without review.
