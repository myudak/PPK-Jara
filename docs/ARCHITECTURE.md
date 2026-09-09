# Architecture

## System view

```mermaid
flowchart LR
    Browser -->|HTML + Vite assets| React[React SPA]
    React -->|JSON + session cookie| API[Laravel REST API]
    API --> Sanctum[Sanctum / Session / CSRF]
    API --> Requests[Form Requests]
    API --> Policies[Policies + Middleware]
    API --> Services[Domain services when justified]
    Services --> Eloquent
    API --> Eloquent[Eloquent Models]
    Eloquent --> MySQL[(MySQL)]
```

Laravel and React live in one repository and deploy as one web application. Laravel serves the SPA shell for non-API routes. Vite supplies development assets and creates the production bundle.

## Responsibilities

- **React:** client routing, session-aware navigation, forms, interaction state, and presentation. It never decides server authorization.
- **Laravel:** authentication, validation, authorization, business orchestration, JSON contracts, and SPA delivery.
- **Eloquent/MySQL:** persistent state, relationships, constraints, and transaction boundaries.
- **Sanctum:** first-party SPA session authentication with CSRF protection; no SPA bearer token is issued.

## Module boundaries

| Module | Owns | Depends on |
| --- | --- | --- |
| Auth/User | Sessions, identity, role/status, user lifecycle | Shared API envelope |
| List/Membership | List ownership, membership, list visibility | Authenticated user identity |
| Task | Tasks, assignment, status, progress | List access and membership |
| Admin | User management and disabling | User identity and admin middleware |

Cross-module values and endpoint shapes are contracts. Change them with coordinated code, documentation, and tests.

## Authentication flow

1. React requests `GET /sanctum/csrf-cookie`.
2. React submits email/password to `POST /api/login`; Axios sends the XSRF header.
3. Laravel validates credentials and active status, regenerates the session, and returns the public user shape.
4. Protected frontend routes restore the user with `GET /api/me`.
5. `POST /api/logout` invalidates the session and rotates the CSRF token.

## Authorization flow

Authentication and active-account middleware guard protected APIs. Admin middleware guards `/api/admin/*`. Policies decide list/task resource abilities. Query builders must still scope resources to owned/joined lists so unauthorized resources are not fetched or enumerated.

The list owner is an implicit participant and is not duplicated in `list_members`. Policies and assignment validation must count the owner as participating.

## Frontend organization

Shared layout and UI live in `components`/`layouts`; domain-specific logic lives in `features`; API configuration lives in `lib`; URL-level composition lives in `pages` and `routes`; transport/domain shapes live in `types`. New abstractions require repeated use, not anticipated reuse.

## Deployment shape

The production build runs `npm run build` and publishes hashed assets under `public/build`. A PHP web server serves Laravel’s `public` directory. Production supplies MySQL, session/cache configuration, a queue worker where needed, HTTPS, and environment secrets outside Git.
