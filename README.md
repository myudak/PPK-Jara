# JARA

JARA is a Laravel and React web application for managing personal and collaborative task lists. This repository currently provides the production-oriented engineering foundation for a four-person team; it intentionally does not implement the complete product.

## What JARA will support

- Account login and administrator-managed users
- Personal and shared task lists
- List membership and collaboration
- Tasks, assignments, dates, deadlines, and status tracking
- List-level progress monitoring
- Ownership, membership, and administrator authorization

## Technology

- Laravel 13, PHP 8.3+, Eloquent, migrations, validation, and Policies
- Laravel Sanctum cookie-based SPA authentication
- React 19, TypeScript, React Router, Axios, and Vite
- MySQL 8 for application data
- PHPUnit, Vitest, Testing Library, ESLint, Prettier, and Laravel Pint

## Requirements

- PHP 8.3 or later with `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, and `ctype`
- Composer 2.8+
- Node.js 22.12+ and npm 10+
- MySQL 8+
- Git

## Installation

```bash
git clone <repository-url> jara
cd jara

composer install
npm ci

cp .env.example .env
php artisan key:generate
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp` if needed.

Create an empty MySQL database and a least-privileged local user, then update the `DB_*` values in `.env`:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=jara
DB_USERNAME=jara
DB_PASSWORD=your-local-password
```

The SPA is served by Laravel, so these defaults keep Sanctum on one origin:

```dotenv
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:8000
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:8000,127.0.0.1,127.0.0.1:8000
```

Prepare the database and run the application:

```bash
php artisan migrate
php artisan db:seed
composer run dev
```

Open `http://localhost:8000`.

## Development accounts

`php artisan db:seed` creates these development-only accounts. Every account uses password `password`.

| Role | Email |
| --- | --- |
| Administrator | `admin@example.com` |
| User | `user1@example.com` |
| User | `user2@example.com` |
| User | `user3@example.com` |

The seeder also creates a shared “JARA Demo Launch” list with two members and two tasks. Never use these credentials or seed data in production.

## Authentication

JARA uses Sanctum’s cookie-based SPA mode, not bearer tokens in local storage. The frontend requests `/sanctum/csrf-cookie`, submits credentials to `/api/login`, and restores identity through `/api/me`. Axios sends the session and XSRF token automatically.

Implemented endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/login` | Start a session using email and password |
| `POST` | `/api/logout` | End the authenticated session |
| `GET` | `/api/me` | Return the authenticated user |

All list, membership, task, and admin-user endpoints are documented contracts but are intentionally not implemented yet. See [API documentation](docs/API.md).

## Quality checks

```bash
composer test
composer lint

npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

PHP tests use an in-memory SQLite database for isolated verification. Runtime configuration targets MySQL.

## Project structure

```text
app/
├── Enums/             Shared role and status contracts
├── Http/              API controllers, middleware, requests, resources
├── Models/            Eloquent domain models
├── Policies/          Resource authorization
└── Support/           Shared API response helper
database/
├── factories/
├── migrations/
└── seeders/
resources/
├── css/
└── js/
    ├── components/
    ├── features/
    ├── layouts/
    ├── lib/
    ├── pages/
    ├── routes/
    └── types/
routes/
tests/
docs/
```

## Development workflow

Create a branch from `main`, implement one focused change, run relevant checks, then open a Pull Request back to `main`.

```text
main ← Pull Request ← feature/* or fix/*
```

Examples: `feature/auth-login`, `feature/list-membership`, `feature/task-crud`, `fix/task-permission`, and `docs/update-srs`.

Use Conventional Commits such as `feat(lists): add membership endpoint` or `fix(tasks): validate assignee membership`. Shared-contract changes require documentation updates and coordination across module owners.

## Team ownership

| Owner | Domains |
| --- | --- |
| Project Manager | Architecture, integration, review, merge, deployment, cross-module fixes, documentation |
| Muhammad Zaidaan Ardiyansyah (24060124140200) | Authentication, users, administration |
| Nayla Husna (24060124140158) | Task lists, membership, collaboration |
| Muhammad Hafidh Zufar Dewantara (24060124140164) | Tasks, assignment, priority, progress |

Ownership clarifies responsibility; it does not permit unilateral changes to shared API, identity, status, or endpoint contracts.

## Current foundation and next work

The repository includes authentication, schema, relationships, policies, seed data, consistent API envelopes, protected frontend routing, placeholder pages, and testing/linting configuration.

Recommended first tasks:

1. Zaidaan: implement administrator user listing, creation, editing, and disabling behind the admin middleware.
2. Nayla: implement authorized task-list CRUD and membership management with query scoping.
3. Hafidh: implement task CRUD, priority, assignment validation, status transitions, and progress calculation.

## Documentation

- [Software requirements](docs/SRS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE.md)
- [API contract](docs/API.md)
- [Development guide](docs/DEVELOPMENT.md)
- [Testing strategy](docs/TESTING.md)
- [Project management](docs/PROJECT_MANAGEMENT.md)
- [Architecture decisions](docs/DECISIONS.md)
