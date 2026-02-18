---
description: "Task list for hierarchical todo app implementation"
---

# Tasks: Hierarchical Todo Lists

**Input**: Design documents from `/specs/001-hierarchical-todos/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included (constitution requires Jest >=80% coverage and TDD).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and base tooling

- [ ] T001 Create frontend/backend folder structure in frontend/src/ and backend/src/
- [ ] T002 Initialize backend package and scripts in backend/package.json — all dependency versions MUST be exact (no `^` or `~` prefixes); install latest stable versions at time of creation
- [ ] T003 Initialize frontend package and scripts in frontend/package.json — all dependency versions MUST be exact (no `^` or `~` prefixes); install latest stable versions at time of creation
- [ ] T004 [P] Configure backend TypeScript in backend/tsconfig.json
- [ ] T005 [P] Configure frontend TypeScript + path aliases in frontend/tsconfig.json
- [ ] T006 [P] Configure Webpack build and alias resolution in frontend/webpack.config.js
- [ ] T007 [P] Configure ESLint + Prettier for frontend in frontend/.eslintrc.cjs and frontend/.prettierrc — MUST enable `eslint-plugin-simple-import-sort` rules; MUST add a rule disallowing wildcard imports (`import *`) and wildcard re-exports (`export * from`) per constitution §V
- [ ] T008 [P] Configure ESLint + Prettier for backend in backend/.eslintrc.cjs and backend/.prettierrc — MUST add a rule disallowing wildcard imports (`import *`) and wildcard re-exports (`export * from`) per constitution §V
- [ ] T009 [P] Configure Jest in frontend/jest.config.ts and backend/jest.config.ts — MUST include `coverageThreshold: { global: { lines: 80, branches: 80, functions: 80, statements: 80 } }` to enforce constitution §IV ≥80% coverage gate; add `"test:coverage": "jest --coverage"` npm script to both packages
- [ ] T010 [P] Configure Storybook in frontend/.storybook/main.ts and frontend/.storybook/preview.ts
- [ ] T011 [P] Add commitlint configuration in commitlint.config.cjs
- [ ] T012 [P] Add environment templates in frontend/.env.example and backend/.env.example
- [ ] T079 [P] Add PWA manifest in frontend/public/manifest.json
- [ ] T080 [P] Add service worker registration in frontend/src/services/serviceWorker.ts
- [ ] T081 [P] Configure offline asset caching strategy in frontend/src/services/offlineCache.ts — cache-first for static assets (JS, CSS, images); network-first for API requests; document strategy in comments
- [ ] T085 [P] Add npm script to validate no version prefixes exist in frontend/package.json and backend/package.json — e.g., a `check:versions` script that fails if any dependency value starts with `^` or `~`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before user stories

- [ ] T013 Create backend server bootstrap in backend/src/server.ts
- [ ] T014 [P] Create backend routing entry in backend/src/api/index.ts
- [ ] T015 [P] Implement backend error handling middleware in backend/src/api/errorHandler.ts
- [ ] T016 [P] Configure SQLite connection in backend/src/services/db.ts
- [ ] T017 [P] Define data models in backend/src/models/todoList.ts, backend/src/models/todoItem.ts, backend/src/models/subItem.ts
- [ ] T018 [P] Define offline queue model in backend/src/models/offlineOperation.ts — model MUST enumerate all operation types: `create`, `update` (rename), `delete`, and `reorder`; include `entityType` (`list` | `todo` | `subitem`), `entityId`, `payload`, `updatedAt`, and `retryCount` fields
- [ ] T019 Create Zod validation schemas in backend/src/services/validation.ts — covers list name unique across app, todo title unique within list, subitem title unique within todo; Zod schemas only (`z.string().max(255)` etc.); does NOT own DDL — DB-layer uniqueness is owned exclusively by T082
- [ ] T082 Create database schema and migrations in backend/src/services/migrations/ — **sole owner of all DDL**; MUST include UNIQUE constraints (list.name, todo title+listId, subitem title+todoId) as SQLite UNIQUE index definitions; T019 Zod schemas must mirror these constraints but T082 is the authoritative source
- [ ] T020 [P] Create shared frontend types in frontend/src/types/todos.ts
- [ ] T021 [P] Create Redux store in frontend/src/store/store.ts
- [ ] T022 [P] Create RTK Query base API in frontend/src/api/baseApi.ts
- [ ] T023 [P] Create offline queue service in frontend/src/services/offlineQueue.ts
- [ ] T089 [P] Unit tests for offline queue service in frontend/src/services/__tests__/offlineQueue.test.ts — MUST be completed before T023 is considered done (TDD gate); validates FR-010: (a) pending operation is written to IndexedDB when offline, (b) queue is read and dispatched on reconnect, (c) successfully synced operations are removed from the queue
- [ ] T072 [P] Add offline sync endpoint implementation in backend/src/api/sync.ts
- [ ] T073 [P] Add offline sync service implementation in backend/src/services/syncService.ts — MUST implement last-write-wins by comparing timestamps on conflicting operations (see T086 for test coverage)
- [ ] T086 [P] Unit tests for last-write-wins conflict resolution in backend/tests/unit/syncConflict.test.ts — validates FR-013: when two operations modify the same item, the one with the most recent `updatedAt` timestamp wins after sync; MUST be completed before T073 is considered done (TDD gate)
- [ ] T090 [P] Unit/integration test for AppContainer startup data-load sequence in frontend/src/containers/AppContainer/__tests__/AppContainer.test.tsx — validates FR-011: (a) `GET /api/lists` is called on component mount, (b) returned list data is rendered, (c) loading state is shown while request is in-flight; complements T088 which covers the error path only; also MUST assert (d) when API returns an empty array, the add-list CTA (button/placeholder) is visible — covers the no-lists half of FR-020
- [ ] T074 [P] Wire offline sync to RTK Query in frontend/src/api/todoApi.ts — **creates the file shell** (baseApi injection, sync mutation); T039/T040/T041 extend this file in that order
- [ ] T024 [P] Create selectors in frontend/src/selectors/containers.ts
- [ ] T025 [P] Create root AppContainer in frontend/src/containers/AppContainer/AppContainer.tsx and frontend/src/containers/AppContainer/AppContainer.styled.ts
- [ ] T026 [P] Create global styles in frontend/src/styles/globalStyles.ts

---

## Phase 3: User Story 1 - Create lists with nested tasks (Priority: P1) 🎯 MVP

**Goal**: Create lists, todos, and subitems with manual ordering and API-driven state.

**Independent Test**: Create a list, add a todo, add a subitem, and confirm hierarchy is preserved.

### Tests for User Story 1

- [ ] T027 [P] [US1] Contract tests for list endpoints in backend/tests/contract/lists.test.ts
- [ ] T028 [P] [US1] Contract tests for todo endpoints in backend/tests/contract/todos.test.ts
- [ ] T029 [P] [US1] Contract tests for subitem endpoints in backend/tests/contract/subitems.test.ts
- [ ] T030 [P] [US1] Component tests for list creation in frontend/src/components/ListForm/__tests__/ListForm.test.tsx
- [ ] T031 [P] [US1] Component tests for todo creation in frontend/src/components/TodoItemForm/__tests__/TodoItemForm.test.tsx
- [ ] T032 [P] [US1] Component tests for subitem creation in frontend/src/components/SubItemForm/__tests__/SubItemForm.test.tsx

### Implementation for User Story 1

- [ ] T033 [P] [US1] Implement list service (Create + Read only) in backend/src/services/listService.ts — rename/delete operations are added by T063
- [ ] T034 [P] [US1] Implement todo service (Create + Read only) in backend/src/services/todoService.ts — rename/delete operations are added by T063
- [ ] T035 [P] [US1] Implement subitem service (Create + Read only) in backend/src/services/subItemService.ts — rename/delete operations are added by T063
- [ ] T036 [P] [US1] Implement list routes in backend/src/api/lists.ts
- [ ] T037 [P] [US1] Implement todo routes in backend/src/api/todos.ts
- [ ] T038 [P] [US1] Implement subitem routes in backend/src/api/subitems.ts
- [ ] T039 [US1] Add list endpoints to frontend RTK Query in frontend/src/api/todoApi.ts — **extends file created by T074; run after T074**
- [ ] T040 [US1] Add todo endpoints to frontend RTK Query in frontend/src/api/todoApi.ts — extends after T039
- [ ] T041 [US1] Add subitem endpoints to frontend RTK Query in frontend/src/api/todoApi.ts — extends after T040
- [ ] T042 [P] [US1] Create ListForm component in frontend/src/components/ListForm/ListForm.tsx and frontend/src/components/ListForm/ListForm.styled.ts — MUST display inline validation error when a duplicate list name is entered (Zod + react-hook-form); mirrors FR-014
- [ ] T043 [P] [US1] Create TodoItemForm component in frontend/src/components/TodoItemForm/TodoItemForm.tsx and frontend/src/components/TodoItemForm/TodoItemForm.styled.ts — MUST display inline validation error when a duplicate todo title is entered within the same list (Zod + react-hook-form); mirrors FR-015; MUST reject titles exceeding 255 characters with an inline error; mirrors FR-019
- [ ] T044 [P] [US1] Create SubItemForm component in frontend/src/components/SubItemForm/SubItemForm.tsx and frontend/src/components/SubItemForm/SubItemForm.styled.ts — MUST display inline validation error when a duplicate subitem title is entered within the same todo (Zod + react-hook-form); mirrors FR-016; MUST reject titles exceeding 255 characters with an inline error; mirrors FR-019
- [ ] T045 [P] [US1] Create ListPanel component in frontend/src/components/ListPanel/ListPanel.tsx and frontend/src/components/ListPanel/ListPanel.styled.ts
- [ ] T046 [P] [US1] Create TodoListView component in frontend/src/components/TodoListView/TodoListView.tsx and frontend/src/components/TodoListView/TodoListView.styled.ts
- [ ] T047 [US1] Wire list/todo/subitem creation in frontend/src/containers/AppContainer/AppContainer.tsx
- [ ] T087 [US1] Create TodoListsViewContainer in frontend/src/containers/TodoListsViewContainer/TodoListsViewContainer.tsx and frontend/src/containers/TodoListsViewContainer/TodoListsViewContainer.styled.ts — renders the active list's todos and subitems; add `getTodoListsViewContainerProps` selector in frontend/src/selectors/containers.ts
- [ ] T088 [P] [US1] Create ErrorBanner component in frontend/src/components/ErrorBanner/ErrorBanner.tsx and frontend/src/components/ErrorBanner/ErrorBanner.styled.ts — renders error message and a retry button; used by AppContainer when `GET /api/lists` returns a non-2xx response on startup; mirrors FR-021 and research Decision 9; component test in frontend/src/components/ErrorBanner/__tests__/ErrorBanner.test.tsx MUST cover: (a) banner renders with message and retry button, (b) onRetry callback fires on button click
- [ ] T048 [P] [US1] Add Storybook stories for new components in frontend/src/components/ListForm/__stories__/ListForm.stories.tsx, frontend/src/components/ErrorBanner/__stories__/ErrorBanner.stories.tsx, and related files

**Checkpoint**: User Story 1 is functional and independently testable.

---

## Phase 4: User Story 2 - Track completion across parent and child items (Priority: P2)

**Goal**: Toggle completion with parent-child propagation and auto-complete.

**Independent Test**: Toggle completion on a todo and subitems; verify parent/child updates.

### Tests for User Story 2

- [ ] T049 [P] [US2] Contract tests for completion updates in backend/tests/contract/completion.test.ts
- [ ] T050 [P] [US2] Service tests for completion rules in backend/tests/unit/completionRules.test.ts — MUST explicitly cover all four rules: FR-005 (marking todo complete cascades to subitems), FR-006 (any subitem incomplete marks parent incomplete), FR-017 (all subitems complete auto-completes parent), FR-022 (marking todo incomplete does NOT cascade to subitems — each subitem retains its current state)
- [ ] T051 [P] [US2] Component tests for completion toggle in frontend/src/components/TodoItemRow/__tests__/TodoItemRow.test.tsx

### Implementation for User Story 2

- [ ] T052 [US2] Implement completion rules in backend/src/services/completionRules.ts
- [ ] T053 [US2] Update todo/subitem services for completion logic in backend/src/services/todoService.ts and backend/src/services/subItemService.ts — **requires T041** (subitem RTK Query endpoints must exist before completion logic can be wired end-to-end)
- [ ] T054 [US2] Expose completion updates in backend/src/api/todos.ts and backend/src/api/subitems.ts — **requires T041**
- [ ] T055 [US2] Add completion mutations to frontend RTK Query in frontend/src/api/todoApi.ts
- [ ] T056 [P] [US2] Create TodoItemRow component in frontend/src/components/TodoItemRow/TodoItemRow.tsx and frontend/src/components/TodoItemRow/TodoItemRow.styled.ts
- [ ] T057 [P] [US2] Create SubItemRow component in frontend/src/components/SubItemRow/SubItemRow.tsx and frontend/src/components/SubItemRow/SubItemRow.styled.ts
- [ ] T058 [US2] Wire completion toggles in frontend/src/containers/AppContainer/AppContainer.tsx
- [ ] T059 [P] [US2] Add Storybook stories for completion components in frontend/src/components/TodoItemRow/__stories__/TodoItemRow.stories.tsx

**Checkpoint**: User Story 2 works independently with correct parent/child completion behavior.

---

## Phase 5: User Story 3 - Edit and organize lists (Priority: P3)

**Goal**: Rename/delete items and reorder lists, todos, and subitems.

**Independent Test**: Rename and delete items at each level; reorder lists/todos/subitems and verify persistence.

### Tests for User Story 3

- [ ] T060 [P] [US3] Contract tests for rename/delete in backend/tests/contract/editing.test.ts — MUST include assertion that `DELETE` completes without a confirmation step (i.e., a single request returns 200/204 with no intermediate confirm endpoint); mirrors FR-018
- [ ] T061 [P] [US3] Contract tests for reorder in backend/tests/contract/reorder.test.ts
- [ ] T062 [P] [US3] Component tests for edit/delete in frontend/src/components/InlineEdit/__tests__/InlineEdit.test.tsx — MUST assert that clicking delete does not render a confirmation modal/popover before the delete action fires; mirrors FR-018

### Implementation for User Story 3

- [ ] T063 [US3] Extend listService, todoService, and subItemService to add rename (PATCH) and delete operations in backend/src/services/listService.ts, backend/src/services/todoService.ts, backend/src/services/subItemService.ts — builds on CRUD scaffolding from T033/T034/T035; do not duplicate existing create/read methods
- [ ] T064 [US3] Implement reorder service in backend/src/services/reorderService.ts
- [ ] T065 [US3] Add edit/delete routes in backend/src/api/lists.ts, backend/src/api/todos.ts, backend/src/api/subitems.ts
- [ ] T066 [US3] Add reorder routes in backend/src/api/lists.ts, backend/src/api/todos.ts, backend/src/api/subitems.ts
- [ ] T067 [US3] Add edit/reorder mutations in frontend/src/api/todoApi.ts
- [ ] T068 [P] [US3] Create InlineEdit component in frontend/src/components/InlineEdit/InlineEdit.tsx and frontend/src/components/InlineEdit/InlineEdit.styled.ts
- [ ] T069 [P] [US3] Create ReorderList component in frontend/src/components/ReorderList/ReorderList.tsx and frontend/src/components/ReorderList/ReorderList.styled.ts — **custom component justified**: Ant Design's drag-sort is a Table variant unsuitable for plain ordered lists; a lightweight custom drag-and-drop list is required per constitution §V
- [ ] T070 [US3] Wire edit/delete/reorder in frontend/src/containers/AppContainer/AppContainer.tsx
- [ ] T071 [P] [US3] Add Storybook stories for editing components in frontend/src/components/InlineEdit/__stories__/InlineEdit.stories.tsx

**Checkpoint**: User Story 3 works independently with rename/delete/reorder features.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T075 [P] Add offline sync UI indicators in frontend/src/components/SyncStatus/SyncStatus.tsx and frontend/src/components/SyncStatus/SyncStatus.styled.ts
- [ ] T076 Add sync status wiring in frontend/src/containers/AppContainer/AppContainer.tsx
- [ ] T077 [P] Add Storybook story for sync status in frontend/src/components/SyncStatus/__stories__/SyncStatus.stories.tsx
- [ ] T078 Run quickstart validation steps in specs/001-hierarchical-todos/quickstart.md — done when all steps pass without errors in a fresh environment with no pre-existing database or cache
- [ ] T084 Validate responsive layout on mobile and desktop viewports — manual checklist covering: (a) 375px (mobile portrait), (b) 768px (tablet), (c) 1280px (desktop); verify touch interaction targets and no horizontal overflow at each breakpoint; pass/fail documented in checklist
- [ ] T091 [P] Automated viewport regression tests in frontend — add Jest + jsdom tests for key components (ListPanel, TodoItemRow, SubItemRow) that assert layout does not break at 375px viewport width; covers FR-008 and constitution §II automated test gate

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Stories (Phase 3-5)**: Depend on Foundational phase completion; can proceed in parallel by priority.
- **Polish (Phase 6)**: Depends on user stories as needed.

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only.
- **US2 (P2)**: Depends on Foundational and US1 APIs for todos/subitems.
- **US3 (P3)**: Depends on Foundational and US1 entities; can be parallelized after US1 models/services.
- **T086**: Must complete before T073 is considered done (TDD gate — syncService has no tests otherwise until Phase 4).
- **T089**: Must complete before T023 is considered done (TDD gate — offlineQueue service has no tests otherwise).
- **T041**: Must complete before T053 and T054 can be wired end-to-end (subitem RTK Query endpoints are required for completion logic; cross-phase dependency Phase 3 → Phase 4).

### Parallel Execution Examples

**User Story 1**

- T027, T028, T029 can run in parallel (contract tests).
- T033, T034, T035 can run in parallel (services).
- T042, T043, T044 can run in parallel (form components).
- T045, T046, T088 can run in parallel (panel, list view, error banner components).

**User Story 2**

- T049, T050, T051 can run in parallel (tests).
- T056 and T057 can run in parallel (row components).

**User Story 3**

- T060, T061, T062 can run in parallel (tests).
- T068 and T069 can run in parallel (editing/reorder components).

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate User Story 1 independently using its tests and acceptance scenarios.

### Incremental Delivery

1. Setup + Foundational.
2. US1 -> validate.
3. US2 -> validate.
4. US3 -> validate.
5. Polish tasks as needed.
