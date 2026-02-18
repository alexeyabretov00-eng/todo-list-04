# Research: Restore Storybook Work

**Feature**: 001-restore-storybook  
**Date**: 2026-02-18  
**Status**: Complete – all NEEDS CLARIFICATION resolved

---

## Finding 1: Root cause of Storybook build failure

**Decision**: The primary failure is `ReferenceError: require is not defined` in `.storybook/main.ts` at line 17.

**Evidence**: Running `node node_modules/storybook/dist/bin/dispatcher.js build` produces:
```
✕  Failed to build the preview
✕  ReferenceError: require is not defined
    at Object.webpackFinal
    (file:///…/frontend/.storybook/main.ts:17:34)
```

**Root cause**: Storybook 10.x loads its configuration files as **ES Modules** (the error trace shows `file:///` URLs, which is the Node.js ESM loader). The `main.ts` `webpackFinal` hook uses `require()` (CommonJS) and `__dirname` (both unavailable in a native ESM execution context).

**Rationale**: In ESM context, `require` is not defined. The fix is to replace:
- `require(path.resolve(__dirname, '../webpack.config.js'))` → `await import(new URL('../webpack.config.js', import.meta.url).href)`
- `__dirname` → `fileURLToPath(new URL('.', import.meta.url))`
- Make `webpackFinal` itself `async` (it already returns a `Promise`, so this has no side-effects)

**Alternatives considered**:
- Use `createRequire(import.meta.url)` from Node `module` – valid but requires extra import; dynamic `import()` is idiomatic ESM and avoids needing a CJS shim
- Downgrade Storybook to a version using CJS – rejected; Storybook 10.x is installed per `package.json` and the spec assumption says no version change is needed
- Rename `main.ts` → `main.cjs` – rejected; this would conflict with the TypeScript setup and Storybook's resolution

---

## Finding 2: Missing required props in `TodoListView.stories.tsx`

**Decision**: Add `onToggleTodo` and `onToggleSubItem` to the story's `args` object.

**Evidence**: `TodoListView.tsx` declares both as non-optional:
```ts
onToggleTodo: (todoId: string, completed: boolean) => void;
onToggleSubItem: (subItemId: string, completed: boolean) => void;
```
The current `TodoListView.stories.tsx` `args` object omits both callbacks. This will cause a TypeScript type error and a runtime crash when the story renders (any interaction invokes an `undefined` function).

**Rationale**: Adding `() => undefined` stubs for all missing required handlers is the lightest fix, consistent with how other story files handle optional callbacks.

**Alternatives considered**: Making the props optional in the component – rejected; the component contract is correct; stories must satisfy the contract.

---

## Finding 3: `typeRoots` placement in `tsconfig.json`

**Decision**: Move `typeRoots` from the root level to inside `compilerOptions`.

**Evidence**: Current `tsconfig.json` has:
```json
{
  "compilerOptions": { ... },
  "include": ["src/**/*"],
  "typeRoots": ["./node_modules/@types", "./src/types"]   ← root level (ignored by TS)
}
```
TypeScript only recognises `typeRoots` when it appears inside `compilerOptions`. At root level it is silently ignored.

**Impact**: The global `declare interface` types in `src/types/types.d.ts` are currently still resolved because the file falls under `include: ["src/**/*"]`. However, `typeRoots` at root level means TypeScript falls back to its default `typeRoots` search (finds `node_modules/@types` automatically) but the intended explicit declaration is misleading, and the `src/types` `typeRoots` entry has no effect. Fixing it is a correctness improvement and prevents future confusion.

**Rationale**: This is a low-risk, one-line move. It does not change observable runtime behaviour today (because `src/types/types.d.ts` is picked up via `include`), but it aligns the config with TypeScript semantics and constitution IV (strict TypeScript).

---

## Finding 4: `ReorderList.stories.tsx` – inline JSX in args is valid

**Decision**: No change needed. Inline JSX in story `args` (e.g., `<span>…</span>`) is valid in `.tsx` files with `react-jsx` transform.

**Evidence**: The file extension is `.stories.tsx`; the `tsconfig.json` has `"jsx": "react-jsx"` which auto-imports the JSX runtime. No explicit `import React` is required.

**Alternatives considered**: Adding `import React from 'react'` – unnecessary with `react-jsx` and would introduce a lint warning in strict projects.

---

## Finding 5: Global type usage in story files (`SubItem[]`, `TodoList[]`, `TodoItem[]`)

**Decision**: No change needed. Story files that use `SubItem`, `TodoList`, and `TodoItem` without imports are correct.

**Evidence**: `src/types/types.d.ts` declares all three using `declare interface` (ambient declarations). The file is covered by `include: ["src/**/*"]` in `tsconfig.json`, making these types globally available to all files in the project, including story files. No explicit import is required or desired for ambient declarations.

---

## Summary of Required Changes

| # | File | Change | Risk |
|---|------|--------|------|
| 1 | `frontend/.storybook/main.ts` | Replace `require()`/`__dirname` with ESM equivalents; make `webpackFinal` async | Low |
| 2 | `frontend/src/components/TodoListView/__stories__/TodoListView.stories.tsx` | Add `onToggleTodo: () => undefined` and `onToggleSubItem: () => undefined` to `args` | Low |
| 3 | `frontend/tsconfig.json` | Move `typeRoots` from root level to inside `compilerOptions` | Very Low |

No new packages are required. No new files are created. No backend changes are needed.
