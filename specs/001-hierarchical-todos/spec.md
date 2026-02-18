# Feature Specification: Hierarchical Todo Lists

**Feature Branch**: `001-hierarchical-todos`  
**Created**: February 17, 2026  
**Status**: Draft  
**Input**: User description: "i need create todo app it support todo list, each list item contains todo elements and each todo element contains sub items"

## Clarifications

### Session 2026-02-17

- Q: How should lists, todos, and subitems be ordered? → A: Manual ordering (user can reorder lists, todos, subitems)
- Q: How should offline sync conflicts be handled? → A: Last write wins (most recent change after sync)
- Q: Should titles be unique within their parent? → A: Titles must be unique within their parent (list/todo)
- Q: Should a parent todo auto-complete when all subitems are complete? → A: Parent auto-completes when all subitems complete
- Q: Should deletes support undo? → A: Immediate delete (no undo)

### Session 2026-02-18

- Q: When a todo is marked incomplete, what happens to its subitems? → A: Subitems keep their current completion state (only the parent todo changes)
- Q: What is the maximum allowed title length for lists, todos, and subitems? → A: 255 characters
- Q: What should the app display when a list has no todos yet? → A: Show a placeholder message (e.g. "No todos yet — add one to get started") with a visible add button
- Q: Should `updatedAt` be tracked on all three entity types for conflict detection? → A: Yes — `updatedAt` on TodoList, TodoItem, and SubItem
- Q: What should the app show when data fails to load on startup? → A: Show an error message with a retry button; do not display stale or empty data

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create lists with nested tasks (Priority: P1)

As a user, I want to create a todo list and add todo items with subitems so I can break work into smaller steps.

**Why this priority**: This is the core value of the app and defines the hierarchical structure.

**Independent Test**: Create a list, add a todo item, add at least one subitem, and confirm the hierarchy is preserved.

**Acceptance Scenarios**:

1. **Given** no lists exist, **When** I create a list named "Home", **Then** the list is available for adding todos.
2. **Given** a list exists, **When** I add a todo item and a subitem, **Then** the subitem appears under its parent todo.

---

### User Story 2 - Track completion across parent and child items (Priority: P2)

As a user, I want to mark todos and subitems complete so I can track progress.

**Why this priority**: Progress tracking is the primary reason users manage tasks.

**Independent Test**: Toggle completion on a todo and its subitems and verify status updates.

**Acceptance Scenarios**:

1. **Given** a todo with subitems, **When** I mark the todo complete, **Then** all its subitems are marked complete.
2. **Given** a todo with subitems, **When** I mark any subitem incomplete, **Then** the parent todo is marked incomplete.

---

### User Story 3 - Edit and organize lists (Priority: P3)

As a user, I want to rename or remove lists, todos, and subitems so I can keep my tasks current.

**Why this priority**: Editing keeps the data accurate and prevents clutter.

**Independent Test**: Rename and delete items at each level and confirm updates are reflected correctly.

**Acceptance Scenarios**:

1. **Given** a list with todos and subitems, **When** I rename a todo, **Then** the updated name is shown everywhere it appears.
2. **Given** a todo with subitems, **When** I delete the todo, **Then** the todo and all its subitems are removed from the list.

### Edge Cases

- Deleting a todo that has subitems removes the entire subtree without orphaned data.
- Marking a parent todo complete while subitems are incomplete results in all subitems being completed.
- Marking a parent todo incomplete does not change the completion state of its subitems; each subitem retains its individual state.
- When the final subitem is completed, the parent todo becomes completed automatically.
- Deleted lists, todos, and subitems are removed immediately with no undo.
- A list with no todos remains visible, displays a placeholder empty-state message, and shows a visible add-todo button.
- Titles up to 255 characters are stored without data loss and remain associated with the correct item; titles exceeding 255 characters are rejected at input with a validation error.
- If offline edits conflict on sync, the most recent change is retained.
- If the app fails to load data on startup due to a network or API error, an error message and retry button are shown; the app MUST NOT render an empty list state or partial data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to create, rename, and delete todo lists.
- **FR-002**: Users MUST be able to add, edit, and delete todo items within a list.
- **FR-003**: Users MUST be able to add, edit, and delete subitems under a todo item.
- **FR-004**: Users MUST be able to mark todos and subitems as complete or incomplete.
- **FR-005**: When a todo is marked complete, all its subitems MUST be marked complete.
- **FR-022**: When a todo is marked incomplete, its subitems MUST retain their individual completion state unchanged.
- **FR-006**: When any subitem is marked incomplete, the parent todo MUST be marked incomplete.
- **FR-007**: The app MUST work without user accounts or sign-in.
- **FR-008**: The app MUST be usable on both desktop and mobile screens.
- **FR-009**: The app MUST allow users to view and edit existing lists after closing and reopening the app.
- **FR-010**: When offline, users MUST be able to make changes that are queued and applied once the backend API endpoint becomes reachable again.
- **FR-011**: On startup, the app MUST load the latest lists, todos, and subitems from the data service.
- **FR-012**: Users MUST be able to reorder lists, todos, and subitems manually.
- **FR-013**: When syncing offline changes, the most recent change MUST win if a conflict is detected.
- **FR-014**: List names MUST be unique within the app.
- **FR-015**: Todo titles MUST be unique within their list.
- **FR-016**: Subitem titles MUST be unique within their parent todo.
- **FR-017**: When all subitems are complete, the parent todo MUST be marked complete automatically.
- **FR-018**: Deleting lists, todos, or subitems MUST remove them immediately with no undo and without requiring a confirmation dialog.
- **FR-019**: Titles for lists, todos, and subitems MUST NOT exceed 255 characters; input exceeding this limit MUST be rejected with an inline validation error.
- **FR-020**: When a list contains no todos, the app MUST display a placeholder message and a visible add-todo button. When the app contains no lists, the app MUST display a placeholder message and a visible add-list button.
- **FR-021**: When the app fails to load data on startup (e.g. API unreachable), it MUST display an error message and a retry button; stale or empty data MUST NOT be silently presented.

### Key Entities *(include if feature involves data)*

- **TodoList**: A user-defined collection of todo items; attributes include name (max 255 chars, required), user-defined ordering, and `updatedAt` timestamp.
- **TodoItem**: A task within a list; attributes include title (max 255 chars, required), completion status, user-defined ordering, `updatedAt` timestamp, and its subitems.
- **SubItem**: A child task under a todo item; attributes include title (max 255 chars, required), completion status, user-defined ordering, and `updatedAt` timestamp.

### Assumptions

- The app is single-user with no collaboration or sharing.
- Todos support a single level of subitems (no deeper nesting).
- Titles are required for lists, todos, and subitems.
- The data service is the local REST API backed by SQLite, served from the same origin; it is the single source of truth for all application data.

### Out of Scope

- Multi-user collaboration or shared lists.
- Due dates, reminders, notifications, or recurring tasks.
- Attachments, comments, or rich-text formatting.
- Nested subitems beyond one level.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New users can create a list with one todo and one subitem in under 2 minutes.
- **SC-002**: At least 95% of users in a usability test complete the core flow (create list, add todo + subitem, mark complete) on the first attempt.
- **SC-003**: Data remains intact after closing and reopening the app in 100% of tested sessions.
- **SC-004**: Users can manage a list with at least 200 todos and 500 subitems without data loss or missing items.
- **SC-005**: Users can create and edit todos while offline and see changes synced within 30 seconds after reconnecting.
