# Implementation Plan: Hierarchical Todo Lists

**Branch**: `001-hierarchical-todos` | **Date**: February 18, 2026 | **Spec**: [specs/001-hierarchical-todos/spec.md](specs/001-hierarchical-todos/spec.md)
**Input**: Feature specification from `/specs/001-hierarchical-todos/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Deliver a single-user hierarchical todo app that supports lists, todos, and subitems with manual ordering, offline queueing, and API-driven state. The solution uses a React SPA with a Node REST API, keeping the API as the source of truth while supporting PWA offline mode. All three entity types carry `updatedAt` for last-write-wins conflict resolution. Titles are validated to ≤255 characters. Empty and error states are explicitly handled in the UI.

## Technical Context

**Language/Version**: TypeScript (strict mode) for frontend, Node.js (latest LTS) for backend
**Primary Dependencies**: React 19.x, Redux Toolkit, styled-components, Ant Design, react-hook-form, Zod, Webpack, Jest, Storybook, better-sqlite3
**Storage**: SQLite via better-sqlite3 (embedded, single-user); DB file at `backend/data/todos.db`; migrations via custom runner in `backend/src/services/migrations/`
**Testing**: Jest (≥80% coverage), Storybook stories co-located with components
**Target Platform**: Web (desktop + mobile), PWA-enabled
**Project Type**: web (frontend + backend)
**Performance Goals**: UI interactions (toggle completion, rename, delete) MUST respond within 150ms at up to 200 todos and 500 subitems (no perceived lag); offline sync completes within 30 seconds after reconnect; see SC-004 for data-integrity gate at that scale
**Constraints**: Offline-capable with queued operations persisted to IndexedDB; API-driven state; no Redux persistence; titles max 255 chars
**Scale/Scope**: Single-user app; one level of subitems; manual ordering of lists, todos, subitems

## Constitution Check

*GATE: Must pass before research phase. Re-check after design phase. (Note: plan.md phases refer to pre-implementation planning; implementation phases are numbered 1–6 in tasks.md.)*

- Single-user architecture, no authentication. (Pass)
- Responsive design with PWA offline support. (Pass)
- API-driven state; no local persistence except offline sync queue (persisted to IndexedDB). (Pass)
- Test-first quality with Jest ≥80% coverage, co-located tests and stories. (Pass)
- Presentational components with container logic; TypeScript strict; styled-components. (Pass)
- React 19 + Redux Toolkit + Ant Design; fetch API client; Webpack build. (Pass)
- Named imports/exports only; container naming conventions. (Pass)

**Post-Design Re-check**: No changes required; all constitution gates still pass.

## Project Structure

### Documentation (this feature)

```text
specs/001-hierarchical-todos/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── data/
│   └── todos.db                    # SQLite database file (gitignored)
├── src/
│   ├── api/
│   │   ├── index.ts                # Router entry
│   │   ├── lists.ts                # List CRUD + reorder routes
│   │   ├── todos.ts                # Todo CRUD + reorder + completion routes
│   │   ├── subitems.ts             # Subitem CRUD + reorder + completion routes
│   │   ├── sync.ts                 # Offline sync endpoint
│   │   └── errorHandler.ts         # Global error middleware
│   ├── models/
│   │   ├── todoList.ts
│   │   ├── todoItem.ts
│   │   ├── subItem.ts
│   │   └── offlineOperation.ts
│   ├── services/
│   │   ├── db.ts                   # SQLite connection (better-sqlite3)
│   │   ├── migrations/             # Schema + migration runner
│   │   ├── validation.ts           # Zod schemas + uniqueness rules
│   │   ├── listService.ts
│   │   ├── todoService.ts
│   │   ├── subItemService.ts
│   │   ├── completionRules.ts
│   │   ├── reorderService.ts
│   │   └── syncService.ts          # Last-write-wins conflict resolution
│   └── server.ts
└── tests/
    ├── contract/
    │   ├── lists.test.ts
    │   ├── todos.test.ts
    │   ├── subitems.test.ts
    │   ├── completion.test.ts
    │   ├── reorder.test.ts
    │   └── editing.test.ts
    └── unit/
        ├── completionRules.test.ts
        └── syncConflict.test.ts

frontend/
├── public/
│   └── manifest.json               # PWA manifest
├── src/
│   ├── api/
│   │   ├── baseApi.ts              # RTK Query base API
│   │   └── todoApi.ts              # All endpoints: lists, todos, subitems, sync
│   │                               # Final exports: use[Entity][Action] RTK Query hooks
│   ├── components/
│   │   ├── ListForm/
│   │   ├── TodoItemForm/
│   │   ├── SubItemForm/
│   │   ├── ListPanel/
│   │   ├── TodoListView/
│   │   ├── TodoItemRow/
│   │   ├── SubItemRow/
│   │   ├── InlineEdit/
│   │   ├── ReorderList/
│   │   ├── SyncStatus/
│   │   └── EmptyState/             # Reusable empty-state placeholder (FR-020)
│   ├── containers/
│   │   ├── AppContainer/
│   │   └── TodoListsViewContainer/
│   ├── hooks/
│   ├── selectors/
│   │   └── containers.ts           # getAppContainerProps, getTodoListsViewContainerProps
│   ├── services/
│   │   ├── offlineQueue.ts         # Offline sync queue — persisted to IndexedDB (FR-010)
│   │   ├── offlineCache.ts         # PWA asset caching strategy
│   │   └── serviceWorker.ts        # Service worker registration
│   ├── store/
│   │   └── store.ts                # Redux store — NO persistence middleware (constitution §III)
│   ├── styles/
│   │   └── globalStyles.ts
│   └── types/
│       └── todos.ts                # Shared TypeScript types
└── tests/
```

**Structure Decision**: Web application split into `frontend/` and `backend/` to align with React SPA + Node REST API requirements. `todoApi.ts` is a single file grown across implementation phases (T074 → T039 → T040 → T041 → T055 → T067); its final exported shape is `use[Entity][Action]` RTK Query hooks. Directory layout matches constitution standards for components, containers, and selectors.

## Complexity Tracking

No constitution violations required for this plan.
