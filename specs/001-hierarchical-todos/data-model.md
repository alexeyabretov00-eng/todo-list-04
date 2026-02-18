# Data Model: Hierarchical Todo Lists

## Entities

### TodoList

- **Fields**:
  - `id` (string, unique)
  - `name` (string, required, unique across lists)
  - `order` (integer, required, >= 0)
  - `createdAt` (timestamp, required)
  - `updatedAt` (timestamp, required)
- **Relationships**:
  - One TodoList has many TodoItems.

### TodoItem

- **Fields**:
  - `id` (string, unique)
  - `listId` (string, required, references TodoList)
  - `title` (string, required, unique within list)
  - `completed` (boolean, required)
  - `order` (integer, required, >= 0)
  - `createdAt` (timestamp, required)
  - `updatedAt` (timestamp, required)
- **Relationships**:
  - One TodoItem belongs to one TodoList.
  - One TodoItem has many SubItems.

### SubItem

- **Fields**:
  - `id` (string, unique)
  - `todoId` (string, required, references TodoItem)
  - `title` (string, required, unique within todo)
  - `completed` (boolean, required)
  - `order` (integer, required, >= 0)
  - `createdAt` (timestamp, required)
  - `updatedAt` (timestamp, required)
- **Relationships**:
  - One SubItem belongs to one TodoItem.

### OfflineOperation (queue)

- **Fields**:
  - `id` (string, unique)
  - `entityType` (enum: list | todo | subitem)
  - `operation` (enum: create | update | delete | reorder)
  - `entityId` (string, required)
  - `payload` (json, required)
  - `clientTimestamp` (timestamp, required)
  - `idempotencyKey` (string, required)

## Validation Rules

- List names are required and must be unique across lists.
- Todo titles are required and must be unique within their list.
- Subitem titles are required and must be unique within their parent todo.
- `order` values are non-negative integers and are unique within their parent scope.
- `completed` is required for todos and subitems.
- `updatedAt` is updated on any change for last-write-wins resolution.

## State Transitions

- Marking a todo complete marks all its subitems complete.
- Marking any subitem incomplete marks its parent todo incomplete.
- When all subitems become complete, the parent todo is auto-completed.
- Deleting a todo removes all subitems immediately.
- Offline operations are applied in order; conflicts resolve by last-write-wins based on `updatedAt`/`clientTimestamp`.
