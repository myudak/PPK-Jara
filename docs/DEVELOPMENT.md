# Development Guide

## Local setup

Follow the root README to install Composer/npm dependencies, create `.env`, configure MySQL, migrate, seed, and run `composer run dev`. Never commit `.env` or credentials.

Useful commands:

```bash
php artisan make:migration create_example_table
php artisan migrate
php artisan migrate:rollback
php artisan db:seed
php artisan route:list
php artisan tinker
```

Create schema changes only through migrations. Review generated foreign keys, indexes, nullability, and deletion behavior before running them.

## Branch and Pull Request workflow

Start from an updated `main` and create a focused branch:

```text
feature/auth-login
feature/list-membership
feature/task-crud
fix/task-permission
docs/update-srs
```

Push the branch and open a Pull Request to `main`. The PR should describe behavior, authorization and validation, schema/API changes, verification performed, and screenshots for meaningful UI changes. At least one teammate reviews before merge; the Project Manager integrates cross-module work.

Do not use a complicated long-lived Git Flow. Keep branches short, rebase or merge current `main` before final review according to team preference, and resolve shared-contract conflicts explicitly.

## Commit convention

Use Conventional Commits:

```text
feat(auth): add login endpoint
feat(lists): add membership model
fix(tasks): validate assignee membership
docs(api): document task endpoints
refactor(auth): extract authorization policy
test(lists): cover unrelated-user access
```

## Coding conventions

PHP follows Laravel conventions and is formatted with Pint. Controllers orchestrate; Form Requests validate; Policies authorize resources; API Resources serialize public data. TypeScript is strict and frontend imports use `@/` paths. Pages compose feature logic and shared components.

Run checks before requesting review:

```bash
composer lint
composer test
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

Use `composer format` and `npm run format` to apply formatting.

## Migrations and seeders

- Never edit a migration that has already been shared/applied; add a new migration.
- Keep factories useful for tests and seeders deterministic.
- The default seeder is development-only and uses a documented password.
- Do not run destructive migration commands against shared or production databases.

## Shared-contract changes

Before changing identity fields, enums, API envelopes, identifiers, or endpoint names:

1. Find backend, frontend, test, and documentation consumers.
2. Discuss the change with affected domain owners and the Project Manager.
3. Update all consumers in one coordinated change or define a compatibility window.
4. Add regression tests and call out the contract change in the PR.
