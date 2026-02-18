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

- [X] T001 Create frontend/backend folder structure in frontend/src/ and backend/src/
- [X] T002 Initialize backend package and scripts in backend/package.json — all dependency versions MUST be exact (no `^` or `~` prefixes); install latest stable versions at time of creation
- [X] T003 Initialize frontend package and scripts in frontend/package.json — all dependency versions MUST be exact (no `^` or `~` prefixes); install latest stable versions at time of creation
- [X] T004 [P] Configure backend TypeScript in backend/tsconfig.json
- [X] T005 [P] Configure frontend TypeScript + path aliases in frontend/tsconfig.json
- [X] T006 [P] Configure Webpack build and alias resolution in frontend/webpack.config.js — MUST use `ts-loader` for all `.ts`/`.tsx` files; MUST include `typescript-plugin-styled-components` as a `ts-loader` custom transformer; MUST NOT add Babel, css-loader, or style-loader (constitution §II); configure path aliases `@components`, `@hooks`, `@utils`, `@api`, `@styles`, `@assets`, `@services`, `@slices`, `@store` to match tsconfig.json; do NOT add `@types` alias (shadows node_modules/@types/*)
- [X] T007 [P] Configure ESLint + Prettier for frontend in frontend/.eslintrc.cjs and frontend/.prettierrc — MUST enable `eslint-plugin-simple-import-sort` rules; MUST add a rule disallowing wildcard imports (`import *`) and wildcard re-exports (`export * from`) per constitution §V
- [X] T008 [P] Configure ESLint + Prettier for backend in backend/.eslintrc.cjs and backend/.prettierrc — MUST add a rule disallowing wildcard imports (`import *`) and wildcard re-exports (`export * from`) per constitution §V
- [X] T009 [P] Configure Jest in frontend/jest.config.ts and backend/jest.config.ts — MUST set `transform: { '^.+\.tsx?$': 'ts-jest' }` (constitution §IV; NO Babel transform); MUST derive `moduleNameMapper` from `tsconfig.json` using `pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' })` from `ts-jest` so aliases have a single source of truth (constitution §IV); MUST include `coverageThreshold: { global: { lines: 80, branches: 80, functions: 80, statements: 80 } }` to enforce constitution §IV ≥80% coverage gate; add `"test:coverage": "jest --coverage"` npm script to both packages; ensure `ts-jest` is listed as a dev dependency in T002/T003
- [X] T010 [P] Configure Storybook in frontend/.storybook/main.ts and frontend/.storybook/preview.ts — MUST use `@storybook/builder-webpack5` with the project Webpack config (reuse `webpack.config.js`); MUST NOT use Babel transforms (constitution §II); configure `typescript-plugin-styled-components` via the shared Webpack config so styled-components display names are correct in stories
- [X] T011 [P] Add commitlint configuration in commitlint.config.cjs
- [X] T012 [P] Add environment templates in frontend/.env.example and backend/.env.example
- [X] T079 [P] Add PWA manifest in frontend/public/manifest.json
- [X] T080 [P] Add service worker registration in frontend/src/services/serviceWorker.ts
- [X] T081 [P] Configure offline asset caching strategy in frontend/src/services/offlineCache.ts — cache-first for static assets (JS, CSS, images); network-first for API requests; document strategy in comments
- [X] T085 [P] Add npm script to validate no version prefixes exist in frontend/package.json and backend/package.json — e.g., a `check:versions` script that fails if any dependency value starts with `^` or `~`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before user stories

- [X] T013 Create backend server bootstrap in backend/src/server.ts
- [X] T014 [P] Create backend routing entry in backend/src/api/index.ts
- [X] T015 [P] Implement backend error handling middleware in backend/src/api/errorHandler.ts
- [X] T016 [P] Configure SQLite connection in backend/src/services/db.ts
- [X] T017 [P] Define data models in backend/src/models/todoList.ts, backend/src/models/todoItem.ts, backend/src/models/subItem.ts
- [X] T018 [P] Define offline queue model in backend/src/models/offlineOperation.ts — model MUST enumerate all operation types: `create`, `update` (rename), `delete`, and `reorder`; include `entityType` (`list` | `todo` | `subitem`), `entityId`, `payload`, `clientTimestamp`, `idempotencyKey`, and `retryCount` fields
- [X] T019 Create Zod validation schemas in backend/src/services/validation.ts — covers list name unique across app, todo title unique within list, subitem title unique within todo; Zod schemas only (`z.string().max(255)` etc.); does NOT own DDL — DB-layer uniqueness is owned exclusively by T082
- [X] T082 Create database schema and migrations in backend/src/services/migrations/ — **sole owner of all DDL**; MUST include UNIQUE constraints (list.name, todo title+listId, subitem title+todoId) as SQLite UNIQUE index definitions; T019 Zod schemas must mirror these constraints but T082 is the authoritative source
- [X] T020 [P] Create shared frontend types in frontend/src/types/todos.ts
- [X] T021 [P] Create Redux store in frontend/src/store/store.ts and slices in frontend/src/slices/ — `store.ts` MUST ONLY call `configureStore` and export `RootState`, `AppDispatch`, `useAppDispatch`, `useAppSelector`; each slice (`listsSlice.ts`, `todosSlice.ts`, `subItemsSlice.ts`, `uiSlice.ts`) lives in `src/slices/` with its own file; `src/slices/index.ts` barrel re-exports all slice actions/thunks by name; state shapes: `lists` (`{ items: TodoList[], loading: boolean, error: string | null }`), `todos` (`{ byListId: Record<string, TodoItem[]>, loading: boolean }`), `subitems` (`{ byTodoId: Record<string, SubItem[]>, loading: boolean }`), `ui` (`{ selectedListId: string | null }`); NO persistence middleware (constitution §III)
- [X] T022 [P] Create shared fetch API client in frontend/src/api/apiClient.ts — base URL from `API_PATH` env var, common error handling (throw on non-2xx), JSON serialisation; NO RTK Query (constitution §III); **this is a thin wrapper only — no retry or backoff logic here**; retry/backoff for failed sync operations is exclusively the responsibility of T023 (offlineQueue)
- [X] T023 [P] Create offline queue service in frontend/src/services/offlineQueue.ts — owns all retry logic for failed operations (up to 3 retries with exponential backoff per FR-010); reads/writes to IndexedDB; calls `syncApi.ts` (T074) on reconnect; on 3 consecutive failures surfaces an error to the user; **does not depend on `apiClient.ts` retry behaviour** (see T022)
- [X] T089 [P] Unit tests for offline queue service in frontend/src/services/__tests__/offlineQueue.test.ts — MUST be completed before T023 is considered done (TDD gate); validates FR-010: (a) pending operation is written to IndexedDB when offline, (b) queue is read and dispatched on reconnect, (c) successfully synced operations are removed from the queue
- [X] T072 [P] Add offline sync endpoint implementation in backend/src/api/sync.ts
- [X] T073 [P] Add offline sync service implementation in backend/src/services/syncService.ts — MUST implement last-write-wins by comparing timestamps on conflicting operations (see T086 for test coverage)
- [X] T086 [P] Unit tests for last-write-wins conflict resolution in backend/tests/unit/syncConflict.test.ts — validates FR-013: when two operations modify the same item, the one with the most recent `updatedAt` timestamp wins after sync; MUST be completed before T073 is considered done (TDD gate)
- [X] T090 [P] Unit/integration test for AppContainer startup data-load sequence in frontend/src/containers/AppContainer/__tests__/AppContainer.test.tsx — validates FR-011: (a) `GET /api/lists` is called on component mount, (b) returned list data is rendered, (c) loading state is shown while request is in-flight; complements T088 which covers the error path only; also MUST assert (d) when API returns an empty array, the add-list CTA (button/placeholder) is visible — covers the no-lists half of FR-020
- [X] T074 [P] Create offline sync API call in frontend/src/api/syncApi.ts — single `postSyncBatch(operations)` function using `apiClient.ts`; dispatches queued operations to `POST /api/sync`; plain fetch, no RTK Query (constitution §III)
- [X] T024 [P] Create selectors in frontend/src/selectors/containers.ts — **depends on T021 slice definitions being finalised**; implement `getAppContainerProps` (selects lists, ui.selectedListId, ui.loading, ui.error) and `getTodoListsViewContainerProps` (selects todos and subitems for selectedListId)
- [X] T025 [P] Create root AppContainer in frontend/src/containers/AppContainer/AppContainer.tsx and frontend/src/containers/AppContainer/AppContainer.styled.ts — MUST dispatch a `fetchLists` thunk (calling `listsApi.getAll()`) in a `useEffect` on mount to satisfy FR-011; show loading state while in-flight; on error render ErrorBanner (T088) with retry callback that re-dispatches the thunk
- [X] T026 [P] Create global styles in frontend/src/styles/globalStyles.ts

---

## Phase 3: User Story 1 - Create lists with nested tasks (Priority: P1) 🎯 MVP

**Goal**: Create lists, todos, and subitems with manual ordering and API-driven state.

**Independent Test**: Create a list, add a todo, add a subitem, and confirm hierarchy is preserved.

### Tests for User Story 1

- [X] T027 [P] [US1] Contract tests for list endpoints in backend/tests/contract/lists.test.ts
- [X] T028 [P] [US1] Contract tests for todo endpoints in backend/tests/contract/todos.test.ts
- [X] T029 [P] [US1] Contract tests for subitem endpoints in backend/tests/contract/subitems.test.ts
- [X] T030 [P] [US1] Component tests for list creation in frontend/src/components/ListForm/__tests__/ListForm.test.tsx
- [X] T031 [P] [US1] Component tests for todo creation in frontend/src/components/TodoItemForm/__tests__/TodoItemForm.test.tsx
- [X] T032 [P] [US1] Component tests for subitem creation in frontend/src/components/SubItemForm/__tests__/SubItemForm.test.tsx

### Implementation for User Story 1

- [X] T033 [P] [US1] Implement list service (Create + Read only) in backend/src/services/listService.ts — rename/delete operations are added by T063
- [X] T034 [P] [US1] Implement todo service (Create + Read only) in backend/src/services/todoService.ts — rename/delete operations are added by T063
- [X] T035 [P] [US1] Implement subitem service (Create + Read only) in backend/src/services/subItemService.ts — rename/delete operations are added by T063
- [X] T036 [P] [US1] Implement list routes in backend/src/api/lists.ts
- [X] T037 [P] [US1] Implement todo routes in backend/src/api/todos.ts
- [X] T038 [P] [US1] Implement subitem routes in backend/src/api/subitems.ts
- [X] T039 [P] [US1] Create list API service in frontend/src/api/listsApi.ts — plain fetch functions for list CRUD + reorder using `apiClient.ts`; depends on T022; can run in parallel with T040 and T041
- [X] T040 [P] [US1] Create todo API service in frontend/src/api/todosApi.ts — plain fetch functions for todo CRUD + reorder + completion using `apiClient.ts`; depends on T022; can run in parallel with T039 and T041
- [X] T041 [P] [US1] Create subitem API service in frontend/src/api/subitemsApi.ts — plain fetch functions for subitem CRUD + reorder + completion using `apiClient.ts`; depends on T022; can run in parallel with T039 and T040
- [X] T092 [P] [US1] Create Redux async thunks in frontend/src/slices/ — **cross-phase task: depends on T021 (slices, Phase 2) and T039–T041 (API services, Phase 3)**; add thunks directly to the relevant slice file (e.g. `fetchTodos` in `todosSlice.ts`, `fetchSubitems` in `subItemsSlice.ts`); implement read thunks: `fetchLists()`, `fetchTodos(listId)`, `fetchSubitems(todoId)`; implement write/mutation thunks: `createList(name)`, `createTodo(listId, title)`, `createSubitem(todoId, title)`, `toggleComplete(entityType, id)`, `renameItem(entityType, id, title)`, `deleteItem(entityType, id)`, `reorderItems(entityType, parentId, orderedIds)`; all thunks call the corresponding API service function and dispatch into the appropriate slice; update `src/slices/index.ts` barrel to re-export new thunks by name
- [X] T042 [P] [US1] Create ListForm component in frontend/src/components/ListForm/ListForm.tsx and frontend/src/components/ListForm/ListForm.styled.ts — MUST display inline validation error when a duplicate list name is entered (Zod + react-hook-form); mirrors FR-014
- [X] T043 [P] [US1] Create TodoItemForm component in frontend/src/components/TodoItemForm/TodoItemForm.tsx and frontend/src/components/TodoItemForm/TodoItemForm.styled.ts — MUST display inline validation error when a duplicate todo title is entered within the same list (Zod + react-hook-form); mirrors FR-015; MUST reject titles exceeding 255 characters with an inline error; mirrors FR-019
- [X] T044 [P] [US1] Create SubItemForm component in frontend/src/components/SubItemForm/SubItemForm.tsx and frontend/src/components/SubItemForm/SubItemForm.styled.ts — MUST display inline validation error when a duplicate subitem title is entered within the same todo (Zod + react-hook-form); mirrors FR-016; MUST reject titles exceeding 255 characters with an inline error; mirrors FR-019
- [X] T094 [P] [US1] Create EmptyState component in frontend/src/components/EmptyState/EmptyState.tsx and frontend/src/components/EmptyState/EmptyState.styled.ts — reusable placeholder used wherever a list is empty; accepts `message: string`, `ctaLabel: string`, and `onCta: () => void` props; mirrors FR-020; component test in frontend/src/components/EmptyState/__tests__/EmptyState.test.tsx MUST cover: (a) renders message text, (b) renders CTA button with correct label, (c) onCta callback fires on button click
- [X] T045 [P] [US1] Create ListPanel component in frontend/src/components/ListPanel/ListPanel.tsx and frontend/src/components/ListPanel/ListPanel.styled.ts — uses EmptyState (T094) to display placeholder + add-list CTA when no lists exist (FR-020); depends on T094
- [X] T046 [P] [US1] Create TodoListView component in frontend/src/components/TodoListView/TodoListView.tsx and frontend/src/components/TodoListView/TodoListView.styled.ts — uses EmptyState (T094) to display placeholder + add-todo CTA when the active list has no todos (FR-020); depends on T094
- [X] T047 [US1] Wire list/todo/subitem creation in frontend/src/containers/AppContainer/AppContainer.tsx — extends wiring added by T025; dispatches create/add thunks for lists, todos, subitems; does NOT replace existing mount/fetch wiring
- [X] T093 [P] [US1] Component/integration tests for TodoListsViewContainer in frontend/src/containers/TodoListsViewContainer/__tests__/TodoListsViewContainer.test.tsx — MUST cover: (a) renders todos and subitems for the selected list, (b) shows empty-state placeholder with add-todo button when list has no todos (FR-020), (c) selector `getTodoListsViewContainerProps` returns correct shape for given store state; MUST be completed before T087 is considered done (TDD gate)
- [X] T087 [US1] Create TodoListsViewContainer in frontend/src/containers/TodoListsViewContainer/TodoListsViewContainer.tsx and frontend/src/containers/TodoListsViewContainer/TodoListsViewContainer.styled.ts — renders the active list's todos and subitems; MUST dispatch `fetchTodos(selectedListId)` when the selected list changes (via `useEffect` on `selectedListId`) and `fetchSubitems(todoId)` as each todo row expands; uses EmptyState (T094) to display placeholder + add-todo CTA when the active list has no todos (FR-020); add `getTodoListsViewContainerProps` selector in frontend/src/selectors/containers.ts
- [X] T088 [P] [US1] Create ErrorBanner component in frontend/src/components/ErrorBanner/ErrorBanner.tsx and frontend/src/components/ErrorBanner/ErrorBanner.styled.ts — renders error message and a retry button; used by AppContainer when `GET /api/lists` returns a non-2xx response on startup; mirrors FR-021 and research Decision 9; component test in frontend/src/components/ErrorBanner/__tests__/ErrorBanner.test.tsx MUST cover: (a) banner renders with message and retry button, (b) onRetry callback fires on button click
- [X] T048 [P] [US1] Add Storybook stories for Phase 3 components — one story file per component, all co-located per constitution §IV: `frontend/src/components/EmptyState/__stories__/EmptyState.stories.tsx`, `frontend/src/components/ListForm/__stories__/ListForm.stories.tsx`, `frontend/src/components/TodoItemForm/__stories__/TodoItemForm.stories.tsx`, `frontend/src/components/SubItemForm/__stories__/SubItemForm.stories.tsx`, `frontend/src/components/ListPanel/__stories__/ListPanel.stories.tsx`, `frontend/src/components/TodoListView/__stories__/TodoListView.stories.tsx`, `frontend/src/components/ErrorBanner/__stories__/ErrorBanner.stories.tsx`

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
- [ ] T053 [US2] Update todo/subitem services for completion logic in backend/src/services/todoService.ts and backend/src/services/subItemService.ts — **requires T038** (subitem routes must exist so completion logic can be tested end-to-end against the backend)
- [ ] T054 [US2] Expose completion updates in backend/src/api/todos.ts and backend/src/api/subitems.ts — **requires T053** (completion service logic must be implemented before routes can expose it) and **requires T038**
- [ ] T055 [US2] Add completion fetch functions to frontend/src/api/todosApi.ts and frontend/src/api/subitemsApi.ts — plain `PATCH` calls for toggle-complete; no RTK Query (constitution §III)
- [ ] T056 [P] [US2] Create TodoItemRow component in frontend/src/components/TodoItemRow/TodoItemRow.tsx and frontend/src/components/TodoItemRow/TodoItemRow.styled.ts
- [ ] T057 [P] [US2] Create SubItemRow component in frontend/src/components/SubItemRow/SubItemRow.tsx and frontend/src/components/SubItemRow/SubItemRow.styled.ts
- [ ] T058 [US2] Wire completion toggles in frontend/src/containers/AppContainer/AppContainer.tsx — extends wiring added by T047; dispatches completion thunks; does NOT replace existing creation or mount wiring
- [ ] T059 [P] [US2] Add Storybook stories for completion components: `frontend/src/components/TodoItemRow/__stories__/TodoItemRow.stories.tsx` and `frontend/src/components/SubItemRow/__stories__/SubItemRow.stories.tsx`

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
- [ ] T067 [US3] Add rename/delete/reorder fetch functions to frontend/src/api/listsApi.ts, frontend/src/api/todosApi.ts, and frontend/src/api/subitemsApi.ts — plain `PATCH`/`DELETE` calls; no RTK Query (constitution §III)
- [ ] T068 [P] [US3] Create InlineEdit component in frontend/src/components/InlineEdit/InlineEdit.tsx and frontend/src/components/InlineEdit/InlineEdit.styled.ts
- [ ] T069 [P] [US3] Create ReorderList component in frontend/src/components/ReorderList/ReorderList.tsx and frontend/src/components/ReorderList/ReorderList.styled.ts — **custom component justified**: Ant Design's drag-sort is a Table variant unsuitable for plain ordered lists; a lightweight custom drag-and-drop list is required per constitution §V
- [ ] T070 [US3] Wire edit/delete/reorder in frontend/src/containers/AppContainer/AppContainer.tsx — extends wiring added by T047 and T058; dispatches rename/delete/reorder thunks; does NOT replace existing creation or completion wiring
- [ ] T071 [P] [US3] Add Storybook stories for editing components: `frontend/src/components/InlineEdit/__stories__/InlineEdit.stories.tsx` and `frontend/src/components/ReorderList/__stories__/ReorderList.stories.tsx`

**Checkpoint**: User Story 3 works independently with rename/delete/reorder features.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T075 [P] Add offline sync UI indicators in frontend/src/components/SyncStatus/SyncStatus.tsx and frontend/src/components/SyncStatus/SyncStatus.styled.ts
- [ ] T076 Add sync status wiring in frontend/src/containers/AppContainer/AppContainer.tsx — **depends on T075** (SyncStatus component must exist) and **T023** (offline queue state must be in the store); extends wiring added by T070; does NOT replace existing creation, completion, or reorder wiring
- [ ] T077 [P] Add Storybook story for sync status in frontend/src/components/SyncStatus/__stories__/SyncStatus.stories.tsx
- [ ] T078 Run quickstart validation steps in specs/001-hierarchical-todos/quickstart.md — done when all steps pass without errors in a fresh environment with no pre-existing database or cache
- [ ] T084 Validate responsive layout on mobile and desktop viewports — manual checklist covering: (a) 375px (mobile portrait), (b) 768px (tablet), (c) 1280px (desktop); verify touch interaction targets and no horizontal overflow at each breakpoint; pass/fail documented in `specs/001-hierarchical-todos/checklists/responsive.md`
- [ ] T091 [P] Automated viewport regression tests in frontend — add Jest + jsdom tests for key components (ListPanel, TodoItemRow, SubItemRow) that assert no horizontal overflow at 375px viewport width; use `Object.defineProperty(document.documentElement, 'clientWidth', { value: 375 })` and assert `element.scrollWidth <= 375`; note: jsdom does not execute real CSS layout so this is a smoke test, not a visual regression test; covers FR-008 and constitution §II automated test gate
- [ ] T095 Manual usability validation for SC-001: time a new user completing the core flow (create list → add todo → add subitem) and confirm it completes in under 2 minutes; pass/fail documented in `specs/001-hierarchical-todos/checklists/usability.md`
- [ ] T096 Manual usability validation for SC-002: conduct first-attempt usability test with at least one participant completing the core flow (create list, add todo + subitem, mark complete); document result in `specs/001-hierarchical-todos/checklists/usability.md`

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
- **T038**: Must complete before T053 and T054 can be wired end-to-end (backend subitem routes must exist so completion logic can be tested end-to-end; cross-phase dependency Phase 3 → Phase 4).

### Parallel Execution Examples

**User Story 1**

- T027, T028, T029 can run in parallel (contract tests).
- T033, T034, T035 can run in parallel (services).
- T039, T040, T041 can run in parallel (frontend API service files; all depend only on T022).
- T092 can run in parallel with other Phase 3 tasks once T039–T041 and T021 are both complete.
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
