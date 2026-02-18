# Implementation Plan: Restore Storybook Work

**Branch**: `001-restore-storybook` | **Date**: 2026-02-18 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-restore-storybook/spec.md`

## Summary

Storybook 10.x loads `.storybook/main.ts` as a native ES Module, but the current config uses CommonJS-only APIs (`require()`, `__dirname`). This causes a hard `ReferenceError: require is not defined` at build time, preventing any story from loading. Two additional fixes are needed: missing required props in `TodoListView.stories.tsx`, and `typeRoots` misplaced at the root level of `tsconfig.json`. All three changes are mechanical; no new packages, files, or API contracts are required.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 24 (LTS)  
**Primary Dependencies**: Storybook 10.2.10 (`@storybook/react-webpack5`), React 19.x, Webpack 5, ts-loader, typescript-plugin-styled-components  
**Storage**: N/A – no data model changes  
**Testing**: Jest (existing suite unchanged); Storybook build verification  
**Target Platform**: Developer browser (Storybook dev server) and CI static build  
**Project Type**: Web application (frontend only for this feature)  
**Performance Goals**: Storybook starts in <60 s on development machine  
**Constraints**: No new npm packages; no version changes; no backend changes; all 12 existing stories must render error-free  
**Scale/Scope**: 12 story files across 12 components; 3 changed files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Single-User Architecture | ✅ PASS | No auth or multi-tenancy involved |
| II. Cross-Platform Responsive | ✅ PASS | No layout changes; Storybook is tooling |
| III. API-Driven State Management | ✅ PASS | Stories use mock args, not localStorage; no Redux persistence added |
| IV. Test-First Quality | ✅ PASS | Stories ARE the test artefacts per constitution. No coverage regression. |
| V. Component Isolation & Type Safety | ✅ PASS | `tsconfig.json` fix improves strict compliance; story props align with component interfaces |
| Storybook co-location rule | ✅ PASS | All stories remain in `__stories__/` folders alongside components |
| No `@types` alias | ✅ PASS | Fix only moves `typeRoots` inside `compilerOptions`; no alias changes |

**Pre-design gate**: PASS – no violations. Proceed to Phase 1.

## Project Structure

### Documentation (this feature)

```text
specs/001-restore-storybook/
├── plan.md              ← this file
├── research.md          ← Phase 0 (complete)
├── quickstart.md        ← Phase 1 (see below)
└── tasks.md             ← Phase 2 (created by /speckit.tasks)
```

*`data-model.md` and `contracts/` are omitted — this feature introduces no new entities and no API endpoints.*

### Source Code (affected files only)

```text
frontend/
├── .storybook/
│   └── main.ts                    ← FIX: replace require()/__dirname with ESM equivalents
├── tsconfig.json                  ← FIX: move typeRoots inside compilerOptions
└── src/
    └── components/
        └── TodoListView/
            └── __stories__/
                └── TodoListView.stories.tsx   ← FIX: add missing onToggleTodo / onToggleSubItem args
```

## Complexity Tracking

*No constitution violations — complexity table omitted.*
