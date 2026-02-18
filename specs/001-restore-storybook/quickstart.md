# Quickstart: Restore Storybook Work

**Branch**: `001-restore-storybook`  
**Scope**: 3 file edits, no new packages, no backend changes

---

## What's being fixed

| File | Problem | Fix |
|------|---------|-----|
| `frontend/.storybook/main.ts` | Uses `require()` and `__dirname` (CommonJS) which are unavailable in Storybook 10.x ESM context — causes `ReferenceError: require is not defined` on every build | Replace with `import()` (dynamic ESM) and `fileURLToPath(new URL('.', import.meta.url))` |
| `frontend/src/components/TodoListView/__stories__/TodoListView.stories.tsx` | Missing required props `onToggleTodo` and `onToggleSubItem` — causes TypeScript error and runtime crash when any todo checkbox is toggled | Add `() => undefined` stubs to `args` |
| `frontend/tsconfig.json` | `typeRoots` is at the root level (ignored by TypeScript) instead of inside `compilerOptions` | Move `typeRoots` array inside `compilerOptions` |

---

## Fix 1 — `frontend/.storybook/main.ts`

Replace the `webpackFinal` function body. The current code:

```ts
// eslint-disable-next-line @typescript-eslint/no-require-imports
const projectWebpackConfig = require(path.resolve(__dirname, '../webpack.config.js'));
const projectResolved = projectWebpackConfig({}, { mode: 'development' });
```

Must become:

```ts
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// At module level — replace __dirname:
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In webpackFinal — replace require() with dynamic import():
const projectWebpackModule = await import(
  new URL('../webpack.config.js', import.meta.url).href
);
const projectWebpackConfig = projectWebpackModule.default ?? projectWebpackModule;
const projectResolved = projectWebpackConfig({}, { mode: 'development' });
```

`webpackFinal` must be declared `async` (it already returns a `Promise`, so this change is non-breaking).

---

## Fix 2 — `TodoListView.stories.tsx`

In the `meta` object `args`, add the two missing handlers:

```ts
args: {
  listName: 'Shopping',
  todos: sampleTodos,
  subItemsByTodoId: { 'todo-1': sampleSubItems },
  existingTodoTitles: sampleTodos.map((t) => t.title),
  onAddTodo: () => undefined,
  onAddSubItem: () => undefined,
  onToggleTodo: () => undefined,       // ← add
  onToggleSubItem: () => undefined,    // ← add
},
```

---

## Fix 3 — `frontend/tsconfig.json`

Move `typeRoots` from root level to inside `compilerOptions`:

```jsonc
{
  "compilerOptions": {
    // ... existing options ...
    "typeRoots": ["./node_modules/@types", "./src/types"]  // ← move here
  },
  "include": ["src/**/*"]
  // typeRoots should NOT appear here at root level
}
```

---

## Verify

```bash
# From frontend/ directory
node node_modules/storybook/dist/bin/dispatcher.js build
# Expected: "✓  Build succeeded" with no errors

# Start dev server
npm run storybook
# Open http://localhost:6006 — all 12 components should appear with their story variants
```

---

## No changes needed

- All other story files compile and satisfy their component's prop contract
- `ReorderList.stories.tsx` JSX in args is valid in `.tsx` with `react-jsx` transform
- Global `declare interface` types (`SubItem`, `TodoItem`, `TodoList`) in `src/types/types.d.ts` are already ambient-available via `include: ["src/**/*"]`
- No new npm packages required
- No backend changes required
- Jest test suite is unaffected
