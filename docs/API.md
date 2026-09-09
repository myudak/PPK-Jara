# API Contract

All endpoints are rooted at `/api`, accept and return JSON, and use session authentication unless marked public. Planned endpoints are contracts for future implementation—not live routes.

## Response envelopes

Success:

```json
{ "success": true, "data": {} }
```

Success with message:

```json
{ "success": true, "message": "Task created successfully.", "data": {} }
```

Error:

```json
{ "success": false, "message": "Resource not found." }
```

Validation error:

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": { "title": ["The title field is required."] }
}
```

Common statuses are `200/201/204`, `401` unauthenticated, `403` unauthorized/disabled, `404` missing resource or endpoint, and `422` validation/credentials.

## Implemented authentication endpoints

| Method | Endpoint | Auth | Authorization |
| --- | --- | --- | --- |
| `POST` | `/api/login` | Public + CSRF | Active account; rate limited |
| `POST` | `/api/logout` | Required | Active account |
| `GET` | `/api/me` | Required | Active account |

Before login, request `GET /sanctum/csrf-cookie`. Login accepts:

```json
{ "email": "user1@example.com", "password": "password" }
```

Successful login and `/api/me` return the public user fields:

```json
{
    "success": true,
    "data": {
        "id": 2,
        "name": "JARA User One",
        "username": "user1",
        "email": "user1@example.com",
        "role": "USER",
        "status": "ACTIVE",
        "created_at": "2026-09-09T09:00:00.000000Z",
        "updated_at": "2026-09-09T09:00:00.000000Z"
    }
}
```

## Planned list endpoints

| Method | Endpoint | Authorization | Expected input |
| --- | --- | --- | --- |
| `GET` | `/api/lists` | Owned/member lists only | Filters/pagination to be specified with implementation |
| `POST` | `/api/lists` | Active user | `name`, optional `description` |
| `GET` | `/api/lists/{list}` | Owner or member | None |
| `PATCH` | `/api/lists/{list}` | Owner only | Optional `name`, `description` |
| `DELETE` | `/api/lists/{list}` | Owner only | None |

## Planned membership endpoints

| Method | Endpoint | Authorization | Expected input |
| --- | --- | --- | --- |
| `GET` | `/api/lists/{list}/members` | Owner or member | None |
| `POST` | `/api/lists/{list}/members` | Owner only | `user_id` |
| `DELETE` | `/api/lists/{list}/members/{user}` | Owner only | None |

Adding the owner as a pivot member and duplicate membership must be rejected. Removing a member must clear that user’s task assignments within the same list and transaction; the database cannot enforce this cross-table membership rule by itself.

## Planned task endpoints

| Method | Endpoint | Authorization | Expected input |
| --- | --- | --- | --- |
| `GET` | `/api/lists/{list}/tasks` | Owner or member | Filters/pagination to be specified with implementation |
| `POST` | `/api/lists/{list}/tasks` | Owner or member | `title`; optional description/priority/status/assignee/dates |
| `GET` | `/api/tasks/{task}` | Participant in task’s list | None |
| `PATCH` | `/api/tasks/{task}` | Participant in task’s list | Editable task fields |
| `DELETE` | `/api/tasks/{task}` | Participant in task’s list | None |

Priority accepts `LOW`, `MEDIUM`, or `HIGH` and defaults to `MEDIUM`. Assignment must be null, the list owner, or a current member. Setting status to `COMPLETED` sets `completed_at`; moving away from completion clears it. Date validation must reject a due date earlier than the start date.

## Planned administrator endpoints

| Method | Endpoint | Authorization | Expected input |
| --- | --- | --- | --- |
| `GET` | `/api/admin/users` | Admin only | Filters/pagination to be specified with implementation |
| `POST` | `/api/admin/users` | Admin only | Name, username, email, password, role, status |
| `PATCH` | `/api/admin/users/{user}` | Admin only | Editable user fields including `status` |

Account disabling is represented by `PATCH /api/admin/users/{user}` with `status: "DISABLED"`; no hard-delete endpoint is planned.

## Implementation rules

- Use Form Requests, API Resources, Policies, and the shared response helper.
- Scope collection queries before authorization-sensitive records leave the database.
- Do not expose password hashes, remember tokens, session identifiers, or stack traces.
- Update this document when a planned endpoint is implemented or its contract changes.
