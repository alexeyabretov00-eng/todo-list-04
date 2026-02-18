# Implementation Plan: Hierarchical Todo Lists

**Branch**: `001-hierarchical-todos` | **Date**: February 17, 2026 | **Spec**: [specs/001-hierarchical-todos/spec.md](specs/001-hierarchical-todos/spec.md)
**Input**: Feature specification from `/specs/001-hierarchical-todos/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Deliver a single-user hierarchical todo app that supports lists, todos, and subitems with manual ordering, offline queueing, and API-driven state. The solution uses a React SPA with a Node REST API, keeping the API as the source of truth while supporting PWA offline mode.

## Technical Context

**Language/Version**: TypeScript (strict mode) for frontend, Node.js (latest LTS) for backend  
**Primary Dependencies**: React 19.x, Redux Toolkit, styled-components, Ant Design, react-hook-form, Zod, Webpack, Jest, Storybook  
**Storage**: SQLite (embedded, single-user)  
**Testing**: Jest (>=80% coverage), Storybook stories co-located with components  
**Target Platform**: Web (desktop + mobile), PWA-enabled  
**Project Type**: web (frontend + backend)  
**Performance Goals**: Smooth interactions for lists up to 200 todos and 500 subitems; offline sync within 30 seconds after reconnect  
**Constraints**: Offline-capable with queued operations; API-driven state; no local persistence except offline queue  
**Scale/Scope**: Single-user app; one level of subitems; manual ordering of lists, todos, subitems

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Single-user architecture, no authentication. (Pass)
- Responsive design with PWA offline support. (Pass)
- API-driven state; no local persistence except offline queue. (Pass)
- Test-first quality with Jest >=80% coverage, co-located tests and stories. (Pass)
- Presentational components with container logic; TypeScript strict; styled-components. (Pass)
- React 19 + Redux Toolkit + Ant Design; fetch API client; Webpack build. (Pass)
- Named imports/exports only; container naming conventions. (Pass)

**Post-Phase 1 Re-check**: No changes required; all constitution gates still pass.

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
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── containers/
│   ├── hooks/
│   ├── selectors/
│   ├── services/
│   ├── styles/
│   ├── types/
│   └── utils/
└── tests/
```

**Structure Decision**: Web application split into `frontend/` and `backend/` to align with React SPA + Node REST API requirements. Directory layout matches constitution standards for components, containers, and selectors.

## Complexity Tracking

No constitution violations required for this plan.
