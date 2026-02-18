# Research: Hierarchical Todo Lists

## Decision 1: Database choice

- **Decision**: Use SQLite for the backend database.
- **Rationale**: Single-user scope favors an embedded DB with low operational overhead. SQLite provides ACID transactions for ordered updates and last-write-wins conflict resolution, while remaining easy to migrate later.
- **Alternatives considered**:
  - File-based storage (JSON/YAML): too fragile for uniqueness rules, ordering, and offline queue reliability.
  - PostgreSQL: operationally heavier than needed for a single-user app.

## Decision 2: Offline queue pattern

- **Decision**: Implement an outbox-style offline queue with idempotent operations and server-side last-write-wins.
- **Rationale**: A write-only queue keeps the API as source of truth while enabling offline edits. Idempotency keys prevent duplication; server timestamps or versions resolve conflicts deterministically.
- **Alternatives considered**:
  - Full local persistence with later reconciliation: violates constitution constraints.
  - Client-only conflict resolution: less reliable and harder to keep API authoritative.

## Decision 3: API-driven state best practices

- **Decision**: Use RTK Query for server data, Redux slices for UI state, and container/presentational separation with memoized selectors.
- **Rationale**: Aligns with constitution requirements for API-driven state, predictable containers, and performance-safe selector usage without persistence.
- **Alternatives considered**:
  - Storing server data in custom slices: more boilerplate and higher risk of stale data.
  - Passing store data through props instead of selectors: violates selector-first guidance.
