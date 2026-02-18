# Data Model: Hierarchical Todo Lists

## Entities

### TodoList

- **Fields**:
  - `id` (string, UUID, unique)
  - `name` (string, required, max 255 chars, unique across all lists)
  - `position` (integer, required, >= 0, unique within all lists)
  - `createdAt` (ISO 8601 timestamp, required)
  - `updatedAt` (ISO 8601 timestamp, required, updated on every change)
- **Relationships**:
  - One TodoList has many TodoItems (cascade delete).

### TodoItem

- **Fields**:
  - `id` (string, UUID, unique)
  - `listId` (string, required, foreign key → TodoList.id)
  - `title` (string, required, max 255 chars, unique within parent list)
  - `completed` (boolean, required, default false)
  - `position` (integer, required, >= 0, unique within parent list)
  - `createdAt` (ISO 8601 timestamp, required)
  - `updatedAt` (ISO 8601 timestamp, required, updated on every change)
- **Relationships**:
  - One TodoItem belongs to one TodoList.
  - One TodoItem has many SubItems (cascade delete).

### SubItem

- **Fields**:
  - `id` (string, UUID, unique)
  - `todoId` (string, required, foreign key → TodoItem.id)
  - `title` (string, required, max 255 chars, unique within parent todo)
  - `completed` (boolean, required, default false)
  - `position` (integer, required, >= 0, unique within parent todo)
  - `createdAt` (ISO 8601 timestamp, required)
  - `updatedAt` (ISO 8601 timestamp, required, updated on every change)
- **Relationships**:
  - One SubItem belongs to one TodoItem.

### OfflineOperation (client-side queue, stored in IndexedDB)

- **Fields**:
  - `id` (string, UUID, unique)
  - `entityType` (enum: `list` | `todo` | `subitem`)
  - `operation` (enum: `create` | `update` | `delete` | `reorder`)
  - `entityId` (string, required)
  - `payload` (JSON object, required — full updated field values)
  - `clientTimestamp` (ISO 8601 timestamp, required — used for last-write-wins comparison)
  - `idempotencyKey` (string, required — prevents duplicate application on retry)
- **Storage**: IndexedDB only; MUST NOT be stored in Redux or localStorage.
- **Lifecycle**: Operations are appended while offline; flushed to `POST /sync/operations` when connectivity returns; removed from queue on successful `applied` response.

## Validation Rules

- List `name`: required, max 255 chars, unique across all lists (Zod + SQLite UNIQUE index).
- TodoItem `title`: required, max 255 chars, unique within parent list (Zod + SQLite UNIQUE index on `(listId, title)`).
- SubItem `title`: required, max 255 chars, unique within parent todo (Zod + SQLite UNIQUE index on `(todoId, title)`).
- `position` values are non-negative integers, unique within their parent scope; renumbered on conflict after offline replay.
- `completed` defaults to `false`; required on create.
- `updatedAt` MUST be updated on every mutation for last-write-wins conflict resolution.
- Titles exceeding 255 characters MUST be rejected with HTTP 422 and an inline validation error message.

## State Transitions

- **Mark todo complete** (FR-005): all subitems `completed` → `true`.
- **Mark todo incomplete** (FR-022): subitems retain their individual `completed` state unchanged.
- **Mark subitem incomplete** (FR-006): parent todo `completed` → `false`.
- **All subitems complete** (FR-017): parent todo `completed` → `true` automatically.
- **Delete todo** (FR-018): all child SubItems deleted immediately (cascade); no undo.
- **Delete list** (FR-018): all child TodoItems and their SubItems deleted immediately (cascade); no undo.
- **Offline sync conflict** (FR-013): if `clientTimestamp` < current server `updatedAt`, operation is skipped (server wins); result returned as `conflicted` in SyncResponse.

## Empty & Error States

- **No lists in app** (FR-020): frontend MUST render `EmptyState` with add-list call-to-action.
- **List has no todos** (FR-020): frontend MUST render `EmptyState` with add-todo call-to-action.
- **Startup load failure** (FR-021): frontend MUST render `ErrorBanner` with retry button; stale or empty data MUST NOT be displayed.
