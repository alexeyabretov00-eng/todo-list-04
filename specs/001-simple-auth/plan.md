# Implementation Plan: Simple Login/Password Authentication

**Branch**: `001-simple-auth` | **Date**: 2026-02-18 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-simple-auth/spec.md`

---

## Summary

Add single-owner access protection to the todo application. The owner authenticates via a username/password login form; the server issues an HttpOnly session cookie (24h non-rolling TTL) backed by a SQLite `sessions` table. All existing API routes are protected by a new `requireAuth` middleware. The owner can change their password via an in-app settings screen; doing so invalidates all active sessions. No multi-user support, no registration flow, no brute-force protection. Constitution Principle I has been amended (2026-02-18) to permit this feature.

---

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js LTS  
**Primary Dependencies (new)**: `bcryptjs` (password hashing), `cookie-parser` (cookie parsing middleware); `@types/bcryptjs`, `@types/cookie-parser`  
**Storage**: SQLite via `better-sqlite3` (existing) — two new tables: `credentials`, `sessions` (migration `002_auth_schema`)  
**Testing**: Jest + ts-jest (≥80% coverage), Storybook  
**Target Platform**: Web SPA (React 19.x) + Express REST API  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: Login response <2s (SC-002); invalid login response <2s (SC-003)  
**Constraints**: HttpOnly cookie only (no localStorage/sessionStorage); 24h non-rolling session; password min 8 chars; single owner credential; no routing library (constitution)  
**Scale/Scope**: Single user; no concurrent session concerns beyond cookie validation

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I — Single-User Architecture | Amended 2026-02-18: single-owner access protection explicitly permitted; no multi-user account management | ✅ PASS — amendment in place |
| II — Cross-Platform Responsive Design | LoginForm and ChangePasswordForm must be responsive; styled-components layout must work on mobile | ✅ PASS — requirement noted |
| III — API-Driven State Management (NON-NEGOTIABLE) | Auth state (`authSlice`) lives in Redux; session token is HttpOnly cookie — never accessed by JS; no localStorage; no sessionStorage | ✅ PASS — design satisfies constraint |
| IV — Test-First Quality (NON-NEGOTIABLE) | New components, containers, services, and API routes all require ≥80% coverage; co-located tests and stories required | ✅ PASS — coverage requirement captured in all new artifacts |
| V — Component Isolation & Type Safety | `LoginForm` and `ChangePasswordForm` are presentational; `LoginFormContainer`, `AuthGateContainer`, `SettingsContainer` handle logic; Zod schemas for validation; react-hook-form for form state | ✅ PASS |
| Redux Store Structure | New `authSlice.ts` in `src/slices/`; `store.ts` only adds `auth: authSlice.reducer` | ✅ PASS |
| Code Organization | All new components and containers follow `ComponentName/ComponentName.tsx` + `.styled.ts` + `__tests__/` + `__stories__/` + `index.ts` pattern | ✅ PASS |
| Configuration Management | `OWNER_USERNAME`, `OWNER_PASSWORD` in `.env`; `.env` not committed | ✅ PASS |

**Post-design re-check**: All gates pass. No violations requiring justification.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-simple-auth/
├── plan.md              ← this file
├── research.md          ← Phase 0 complete
├── data-model.md        ← Phase 1 complete
├── quickstart.md        ← Phase 1 complete
├── contracts/
│   └── auth-api.openapi.yaml
└── tasks.md             ← Phase 2 (not yet created — /speckit.tasks)
```

### Source Code

```text
backend/
├── src/
│   ├── api/
│   │   ├── auth.ts                          ← NEW: login, logout, me, change-password routes
│   │   └── index.ts                         ← MODIFIED: mount authRouter; protect apiRouter
│   ├── middleware/
│   │   └── requireAuth.ts                   ← NEW: session cookie validation middleware
│   ├── services/
│   │   ├── authService.ts                   ← NEW: credential + session management
│   │   └── migrations/
│   │       └── 002_auth_schema.ts           ← NEW: credentials + sessions tables + seed
│   └── server.ts                            ← MODIFIED: cookie-parser; auth route mounting
├── tests/
│   └── contract/
│       └── auth.test.ts                     ← NEW: contract tests for all 4 auth endpoints
└── package.json                             ← MODIFIED: bcryptjs, cookie-parser + types

frontend/
├── src/
│   ├── api/
│   │   ├── authApi.ts                       ← NEW: login, logout, checkAuth, changePassword
│   │   └── index.ts                         ← MODIFIED: export authApi
│   ├── components/
│   │   ├── LoginForm/
│   │   │   ├── LoginForm.tsx                ← NEW
│   │   │   ├── LoginForm.styled.ts          ← NEW
│   │   │   ├── index.ts                     ← NEW
│   │   │   ├── __tests__/LoginForm.test.tsx ← NEW
│   │   │   └── __stories__/LoginForm.stories.tsx ← NEW
│   │   ├── ChangePasswordForm/
│   │   │   ├── ChangePasswordForm.tsx       ← NEW
│   │   │   ├── ChangePasswordForm.styled.ts ← NEW
│   │   │   ├── index.ts                     ← NEW
│   │   │   ├── __tests__/ChangePasswordForm.test.tsx ← NEW
│   │   │   └── __stories__/ChangePasswordForm.stories.tsx ← NEW
│   │   └── index.ts                         ← MODIFIED
│   ├── containers/
│   │   ├── AuthGateContainer/
│   │   │   ├── AuthGateContainer.tsx        ← NEW
│   │   │   └── index.ts                     ← NEW
│   │   ├── LoginFormContainer/
│   │   │   ├── LoginFormContainer.tsx       ← NEW
│   │   │   └── index.ts                     ← NEW
│   │   ├── SettingsContainer/
│   │   │   ├── SettingsContainer.tsx        ← NEW
│   │   │   └── index.ts                     ← NEW
│   │   └── index.ts                         ← MODIFIED
│   ├── selectors/
│   │   └── containers.ts                    ← MODIFIED: add getAuthGateContainerProps
│   ├── slices/
│   │   ├── authSlice.ts                     ← NEW
│   │   └── index.ts                         ← MODIFIED
│   ├── store/
│   │   └── store.ts                         ← MODIFIED: add auth reducer
│   └── index.tsx                            ← MODIFIED: render AuthGateContainer
└── package.json                             ← no new deps (all auth UI uses existing stack)
```

**Structure Decision**: Web application (Option 2). No new projects introduced. Two new backend tables via migration, one new backend middleware directory, one new Redux slice, two new presentational components, three new containers.

---

## Phase 0: Research Findings Summary

See [research.md](research.md) for full details. Key decisions:

| Topic | Decision |
|-------|----------|
| Session mechanism | Custom token in SQLite `sessions` table + HttpOnly cookie; no express-session |
| Password hashing | `bcryptjs` (pure JS, no native bindings, work factor 12) |
| Credential bootstrap | `OWNER_USERNAME` + `OWNER_PASSWORD` env vars → hashed by migration `002` on first run |
| Frontend auth gate | `AuthGateContainer` dispatches `checkAuthStatus` on mount; conditional render |
| Route protection | `requireAuth` middleware applied to `apiRouter`; auth routes mounted before it |
| Redux auth state | New `authSlice` with `status: 'checking' | 'authenticated' | 'unauthenticated'` |

---

## Phase 1: Design Outputs

- [data-model.md](data-model.md) — `credentials` + `sessions` tables, `authSlice` state, service functions, Zod schemas
- [contracts/auth-api.openapi.yaml](contracts/auth-api.openapi.yaml) — OpenAPI spec for all 4 auth endpoints
- [quickstart.md](quickstart.md) — Setup instructions, changed files, password reset procedure

---

## Implementation Order

The work has a clear dependency chain:

1. **Backend foundation first**: migration → authService → middleware → auth routes → protect existing routes
2. **Frontend auth layer second**: authSlice → authApi → AuthGateContainer/LoginFormContainer → entry point change
3. **Settings UI last**: ChangePasswordForm component → SettingsContainer → connect to AppContainer

Steps 1 and 2 can be verified independently (curl for backend, Redux devtools for frontend) before the settings UI is built.

---

## Complexity Tracking

No constitution violations. No complexity justification required.
