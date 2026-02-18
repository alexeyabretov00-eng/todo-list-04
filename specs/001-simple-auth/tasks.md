# Tasks: Simple Login/Password Authentication

**Input**: Design documents from `/specs/001-simple-auth/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete-task dependencies)
- **[Story]**: Which user story this task belongs to
- All paths are relative to repo root

---

## Phase 1: Setup

**Purpose**: Add the two new backend runtime dependencies before any feature work begins.

- [X] T001 Add `bcryptjs`, `cookie-parser`, `@types/bcryptjs`, `@types/cookie-parser` to `backend/package.json` and install

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, session/credential service layer, and middleware must exist before any user story can be implemented. No user story work begins until this phase is complete.

- [X] T002 Create `backend/src/services/migrations/002_auth_schema.ts` — `credentials` table (id, username, password_hash, created_at, updated_at) + `sessions` table (token, created_at, expires_at); seed from `OWNER_USERNAME`/`OWNER_PASSWORD` env vars if table is empty
- [X] T003 Register migration 002 in `backend/src/services/migrations/runner.ts` — add `import * as migration002 from './002_auth_schema'` and push `{ version: 2, up: migration002.up }` to the migrations array
- [X] T004 [P] Implement `backend/src/services/authService.ts` — `getCredential`, `verifyPassword`, `hashPassword`, `updatePassword`, `createSession`, `validateSession`, `deleteSession`, `deleteAllSessions`, `cleanExpiredSessions` (see data-model.md for full signatures)
- [X] T005 [P] Implement `backend/src/middleware/requireAuth.ts` — read `req.cookies['session_token']`; call `validateSession`; if missing or expired return `res.status(401).json({ error: 'Unauthorized' })`; otherwise `next()`
- [X] T006 Add `cookie-parser` middleware to `backend/src/server.ts` — `import cookieParser from 'cookie-parser'` and `app.use(cookieParser())` before route mounting

**Checkpoint**: Database tables exist, authService functions are callable, requireAuth middleware exists — user story implementation can begin

---

## Phase 3: User Story 1+2 — Sign In + Session Persistence (Priority: P1/P2) 🎯 MVP

**Goal**: Owner can log in via the browser, receive an HttpOnly session cookie, and be taken to the main application. On subsequent page loads (including after browser close/reopen within 24h), the app checks for a valid session and skips the login form if one exists.

**Note**: US1 (Sign In) and US2 (Stay Logged In) are implemented together because `AuthGateContainer`'s `checkAuthStatus`-on-mount is required for both stories — building US1 without `GET /me` would render the login form on every page reload.

**Independent Test**: (1) Open app in a fresh browser session — login form appears. Submit valid credentials — main todo interface loads. Submit invalid — error shown. (2) While logged in, close and reopen the browser tab within 24h — main view loads without the login form appearing.

- [ ] T007 [US1] Add `POST /api/auth/login` and `GET /api/auth/me` handlers to `backend/src/api/auth.ts` — login: validate non-empty fields, verify password via `authService.verifyPassword`, call `cleanExpiredSessions` + `createSession`, set `session_token` HttpOnly cookie (`HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`; add `Secure` flag only when `NODE_ENV=production`), return `{ ok: true }`; me: call `requireAuth` inline and return `{ authenticated: true }`
  > **Cookie note**: `SameSite=Lax` permits top-level navigation (bookmarks, address bar) while blocking CSRF. `SameSite=Strict` would break opening the app from an external link. `Secure` is omitted in development (HTTP localhost) but must be set in production (HTTPS).
- [ ] T008 [US1] Mount auth routes and protect existing API — mount `app.use('/api/auth', authRouter)` **before** `app.use('/api', apiRouter)` in `backend/src/server.ts`; add `router.use(requireAuth)` as the first line in `backend/src/api/index.ts` to protect all existing routes
  > **Security boundary note** (FR-006): The backend `requireAuth` middleware is the real security control — all data is inaccessible without a valid session cookie regardless of frontend state. `AuthGateContainer` (T014) is the UX guard only; manipulating Redux state client-side does not grant API access.
- [ ] T009 [P] [US1] Create `frontend/src/slices/authSlice.ts` — `AuthState { status: 'checking' | 'authenticated' | 'unauthenticated', error: string | null }`; thunks `checkAuthStatus` (calls `checkAuth()` API; fulfil → authenticated, reject → unauthenticated) and `loginUser` (calls `login()`; fulfil → authenticated, reject → error set)
- [ ] T010 [P] [US1] Create `frontend/src/api/authApi.ts` — `login(username, password)`, `checkAuth()`, `logout()`, `changePassword(currentPassword, newPassword)` — all using `fetch` with `credentials: 'include'`; update `frontend/src/api/index.ts` to export all four; add a global 401 interceptor helper that, when any API call returns HTTP 401, dispatches `setUnauthenticated()` from `authSlice` to trigger the auth gate redirect (covers FR-006 frontend side and US2 AS-2 session expiry during active use)
- [ ] T011 [US1] Register auth slice in store — update `frontend/src/slices/index.ts` to `export * from './authSlice'`; add `auth: authSlice.reducer` to `configureStore` in `frontend/src/store/store.ts`
- [ ] T012 [P] [US1] Create `LoginForm` presentational component in `frontend/src/components/LoginForm/` — `LoginForm.tsx` (username + password fields via react-hook-form + Zod `loginSchema`, submit button, inline error display, loading state), `LoginForm.styled.ts` (Ant Design + styled-components layout), `index.ts` barrel
- [ ] T013 [US1] Create `LoginFormContainer` in `frontend/src/containers/LoginFormContainer/LoginFormContainer.tsx` — connect `loginUser` thunk and auth error from Redux; pass props to `LoginForm`; `index.ts` barrel
- [ ] T014 [US2] Create `AuthGateContainer` in `frontend/src/containers/AuthGateContainer/AuthGateContainer.tsx` — dispatch `checkAuthStatus` on mount; render `<Spin />` while `status === 'checking'`; render `<LoginFormContainer />` when `unauthenticated`; render `<AppContainer />` when `authenticated`; add `getAuthGateContainerProps` selector to `frontend/src/selectors/containers.ts`; `index.ts` barrel
- [ ] T015 [P] [US1] Update barrel exports — add `LoginForm`, `ChangePasswordForm` (placeholder) to `frontend/src/components/index.ts`; add `AuthGateContainer`, `LoginFormContainer`, `SettingsContainer` (placeholder) to `frontend/src/containers/index.ts`
- [ ] T016 [US1] Update `frontend/src/index.tsx` — replace `<AppContainer />` with `<AuthGateContainer />`

**Checkpoint**: Start backend, set `OWNER_USERNAME`/`OWNER_PASSWORD` in `.env`, start frontend — login form appears, valid credentials grant access, invalid credentials show error; refreshing the page while logged in keeps the user logged in

---

## Phase 4: User Story 3 — Log Out (Priority: P3)

**Goal**: Owner can terminate their session from within the application, return to the login form, and cannot re-access the app via browser back navigation.

**Independent Test**: While logged in, click the logout button — login form is shown. Press browser back — not granted access. In another tab, any API call with the same session token returns 401.

- [ ] T017 [US3] Add `POST /api/auth/logout` handler to `backend/src/api/auth.ts` — call `deleteSession(token)` from cookie; clear cookie (`Max-Age=0`); return `{ ok: true }`; 401 if no valid session
- [ ] T018 [US3] Implement `logoutUser` thunk in `frontend/src/slices/authSlice.ts` — calls `logout()` API; on fulfil set status to `unauthenticated`; handle rejected (set unauthenticated regardless — session may already be gone)
- [ ] T019 [US3] Create `SettingsContainer` in `frontend/src/containers/SettingsContainer/SettingsContainer.tsx` — render a logout button wired to `logoutUser` thunk; `index.ts` barrel
- [ ] T020 [US3] Add settings/logout access to `frontend/src/containers/AppContainer/AppContainer.tsx` — render `<SettingsContainer />` in the app layout (e.g., in the Ant Design `Layout.Header` or alongside `SyncStatus`)

**Checkpoint**: Start the app, log in, click logout — login form appears; cannot navigate back to app content without re-authenticating

---

## Phase 5: User Story 4 — Change Password via Settings (Priority: P3)

**Goal**: While logged in, the owner can change their password. On success, all sessions are invalidated and the owner must log in again with the new password.

**Independent Test**: While logged in, navigate to Settings, enter current password and a new password (≥8 chars). Confirm success. Log out / refresh — new password grants access; old password does not.

- [ ] T021 [US4] Add `PUT /api/auth/password` handler to `backend/src/api/auth.ts` — validate non-empty fields + `newPassword.length >= 8`; verify `currentPassword` via `authService.verifyPassword`; call `hashPassword` + `updatePassword`; call `deleteAllSessions`; clear cookie; return `{ ok: true }`; 401 if current password wrong or no valid session
- [ ] T022 [US4] Implement `changePasswordUser` thunk in `frontend/src/slices/authSlice.ts` — calls `changePassword(currentPassword, newPassword)` API; on fulfil set status to `unauthenticated` (server cleared the session)
- [ ] T023 [P] [US4] Create `ChangePasswordForm` presentational component in `frontend/src/components/ChangePasswordForm/` — `ChangePasswordForm.tsx` (currentPassword + newPassword fields via react-hook-form + Zod `changePasswordSchema`, submit button, inline error/success display, loading state), `ChangePasswordForm.styled.ts`, `index.ts` barrel
- [ ] T024 [US4] Expand `SettingsContainer` in `frontend/src/containers/SettingsContainer/SettingsContainer.tsx` — add `ChangePasswordForm` wired to `changePasswordUser` thunk alongside the existing logout button; show password change success/error state
- [ ] T025 [P] [US4] Update `frontend/src/components/index.ts` to export `ChangePasswordForm`; update `frontend/src/api/index.ts` if `changePassword` was left as a stub in T010

**Checkpoint**: Full settings flow works — logout and change-password both function correctly; changing password forces re-login with new credential

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Meet the ≥80% coverage requirement mandated by Constitution Principle IV. All new code must be covered.

- [ ] T026 Write contract tests for all 4 auth endpoints in `backend/tests/contract/auth.test.ts` — cover: valid login → 200 + cookie; wrong password → 401; protected route without cookie → 401; protected route with valid cookie → 200; logout → cookie cleared; change-password with correct current → 200 + all sessions invalidated; change-password with wrong current → 401; change-password with short new password → 400
- [ ] T026a Update all existing backend contract tests to pass a valid session cookie — after T008 applies `requireAuth` to `apiRouter`, every existing test in `backend/tests/contract/` (`todos.test.ts`, `lists.test.ts`, `subitems.test.ts`, `completion.test.ts`, `editing.test.ts`, `reorder.test.ts`) will fail with 401 unless a session cookie is included; add a shared `beforeAll` helper that logs in and extracts the cookie, then passes it in each request's headers
- [ ] T027 [P] Write unit tests for `backend/src/services/authService.ts` in `backend/tests/unit/authService.test.ts` — cover: `verifyPassword` match/mismatch, `createSession` inserts row, `validateSession` returns null for expired token, `deleteAllSessions` removes all rows, `cleanExpiredSessions` removes only expired rows
- [ ] T028 [P] Write unit tests for `frontend/src/slices/authSlice.ts` — cover: `checkAuthStatus` fulfilled → status `authenticated`; `checkAuthStatus` rejected → status `unauthenticated`; `loginUser` fulfilled → `authenticated`; `loginUser` rejected → `unauthenticated` + error; `logoutUser` fulfilled → `unauthenticated`; `changePasswordUser` fulfilled → `unauthenticated`
- [ ] T029 [P] Write component tests for `LoginForm` in `frontend/src/components/LoginForm/__tests__/LoginForm.test.tsx` and `ChangePasswordForm` in `frontend/src/components/ChangePasswordForm/__tests__/ChangePasswordForm.test.tsx` — cover: renders fields; submit with empty fields shows validation error; submit with valid data calls callback; loading state disables submit
- [ ] T030 Run full test suites (`backend` + `frontend`), verify ≥80% coverage; fix any gaps; verify no regressions in existing contract tests (`lists`, `todos`, `subitems`, `completion`, etc.) that now require auth cookie

---

## Dependencies

```
T001 → T002 → T003 → T004 → T007 → T008
                    ↘ T005 ↗
              T006 ↗

T009, T010 → T011 → T013 → T014 → T016
T012 ↗

T007, T008, T016 → US1 checkpoint

T017, T018 → T019 → T020 → US3 checkpoint

T021, T022, T023 → T024, T025 → US4 checkpoint

US3 + US4 checkpoints → T026, T027, T028, T029 → T030
```

---

## Parallel Execution Examples

Within Phase 3 (US1+US2), the following tasks have no mutual dependencies and can be implemented simultaneously by different files:

| Parallel Group | Tasks |
|---|---|
| Backend route + Frontend slice + Form component | T007, T009, T012 |
| API client + barrel exports | T010, T015 |

Within Polish phase:

| Parallel Group | Tasks |
|---|---|
| Backend unit + Frontend slice test + Component tests | T027, T028, T029 |

---

## Implementation Strategy

**MVP** (deliver value after Phase 3): User Story 1+2 — the login gate is fully functional; the owner can log in and their session persists. The existing todo functionality is unchanged but now protected.

**Priority order**:
1. Phase 3 (US1+US2) — access protection, the primary feature goal
2. Phase 4 (US3) — logout, required for shared/public device use
3. Phase 5 (US4) — password change, convenience/security
4. Polish — coverage mandate

---

## Summary

| Metric | Value |
|---|---|
| Total tasks | 31 |
| Phase 1 (Setup) | 1 |
| Phase 2 (Foundational) | 5 |
| Phase 3 (US1+US2 MVP) | 10 |
| Phase 4 (US3) | 4 |
| Phase 5 (US4) | 5 |
| Phase 6 (Polish) | 6 |
| Parallelizable tasks | 12 |
| New backend files | 4 |
| Modified backend files | 3 |
| New frontend files | 14 |
| Modified frontend files | 6 |
