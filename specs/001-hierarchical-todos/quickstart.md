# Quickstart: Hierarchical Todo Lists

## Prerequisites

- Node.js (latest LTS)
- npm (bundled with Node.js)

## Environment

Copy the example env files and edit as needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**backend/.env.example**
```
API_PATH=/api
DATABASE_URL=./data/todos.db
```

**frontend/.env.example**
```
API_PATH=/api
```

> `DATABASE_URL` is a file path relative to the `backend/` directory. The `backend/data/` folder is created automatically on first run; `todos.db` is gitignored.

## Install

```bash
# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

## Validate no version prefixes (constitution §)

```bash
cd backend && npm run check:versions && cd ..
cd frontend && npm run check:versions && cd ..
```

Both commands MUST exit 0 before proceeding.

## Run database migrations

```bash
cd backend && npm run migrate && cd ..
```

This creates `backend/data/todos.db` and applies all migrations in `src/services/migrations/`.

## Run (local development)

Backend (default port 4000):

```bash
cd backend && npm run dev
```

Frontend (default port 3000, in a separate terminal):

```bash
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Verify core flow (SC-001 acceptance check)

1. The app loads with a "No lists yet" empty-state message and an add-list button.
2. Create a list named "Home". Verify it appears in the list panel.
3. Select "Home". Verify the empty-state message for todos is shown.
4. Add a todo item titled "Buy groceries". Verify it appears.
5. Add a subitem titled "Milk" under "Buy groceries". Verify the hierarchy is preserved.
6. Mark "Buy groceries" complete. Verify "Milk" is also marked complete.
7. Unmark "Buy groceries". Verify "Milk" retains its completed state (FR-005a).
8. Mark "Milk" incomplete. Verify "Buy groceries" becomes incomplete (FR-006).
9. Mark "Milk" complete again. Verify "Buy groceries" auto-completes (FR-017).
10. Rename "Home" to "Groceries". Verify the updated name is displayed.
11. Delete "Buy groceries". Verify it and "Milk" are both removed.
12. Reload the page. Verify "Groceries" list is still present (FR-009, FR-011).

All 12 steps MUST pass before marking T078 done.

## Test

```bash
# Backend tests
cd backend && npm test && cd ..

# Frontend tests
cd frontend && npm test && cd ..
```

## Test coverage gate

```bash
cd backend && npm run test:coverage && cd ..
cd frontend && npm run test:coverage && cd ..
```

Both MUST report ≥80% lines, branches, functions, and statements (constitution §IV).

## Storybook

```bash
cd frontend && npm run storybook
```

Open [http://localhost:6006](http://localhost:6006) to view component stories.

## Notes

- The API is the sole source of truth; Redux state is ephemeral and MUST NOT be persisted.
- The offline sync queue is the only permitted local persistence, stored in IndexedDB via `idb`.
- Offline edits are queued locally and flushed to `POST /api/sync/operations` once connectivity returns.
- Last-write-wins conflict resolution uses `updatedAt` ISO 8601 timestamps on all entities.
- Title max length is 255 characters; exceeding this limit returns HTTP 422 with an inline error.
