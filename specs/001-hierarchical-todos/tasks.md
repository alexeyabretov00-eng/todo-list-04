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
- [ ] T002 Initialize backend package and scripts in backend/package.json
- [ ] T003 Initialize frontend package and scripts in frontend/package.json
- [ ] T004 [P] Configure backend TypeScript in backend/tsconfig.json
- [ ] T005 [P] Configure frontend TypeScript + path aliases in frontend/tsconfig.json
- [ ] T006 [P] Configure Webpack build and alias resolution in frontend/webpack.config.js
- [ ] T007 [P] Configure ESLint + Prettier for frontend in frontend/.eslintrc.cjs and frontend/.prettierrc
- [ ] T008 [P] Configure ESLint + Prettier for backend in backend/.eslintrc.cjs and backend/.prettierrc
- [ ] T009 [P] Configure Jest in frontend/jest.config.ts and backend/jest.config.ts
- [ ] T010 [P] Configure Storybook in frontend/.storybook/main.ts and frontend/.storybook/preview.ts
- [ ] T011 [P] Add commitlint configuration in commitlint.config.cjs
- [ ] T012 [P] Add environment templates in frontend/.env.example and backend/.env.example
- [ ] T079 [P] Add PWA manifest in frontend/public/manifest.json
- [ ] T080 [P] Add service worker registration in frontend/src/services/serviceWorker.ts
- [ ] T081 [P] Configure offline asset caching strategy in frontend/src/services/offlineCache.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before user stories

- [ ] T013 Create backend server bootstrap in backend/src/server.ts
- [ ] T014 [P] Create backend routing entry in backend/src/api/index.ts
- [ ] T015 [P] Implement backend error handling middleware in backend/src/api/errorHandler.ts
- [ ] T016 [P] Configure SQLite connection in backend/src/services/db.ts
- [ ] T017 [P] Define data models in backend/src/models/todoList.ts, backend/src/models/todoItem.ts, backend/src/models/subItem.ts
- [ ] T018 [P] Define offline queue model in backend/src/models/offlineOperation.ts
- [ ] T019 Create validation schemas in backend/src/services/validation.ts
- [ ] T082 Create database schema and migrations in backend/src/services/migrations/
- [ ] T083 Enforce uniqueness constraints at DB and validation layers in backend/src/services/validation.ts and backend/src/services/migrations/
- [ ] T020 [P] Create shared frontend types in frontend/src/types/todos.ts
- [ ] T021 [P] Create Redux store in frontend/src/store/store.ts
- [ ] T022 [P] Create RTK Query base API in frontend/src/api/baseApi.ts
- [ ] T023 [P] Create offline queue service in frontend/src/services/offlineQueue.ts
- [ ] T072 [P] Add offline sync endpoint implementation in backend/src/api/sync.ts
- [ ] T073 [P] Add offline sync service implementation in backend/src/services/syncService.ts
- [ ] T074 [P] Wire offline sync to RTK Query in frontend/src/api/todoApi.ts
- [ ] T024 [P] Create selectors in frontend/src/selectors/containers.ts
- [ ] T025 [P] Create root AppContainer in frontend/src/containers/AppContainer/AppContainer.tsx
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

- [ ] T033 [P] [US1] Implement list service in backend/src/services/listService.ts
- [ ] T034 [P] [US1] Implement todo service in backend/src/services/todoService.ts
- [ ] T035 [P] [US1] Implement subitem service in backend/src/services/subItemService.ts
- [ ] T036 [P] [US1] Implement list routes in backend/src/api/lists.ts
- [ ] T037 [P] [US1] Implement todo routes in backend/src/api/todos.ts
- [ ] T038 [P] [US1] Implement subitem routes in backend/src/api/subitems.ts
- [ ] T039 [P] [US1] Add list endpoints to frontend RTK Query in frontend/src/api/todoApi.ts
- [ ] T040 [P] [US1] Add todo endpoints to frontend RTK Query in frontend/src/api/todoApi.ts
- [ ] T041 [P] [US1] Add subitem endpoints to frontend RTK Query in frontend/src/api/todoApi.ts
- [ ] T042 [P] [US1] Create ListForm component in frontend/src/components/ListForm/ListForm.tsx
- [ ] T043 [P] [US1] Create TodoItemForm component in frontend/src/components/TodoItemForm/TodoItemForm.tsx
- [ ] T044 [P] [US1] Create SubItemForm component in frontend/src/components/SubItemForm/SubItemForm.tsx
- [ ] T045 [P] [US1] Create ListPanel component in frontend/src/components/ListPanel/ListPanel.tsx
- [ ] T046 [P] [US1] Create TodoListView component in frontend/src/components/TodoListView/TodoListView.tsx
- [ ] T047 [US1] Wire list/todo/subitem creation in frontend/src/containers/AppContainer/AppContainer.tsx
- [ ] T048 [P] [US1] Add Storybook stories for new components in frontend/src/components/ListForm/__stories__/ListForm.stories.tsx and related files

**Checkpoint**: User Story 1 is functional and independently testable.

---

## Phase 4: User Story 2 - Track completion across parent and child items (Priority: P2)

**Goal**: Toggle completion with parent-child propagation and auto-complete.

**Independent Test**: Toggle completion on a todo and subitems; verify parent/child updates.

### Tests for User Story 2

- [ ] T049 [P] [US2] Contract tests for completion updates in backend/tests/contract/completion.test.ts
- [ ] T050 [P] [US2] Service tests for completion rules in backend/tests/unit/completionRules.test.ts
- [ ] T051 [P] [US2] Component tests for completion toggle in frontend/src/components/TodoItemRow/__tests__/TodoItemRow.test.tsx

### Implementation for User Story 2

- [ ] T052 [US2] Implement completion rules in backend/src/services/completionRules.ts
- [ ] T053 [US2] Update todo/subitem services for completion logic in backend/src/services/todoService.ts and backend/src/services/subItemService.ts
- [ ] T054 [US2] Expose completion updates in backend/src/api/todos.ts and backend/src/api/subitems.ts
- [ ] T055 [US2] Add completion mutations to frontend RTK Query in frontend/src/api/todoApi.ts
- [ ] T056 [P] [US2] Create TodoItemRow component in frontend/src/components/TodoItemRow/TodoItemRow.tsx
- [ ] T057 [P] [US2] Create SubItemRow component in frontend/src/components/SubItemRow/SubItemRow.tsx
- [ ] T058 [US2] Wire completion toggles in frontend/src/containers/AppContainer/AppContainer.tsx
- [ ] T059 [P] [US2] Add Storybook stories for completion components in frontend/src/components/TodoItemRow/__stories__/TodoItemRow.stories.tsx

**Checkpoint**: User Story 2 works independently with correct parent/child completion behavior.

---

## Phase 5: User Story 3 - Edit and organize lists (Priority: P3)

**Goal**: Rename/delete items and reorder lists, todos, and subitems.

**Independent Test**: Rename and delete items at each level; reorder lists/todos/subitems and verify persistence.

### Tests for User Story 3

- [ ] T060 [P] [US3] Contract tests for rename/delete in backend/tests/contract/editing.test.ts
- [ ] T061 [P] [US3] Contract tests for reorder in backend/tests/contract/reorder.test.ts
- [ ] T062 [P] [US3] Component tests for edit/delete in frontend/src/components/InlineEdit/__tests__/InlineEdit.test.tsx

### Implementation for User Story 3

- [ ] T063 [US3] Implement rename/delete in backend/src/services/listService.ts, backend/src/services/todoService.ts, backend/src/services/subItemService.ts
- [ ] T064 [US3] Implement reorder service in backend/src/services/reorderService.ts
- [ ] T065 [US3] Add edit/delete routes in backend/src/api/lists.ts, backend/src/api/todos.ts, backend/src/api/subitems.ts
- [ ] T066 [US3] Add reorder routes in backend/src/api/lists.ts, backend/src/api/todos.ts, backend/src/api/subitems.ts
- [ ] T067 [US3] Add edit/reorder mutations in frontend/src/api/todoApi.ts
- [ ] T068 [P] [US3] Create InlineEdit component in frontend/src/components/InlineEdit/InlineEdit.tsx
- [ ] T069 [P] [US3] Create ReorderList component in frontend/src/components/ReorderList/ReorderList.tsx
- [ ] T070 [US3] Wire edit/delete/reorder in frontend/src/containers/AppContainer/AppContainer.tsx
- [ ] T071 [P] [US3] Add Storybook stories for editing components in frontend/src/components/InlineEdit/__stories__/InlineEdit.stories.tsx

**Checkpoint**: User Story 3 works independently with rename/delete/reorder features.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T075 [P] Add offline sync UI indicators in frontend/src/components/SyncStatus/SyncStatus.tsx
- [ ] T076 Add sync status wiring in frontend/src/containers/AppContainer/AppContainer.tsx
- [ ] T077 [P] Add Storybook story for sync status in frontend/src/components/SyncStatus/__stories__/SyncStatus.stories.tsx
- [ ] T078 Run quickstart validation steps in specs/001-hierarchical-todos/quickstart.md
- [ ] T084 Validate responsive layout on mobile and desktop viewports in frontend (manual checklist)

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

### Parallel Execution Examples

**User Story 1**

- T027, T028, T029 can run in parallel (contract tests).
- T033, T034, T035 can run in parallel (services).
- T042, T043, T044 can run in parallel (form components).

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
