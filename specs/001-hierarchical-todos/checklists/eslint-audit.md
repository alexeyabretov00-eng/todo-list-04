# ESLint Audit: Phase 3 (User Story 1)

**Date**: February 18, 2026
**Branch**: `phase3-user-story-1`
**Scope**: `frontend/src/**`

## Summary

35 errors found, all fixed. 0 errors remain.

## Errors Found and Fixed

| # | Rule | Count | Fix Applied |
|---|------|-------|-------------|
| 1 | `simple-import-sort/imports` | 14 | Auto-fixed (`eslint --fix`) — import order sorted |
| 2 | `simple-import-sort/exports` | 2 | Auto-fixed (`eslint --fix`) — export order sorted |
| 3 | `@typescript-eslint/no-unused-vars` | 6 | Removed unused `import React from 'react'` from test files (not needed with React 17+ JSX transform) |
| 4 | `@typescript-eslint/ban-ts-comment` | 2 | Removed `@ts-ignore` / `@ts-expect-error` directives — TypeScript correctly accepted the partial state objects without suppression |

## Files Changed

### Auto-fixed by `eslint --fix`
- `src/api/index.ts`
- `src/slices/index.ts`
- `src/slices/listsSlice.ts`
- `src/slices/subItemsSlice.ts`
- `src/slices/todosSlice.ts`
- `src/components/EmptyState/EmptyState.tsx`
- `src/components/EmptyState/__stories__/EmptyState.stories.tsx`
- `src/components/ErrorBanner/ErrorBanner.tsx`
- `src/components/ErrorBanner/__stories__/ErrorBanner.stories.tsx`
- `src/components/ListForm/ListForm.tsx`
- `src/components/ListForm/__stories__/ListForm.stories.tsx`
- `src/components/ListPanel/ListPanel.tsx`
- `src/components/ListPanel/__stories__/ListPanel.stories.tsx`
- `src/components/SubItemForm/SubItemForm.tsx`
- `src/components/SubItemForm/__stories__/SubItemForm.stories.tsx`
- `src/components/TodoItemForm/TodoItemForm.tsx`
- `src/components/TodoItemForm/__stories__/TodoItemForm.stories.tsx`
- `src/components/TodoListView/TodoListView.tsx`
- `src/components/TodoListView/__stories__/TodoListView.stories.tsx`
- `src/containers/AppContainer/AppContainer.tsx`
- `src/containers/TodoListsViewContainer/TodoListsViewContainer.tsx`

### Manually fixed
- `src/components/EmptyState/__tests__/EmptyState.test.tsx` — removed `import React`
- `src/components/ErrorBanner/__tests__/ErrorBanner.test.tsx` — removed `import React`
- `src/components/ListForm/__tests__/ListForm.test.tsx` — removed `import React`
- `src/components/SubItemForm/__tests__/SubItemForm.test.tsx` — removed `import React`
- `src/components/TodoItemForm/__tests__/TodoItemForm.test.tsx` — removed `import React`
- `src/containers/TodoListsViewContainer/__tests__/TodoListsViewContainer.test.tsx` — removed `import React` and removed unnecessary `@ts-suppress` comments

## Verification

```
✓ npx eslint src --max-warnings=0  → 0 errors, 0 warnings
✓ Jest (30 tests across 7 suites)  → all pass
```
