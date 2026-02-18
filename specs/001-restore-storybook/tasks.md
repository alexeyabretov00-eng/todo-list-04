# Tasks: Restore Storybook Work

**Input**: Design documents from `/specs/001-restore-storybook/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅

**Scope**: 3 file edits, no new packages, no backend changes.
**Stories**: US1 (Browse stories), US2 (Controls), US3 (No console errors)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Paths are relative to repo root

---

## Phase 1: Setup

**Purpose**: No project initialization needed — this feature edits existing files only.

*No setup tasks required. Proceed directly to user story phases.*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix the Storybook build configuration so any story can load at all. Until this is done no story can be verified.

**⚠️ CRITICAL**: Phases 3–5 cannot be independently tested until this phase is complete.

- [ ] T001 Fix `require()`/`__dirname` CJS usage in `frontend/.storybook/main.ts` — replace with ESM `import()`/`fileURLToPath` and make `webpackFinal` async so Storybook 10.x ESM loader can load the config without a `ReferenceError`

**Checkpoint**: Run `node node_modules/storybook/dist/bin/dispatcher.js build` from `frontend/`. Build must complete without `ReferenceError: require is not defined`. All stories may still have individual errors — those are addressed in Phases 3–5.

---

## Phase 3: User Story 1 - Browse Component Stories (Priority: P1) 🎯 MVP

**Goal**: Every existing story file renders in the Storybook canvas without errors or blank panels.

**Independent Test**: Start Storybook (`npm run storybook` from `frontend/`), open `http://localhost:6006`, and confirm all 12 component stories render their default variant without a canvas error.

### Implementation for User Story 1

- [ ] T002 [P] [US1] Add missing required props `onToggleTodo: () => undefined` and `onToggleSubItem: () => undefined` to `args` in `frontend/src/components/TodoListView/__stories__/TodoListView.stories.tsx`
- [ ] T003 [P] [US1] Move `typeRoots` from root level into `compilerOptions` in `frontend/tsconfig.json` so TypeScript strict-mode resolves `src/types/types.d.ts` via the explicitly configured `typeRoots` rather than silently falling back to defaults

**Checkpoint**: All 12 story files render without canvas errors. User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Interact With Story Controls (Priority: P2)

**Goal**: The Storybook Controls panel allows a developer to change prop values and see the component re-render.

**Independent Test**: Open any component story (e.g., `SubItemRow/Default`), change a boolean control (e.g., `completed`) in the Controls panel, and confirm the component updates without a page error.

### Implementation for User Story 2

*No code changes are required for US2. Controls are driven by Storybook's automatic `argTypes` inference from TypeScript prop types. Once the build succeeds (T001) and all stories render (T002/T003), Controls work automatically for all story args that are typed.*

*If controls do not appear: verify that `@storybook/react` is correctly resolving prop types via `react-docgen-typescript-plugin` (already in `node_modules/@storybook/react-docgen-typescript-plugin`). No config change is needed — it is enabled by default with `@storybook/react-webpack5`.*

**Checkpoint**: Open a story with boolean or text args and confirm Controls panel shows interactive fields. No code changes logged — this story's acceptance criteria are met by Phases 2–3.

---

## Phase 5: User Story 3 - Run Storybook Without Console Errors (Priority: P3)

**Goal**: Storybook starts with zero console errors caused by configuration or story files.

**Independent Test**: Start Storybook from a clean state and open the browser DevTools console. Zero red errors related to missing modules, unresolved aliases, or TypeScript failures.

### Implementation for User Story 3

*No additional code changes beyond T001–T003. The three root causes identified in research.md are the only sources of console errors: the CJS/ESM mismatch (T001), the missing required props (T002), and the misplaced `typeRoots` (T003). Path alias resolution is handled by the shared webpack config reuse in `main.ts` (restored by T001).*

**Checkpoint**: Browser DevTools console shows zero errors when Storybook loads and stories are navigated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation run confirming all success criteria from spec.md.

- [ ] T004 [P] Run Storybook build (`node node_modules/storybook/dist/bin/dispatcher.js build` from `frontend/`) and confirm exit code 0 and zero TypeScript errors — satisfies SC-003
- [ ] T005 [P] Start Storybook dev server and manually navigate all 12 component stories, confirming each renders without a canvas error — satisfies SC-001
- [ ] T006 [P] Confirm Storybook starts in under 60 seconds on the development machine — satisfies SC-002
- [ ] T007 Confirm Jest test suite still passes after `tsconfig.json` change: run `node node_modules/jest/bin/jest.js --no-coverage --forceExit` from `frontend/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2 — T001)**: No dependencies; start immediately. **Blocks all story phases.**
- **User Story 1 (Phase 3 — T002, T003)**: Depend on T001 completion; T002 and T003 are [P] (different files, independent of each other)
- **User Story 2 (Phase 4)**: No code tasks; acceptance criteria met automatically once Phase 3 is complete
- **User Story 3 (Phase 5)**: No code tasks; acceptance criteria met automatically once Phase 3 is complete
- **Polish (Phase 6)**: Depends on Phases 2–3 complete; T004/T005/T006 are [P]

### User Story Dependencies

- **US1 (P1)**: Depends on T001 only. T002 and T003 can be written in parallel after T001.
- **US2 (P2)**: Zero-effort story — met by US1 implementation. No blocking dependency beyond US1.
- **US3 (P3)**: Zero-effort story — met by US1 implementation. No blocking dependency beyond US1.

### Parallel Opportunities

After T001 completes:
- T002 and T003 can be executed simultaneously (different files: `TodoListView.stories.tsx` vs `tsconfig.json`)
- After T002 and T003, T004/T005/T006/T007 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# After T001 is merged, launch T002 and T003 simultaneously:
Task T002: "Add onToggleTodo / onToggleSubItem to frontend/src/components/TodoListView/__stories__/TodoListView.stories.tsx"
Task T003: "Move typeRoots inside compilerOptions in frontend/tsconfig.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 (Foundational)
2. Complete T002 + T003 in parallel (User Story 1)
3. **STOP and VALIDATE**: Run Storybook build + dev server; confirm all 12 stories load
4. US2 and US3 are satisfied without further code changes

### Full Delivery (3 Tasks Total)

```
T001 → [T002 ∥ T003] → [T004 ∥ T005 ∥ T006 ∥ T007]
```

Total: 3 implementation tasks + 4 validation tasks.

---

## Task Count Summary

| Phase | Story | Tasks | Parallelizable |
|-------|-------|-------|---------------|
| Phase 2: Foundational | — | 1 (T001) | No (single file) |
| Phase 3: US1 | US1 | 2 (T002, T003) | Yes (different files) |
| Phase 4: US2 | US2 | 0 | — |
| Phase 5: US3 | US3 | 0 | — |
| Phase 6: Polish | — | 4 (T004–T007) | T004/T005/T006 yes |
| **Total** | | **7** | |

**Implementation tasks**: 3 (T001–T003)  
**Validation tasks**: 4 (T004–T007)  
**Suggested MVP scope**: All 3 implementation tasks (feature is trivially small)
