# API Contract

All endpoints are rooted at `/api`, accept and return JSON, and use session authentication unless marked public. List, membership, task, progress, and administrator endpoints are implemented. The multiple-assignee task contract (`assignee_ids`/`assignees`) and the administrator account-deletion endpoint below are **planned** and must not be treated as available until their milestone lands.

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

## Implemented list endpoints

| Method | Endpoint | Auth | Authorization |
| --- | --- | --- | --- |
| `GET` | `/api/lists` | Required | Active account; returns owned and joined lists only |
| `POST` | `/api/lists` | Required | Active account; `name` required, optional `description` |
| `GET` | `/api/lists/{list}` | Required | Owner or member |
| `PATCH` | `/api/lists/{list}` | Required | Owner only |
| `DELETE` | `/api/lists/{list}` | Required | Owner only; cascades membership and tasks |

## Implemented membership endpoints

| Method | Endpoint | Auth | Authorization |
| --- | --- | --- | --- |
| `GET` | `/api/lists/{list}/members` | Required | Owner or member |
| `POST` | `/api/lists/{list}/members` | Required | Owner only; `user_id` |
| `DELETE` | `/api/lists/{list}/members/{member}` | Required | Owner only |

Adding the owner as a pivot member and duplicate membership are rejected with `422`.

Removing a member deletes that member's task assignments within the same list inside one database transaction so no assignment survives a removed membership. With the current single-assignee schema the legacy `assignee_id` is cleared; once the SRS-027 pivot ships, the member's rows in `task_assignees` for that list are deleted instead. Both variants are all-or-nothing.

## Implemented task endpoints

| Method | Endpoint | Authorization | Expected input |
| --- | --- | --- | --- |
| `GET` | `/api/lists/{list}/tasks` | Owner or member | Optional `priority`, `status` filters; optional `sort` (`priority`, `due_date`) and `direction` (`asc`, `desc`) |
| `POST` | `/api/lists/{list}/tasks` | Owner or member | `title`; optional description/priority/status/assignee/dates |
| `GET` | `/api/tasks/{task}` | Participant in task’s list | None |
| `PATCH` | `/api/tasks/{task}` | Participant in task’s list | Editable task fields |
| `DELETE` | `/api/tasks/{task}` | Participant in task’s list | None |
| `GET` | `/api/lists/{list}/progress` | Owner or member | None |

Priority accepts `LOW`, `MEDIUM`, or `HIGH` and defaults to `MEDIUM`. Status accepts `TODO`, `IN_PROGRESS`, or `COMPLETED` and defaults to `TODO`. **Current (legacy) assignment accepts a single `assignee_id`** that must be null, the list owner, or a current member. Setting status to `COMPLETED` sets `completed_at`; moving away from completion clears it. Date validation rejects a due date earlier than the start date. The progress endpoint returns `{ "total": int, "completed": int, "percent": int }` and reports `0` percent for lists without tasks.

### Planned task contract change — multiple assignees (SRS-027)

Until implemented, the following replaces the single `assignee_id` contract:

- Task creation (`POST /api/lists/{list}/tasks`) and update (`PATCH /api/tasks/{task}`) accept `assignee_ids: number[]` (array of user IDs) instead of `assignee_id`.
- An empty array or an omitted field means the task has no assignee.
- Every ID must reference the list owner or a current member; any foreign ID rejects the whole request with `422` per-field errors.
- Duplicate IDs within one request are rejected with `422` (a user cannot be assigned twice to the same task).
- Changing the assignee set is atomic: either the full new set is stored in `task_assignees` or nothing changes (SRS-029).
- Task responses include an `assignees` array of public user objects; `assignee_id` is removed from responses after the migration.

## Implemented administrator endpoints

| Method | Endpoint | Auth | Authorization |
| --- | --- | --- | --- |
| `GET` | `/api/admin/users` | Required | Admin + active account |
| `POST` | `/api/admin/users` | Required | Admin + active account |
| `PATCH` | `/api/admin/users/{user}` | Required | Admin + active account |

Account disabling is represented by `PATCH /api/admin/users/{user}` with `status: "DISABLED"`; no hard-delete endpoint is planned.

`GET /api/admin/users?page=1` returns users ordered by name with pagination metadata:

```json
{
    "success": true,
    "data": {
        "users": [{ "id": 2, "name": "JARA User One", "username": "user1", "email": "user1@example.com", "role": "USER", "status": "ACTIVE", "created_at": "2026-09-09T09:00:00.000000Z", "updated_at": "2026-09-09T09:00:00.000000Z" }],
        "meta": { "current_page": 1, "last_page": 1, "per_page": 15, "total": 1 }
    }
}
```

`POST /api/admin/users` accepts `name`, `username` (unique, `alpha_dash`, min 3), `email` (unique), `password` (min 8, stored hashed), `role` (`USER` or `ADMIN`), and `status` (`ACTIVE` or `DISABLED`), and returns the created user with `201`. There is no public registration.

`PATCH /api/admin/users/{user}` accepts any subset of the same fields and returns the updated user. An administrator cannot change their own `role` or `status`; attempts receive `422` with the message `You cannot change your own role or status.` Updating a missing user returns the shared `404` envelope. Disabling a user does not remove their owned lists, memberships, or assignments.

### Planned administrator endpoint — delete user account (SRS-028)

`DELETE /api/admin/users/{user}` is a documented contract, **not implemented yet**, and is blocked on the open deletion-strategy decision in [DECISIONS.md](DECISIONS.md) (ADR-011):

| Method | Endpoint | Auth | Authorization |
| --- | --- | --- | --- |
| `DELETE` | `/api/admin/users/{user}` | Required | Admin + active account; **planned** |

Behavior once implemented (subject to ADR-011):

- A non-administrator receives `403`.
- An administrator attempting to delete their own account receives `422` with the message `You cannot delete your own account.`.
- All relational cleanup runs inside one database transaction and rolls back on failure (SRS-029).
- Success returns the standard envelope `{ "success": true, "message": "..." }`; a missing user returns the shared `404` envelope.
- Whether `DISABLED` remains an alternative lifecycle to deletion is decided together with ADR-011.

## Atomicity, validation, and injection rules

- Operations that write multiple records (list deletion, member removal with assignment cleanup, task creation or update with assignees, future account deletion) must run inside `DB::transaction` and roll back entirely on failure (SRS-029).
- Every request input is validated with a Form Request or equivalent Laravel validation; validation failures return the shared validation envelope with `422` (SRS-030).
- Queries must use Eloquent, the Query Builder, parameter binding, or prepared statements. Never interpolate user input into raw SQL.

## Implementation rules

- Use Form Requests, API Resources, Policies, and the shared response helper.
- Scope collection queries before authorization-sensitive records leave the database.
- Wrap multi-record writes in a database transaction; a failed step rolls back the whole operation.
- Do not expose password hashes, remember tokens, session identifiers, or stack traces.
- Update this document when a planned endpoint is implemented or its contract changes. Never describe a planned endpoint as implemented.
