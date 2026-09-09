# Database Design

MySQL 8 is the runtime database. Automated tests use SQLite in memory, so migrations must remain portable unless a MySQL-specific feature is explicitly documented and tested.

## Entity relationship diagram

```mermaid
erDiagram
    USERS ||--o{ TASK_LISTS : owns
    USERS ||--o{ LIST_MEMBERS : joins
    TASK_LISTS ||--o{ LIST_MEMBERS : includes
    TASK_LISTS ||--o{ TASKS : contains
    USERS o|--o{ TASKS : assigned

    USERS {
        bigint id PK
        string name
        string username UK
        string email UK
        string password
        string role
        string status
        timestamp created_at
        timestamp updated_at
    }
    TASK_LISTS {
        bigint id PK
        string name
        text description
        bigint owner_id FK
        timestamp created_at
        timestamp updated_at
    }
    LIST_MEMBERS {
        bigint task_list_id PK,FK
        bigint user_id PK,FK
        timestamp joined_at
    }
    TASKS {
        bigint id PK
        bigint task_list_id FK
        string title
        text description
        string priority
        string status
        bigint assignee_id FK
        date start_date
        date due_date
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
    }
```

## Tables and constraints

### `users`

`username` and `email` are unique. `role` defaults to `USER`; `status` defaults to `ACTIVE`; both are indexed. Passwords are hashed by the model cast. Laravel session, cache, job, and Sanctum token tables remain framework infrastructure.

### `task_lists`

`owner_id` references `users.id` and is indexed with creation time for owner timelines. Owner deletion is restricted to prevent orphaned collaborative history. The default account lifecycle disables users instead of deleting them.

### `list_members`

The composite primary key `(task_list_id, user_id)` is also the required uniqueness guarantee. Deleting a list or user cascades its pivot rows. `joined_at` records membership creation; the pivot intentionally has no `updated_at`.

Owners are not inserted into this table. Application logic treats `task_lists.owner_id` as implicit participation.

### `tasks`

Tasks belong to a list and cascade when the list is deleted. `priority` defaults to `MEDIUM`. `assignee_id` is optional and becomes null if that user is deleted. Indexes support list/status, list/priority, assignee/status, and due-date queries. Application validation must ensure an assignee is the owner or a current list member.

## Enumerated contracts

Values are stored as bounded strings and cast to PHP backed enums:

- User role: `USER`, `ADMIN`
- User status: `ACTIVE`, `DISABLED`
- Task status: `TODO`, `IN_PROGRESS`, `COMPLETED`
- Task priority: `LOW`, `MEDIUM`, `HIGH`

String columns keep status evolution migration-friendly; Form Requests and enums enforce accepted values.

## Deletion behavior

| Deletion | Behavior |
| --- | --- |
| User owning lists | Restricted |
| User membership rows | Cascade |
| User task assignments | Set null |
| Task list memberships | Cascade |
| Task list tasks | Cascade |

Hard user deletion is not an ordinary product action. Disable accounts to preserve ownership and audit context.
