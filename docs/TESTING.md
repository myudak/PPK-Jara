# Testing Strategy

## Layers

### Unit

Use unit tests for pure rules and stable contracts such as enum values, progress calculations, and isolated transformations. Avoid mocking Eloquent merely to call a unit test.

### Feature/API

Use Laravel feature tests for endpoints, validation, JSON envelopes, database writes, session behavior, and relationships. These tests use SQLite in memory through `phpunit.xml`. Use factories and `RefreshDatabase`; do not depend on execution order.

### Authorization

For every protected action, cover the permitted role/relationship and at least one denied case: guest, disabled account, unrelated user, member versus owner, or user versus administrator. Collection tests must prove unrelated rows are absent, not just that individual Policies deny them.

### Frontend

Use Vitest and Testing Library for route guards, forms, error/loading states, and high-value feature behavior. Assert what a user can observe rather than component internals. Typecheck, lint, and production build are required frontend gates.

### Manual acceptance

Use a MySQL-backed local environment and the seeded accounts for the integrated workflow.

## Commands

```bash
composer test
composer lint
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

Run one backend test file with `php artisan test tests/Feature/Auth/AuthenticationTest.php`. Run Vitest interactively with `npx vitest`.

## Manual acceptance checklist

- [ ] Login succeeds for an active seeded user and fails safely for bad credentials.
- [ ] Logout ends the session; refreshing a protected route returns to login.
- [ ] An owner can create, view, edit, and delete a list.
- [ ] A user cannot access an unrelated list.
- [ ] An owner can add a member; duplicate membership is rejected.
- [ ] Only the owner can remove a member.
- [ ] A participant can create, edit, and delete a task.
- [ ] Assignment accepts only the owner/current members.
- [ ] Status changes among TODO, IN_PROGRESS, and COMPLETED.
- [ ] Completing a task records completion time; reopening clears it.
- [ ] List progress updates and handles a list with zero tasks.
- [ ] An administrator can list, create, edit, and disable users.
- [ ] A normal user cannot access administrator endpoints/pages.
- [ ] A disabled user cannot start or continue a session.
- [ ] Loading, empty, validation, and server-error states are understandable.

Items for unimplemented domain features remain expected failures in manual acceptance until their milestone lands; do not add placeholder automated tests that pretend endpoints exist.
