# Research: Hierarchical Todo Lists

**Branch**: `001-hierarchical-todos` | **Date**: February 18, 2026

---

## Decision 1: SQLite library choice

- **Decision**: `better-sqlite3`
- **Rationale**: Synchronous API is idiomatic for single-user Node.js servers where async overhead adds no benefit. It is the most actively maintained SQLite binding for Node.js, has first-class TypeScript types (`@types/better-sqlite3`), and supports WAL mode for concurrent reads.
- **Alternatives considered**:
  - `sqlite3` (async callbacks): less ergonomic, no benefit in single-user single-process server.
  - Knex (query builder): adds abstraction without clear benefit for a simple three-table schema.
  - Prisma (ORM): too heavy for an embedded single-user use case.

## Decision 2: Migration runner

- **Decision**: Custom lightweight migration runner (raw SQL files + a `schema_migrations` tracking table, run in a transaction).
- **Rationale**: The schema is small (3 entity tables + 1 offline queue table). A custom runner is ~50 lines of TypeScript, fully transparent, and has no version lock-in. No external dependency required.
- **Alternatives considered**:
  - Knex migrations: adds query-builder dependency to backend.
  - `db-migrate`: additional NPM dep, learning curve, no benefit at this scale.
  - Prisma Migrate: too heavy for embedded SQLite.

## Decision 3: Manual ordering strategy

- **Decision**: Integer `position` field per entity; full-list renumber on conflict.
- **Rationale**: Storing a `position` integer on each TodoList, TodoItem, and SubItem row is the simplest ordered-list solution. On reorder, update only the affected rows. If positions become non-unique after offline replay, renumber the full parent list on next fetch (single UPDATE sweep). Single-user context means this is rare.
- **Alternatives considered**:
  - Fractional indexing / LexoRank: avoids renumbering but is unnecessary complexity for a single-user app.
  - Linked-list ordering: complex traversal queries, harder to maintain.
  - Array column in parent row: not portable to relational SQLite.

## Decision 4: Offline sync queue persistence

- **Decision**: IndexedDB via the `idb` library (thin Promise wrapper, ~1 KB).
- **Rationale**: Constitution §III permits exactly one form of local persistence: the offline sync queue. IndexedDB is the browser standard for structured local storage, survives page reloads, and stores arbitrary objects without serialisation limits. `idb` provides a clean async API without framework lock-in.
- **Alternatives considered**:
  - localStorage: synchronous, 5 MB limit, string-only — cannot store complex operation payloads reliably.
  - sessionStorage: cleared on tab close; does not survive reload, breaking FR-010.
  - Service worker Cache API: designed for HTTP responses, not structured data.

## Decision 5: Last-write-wins conflict resolution

- **Decision**: Compare `updatedAt` ISO 8601 timestamp on each operation; the operation with the most recent `updatedAt` wins. All three entities carry `updatedAt`.
- **Rationale**: ISO 8601 timestamps stored as TEXT in SQLite are lexicographically sortable. Each offline operation in the queue stores the `updatedAt` at queue time; on sync the server compares against the current DB `updatedAt` and skips the operation if the DB record is newer (FR-013).
- **Alternatives considered**:
  - Vector clocks: overkill for a single-user app with no concurrent writers.
  - CRDTs: unnecessary complexity at this scale.
  - Server-always-wins: rejected per spec clarification (last-write-wins required).

## Decision 6: Completion cascade rules (server-side)

- **Decision**: All cascade logic lives in `completionRules.ts`, invoked by the service layer on every completion toggle. Four rules:
  1. Mark todo complete → all subitems `completed = true` (FR-005)
  2. Mark todo incomplete → subitems retain individual state (FR-005a)
  3. Mark subitem incomplete → parent todo `completed = false` (FR-006)
  4. All subitems now complete → parent todo `completed = true` (FR-017)
- **Rationale**: Centralising cascade logic server-side ensures consistency for both online requests and offline queue replay. Frontend applies optimistic updates but defers final authority to the API response.
- **Alternatives considered**:
  - Client-side-only cascade: inconsistent when queue-replayed operations execute server-side.
  - Database triggers: opaque, hard to test, SQLite trigger syntax limitations.

## Decision 7: PWA caching strategy

- **Decision**: Cache-first for static assets (JS, CSS, images via Workbox `GenerateSW`); network-first for all API requests with graceful offline fallback to queued operations.
- **Rationale**: Static assets do not change between deployments; cache-first gives instant load. API requests need fresh data; network-first preserves constitution §III API-driven state while gracefully degrading to queued writes when offline.
- **Alternatives considered**:
  - Stale-while-revalidate for API: risks showing stale data, violates §III.
  - Cache-only for API: breaks FR-011 (load latest on startup).

## Decision 8: Uniqueness enforcement (two-layer)

- **Decision**: Zod schema validation in `validation.ts` + SQLite UNIQUE constraints in migration DDL. Scope boundary: `validation.ts` owns Zod schemas and uniqueness query helpers; `migrations/` owns DDL UNIQUE indexes.
- **Rationale**: Zod provides fast inline user-facing errors before any DB round-trip (FR-014–016, FR-019). SQLite UNIQUE constraints are the safety net for any code path that bypasses Zod. Both layers enforce the same rules independently.
- **Alternatives considered**:
  - Zod only: no DB-level guarantee; data can be corrupted by direct SQL access or migration resets.
  - DB only: no user-facing validation errors without an extra DB round-trip per keystroke.

## Decision 9: Empty and error state components

- **Decision**: Reusable `EmptyState` component with `message`, `actionLabel`, and `onAction` props (covers FR-020); dedicated `ErrorBanner` component with `message` and `onRetry` props (covers FR-021).
- **Rationale**: Both scenarios share a centred-message + CTA pattern; a single parameterised `EmptyState` eliminates duplication across empty-list and empty-app contexts. `ErrorBanner` is distinct because it has error-level visual treatment and retry semantics that differ from a neutral empty state.
- **Alternatives considered**:
  - Inline ad-hoc JSX per container: duplication, harder to test.
  - Ant Design `Empty` component directly in containers: couples display logic to containers, harder to unit test in isolation.

## Decision 10: Title length validation

- **Decision**: Maximum 255 characters enforced at Zod schema level (`z.string().max(255)`) and at DB level (SQLite `CHECK(length(name) <= 255)` in migration DDL).
- **Rationale**: 255 chars is the universal single-line text field standard. SQLite does not enforce VARCHAR length natively, so a CHECK constraint in DDL is required alongside Zod (FR-019).
- **Alternatives considered**:
  - 500 chars: no use case identified; spec clarification confirmed 255.
  - Unlimited: violates FR-019; makes layout unpredictable with very long strings.

## Decision 11: API-driven state with RTK Query

- **Decision**: RTK Query for all server data (lists, todos, subitems); Redux slices for UI-only state (selected list ID, loading indicators). No redux-persist. Container selectors (`getAppContainerProps`, `getTodoListsViewContainerProps`) use `createSelector` from RTK.
- **Rationale**: RTK Query handles caching, invalidation, and loading state automatically, keeping Redux slices clean. Selectors decouple containers from store shape (constitution §V). Adding redux-persist to any slice would violate constitution §III.
- **Alternatives considered**:
  - Custom Redux slices for server data: more boilerplate, higher risk of stale data, no automatic invalidation.
  - Passing store data through component props: violates constitution §V selector-first guidance.

---

## NEEDS CLARIFICATION — all resolved

| Unknown | Resolved |
|---------|----------|
| SQLite library | Decision 1: `better-sqlite3` |
| Migration tool | Decision 2: custom runner |
| Ordering strategy | Decision 3: integer `position` |
| Offline queue storage medium | Decision 4: IndexedDB via `idb` |
| Conflict resolution detail | Decision 5: `updatedAt` timestamp comparison |
| Completion cascade rules | Decision 6: server-side `completionRules.ts`, 4 rules |
| PWA caching strategy | Decision 7: cache-first assets / network-first API |
| Uniqueness enforcement scope | Decision 8: Zod (`validation.ts`) + SQLite DDL (`migrations/`) |
| Empty / error state patterns | Decision 9: `EmptyState` + `ErrorBanner` components |
| Title max length | Decision 10: 255 chars, Zod + SQLite CHECK |
| State management pattern | Decision 11: RTK Query + Redux slices, no redux-persist |
