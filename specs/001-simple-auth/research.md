# Research: Simple Login/Password Authentication

**Feature**: `001-simple-auth`  
**Date**: 2026-02-18  
**Status**: Complete — all NEEDS CLARIFICATION from spec resolved

---

## Finding 1: Session Management Approach

**Decision**: Custom server-side session token stored in SQLite `sessions` table, delivered to the browser as an HttpOnly cookie.

**Rationale**:
- Aligns with the existing `better-sqlite3` infrastructure and migration pattern — no new runtime dependencies for session storage
- HttpOnly cookie satisfies the spec requirement (FR-004a) and sidesteps Constitution Principle III (no client-side storage)
- A custom token (cryptographically random, 256-bit hex string via `crypto.randomBytes`) with a `expires_at` column in SQLite is simpler than `express-session` (which requires a store adapter) and avoids the complexity of JWTs (no signing key management, no token validation logic)
- Sessions expire server-side; the client cannot tamper with expiry time

**Alternatives considered**:
- `express-session` with `better-sqlite3-session-store`: adds two dependencies; session store coupling to SQLite can cause lock contention during high-write periods (not a problem here, but unnecessary complexity)
- JWT in HttpOnly cookie: requires a `JWT_SECRET`, token validation logic; session invalidation on logout/password-change requires a blocklist or short expiry with refresh tokens — significantly more complex for a single-user app

---

## Finding 2: Password Hashing Library

**Decision**: `bcryptjs` (pure JavaScript implementation).

**Rationale**:
- No native bindings means no `node-gyp` or platform-specific build step; works identically across Windows, macOS, Linux CI environments
- `bcrypt` work factor 12 provides adequate security for interactive login (≈300ms hash time on modern hardware — well within the 2s SC-002 target)
- `@types/bcryptjs` available for TypeScript
- The alternative (`argon2`) requires native bindings and a Rust toolchain for compilation, significantly complicating the build environment

**Alternatives considered**:
- `bcrypt` (native): faster but requires native build tools; unnecessary for a single-user app where login throughput is negligible
- `argon2`: recommended by OWASP for new applications but native bindings add operational risk in this constrained build environment

---

## Finding 3: Credential Bootstrap Strategy

**Decision**: Environment-variable-seeded migration. A new migration (`002_auth_schema.ts`) creates the `credentials` and `sessions` tables. On first startup, if `OWNER_USERNAME` and `OWNER_PASSWORD` environment variables are present and the `credentials` table is empty, the migration seeds the hashed credential.

**Rationale**:
- Consistent with the existing migration pattern — credential setup is a schema-level concern, versioned alongside the DB schema
- The `OWNER_PASSWORD` env var is the plain-text password provided once at setup; the migration hashes it with bcrypt and stores only the hash; the env var should be removed from `.env` after first run (documented in quickstart)
- Alternatively, a separate `setup` script was considered but introduces an additional operational step and a non-standard startup sequence
- If no env vars are present and the `credentials` table is empty, the server starts but all routes return 503 with `{ error: 'Application not configured' }` — this prevents silent misconfiguration

**Alternatives considered**:
- Admin endpoint for initial credential setup: adds an unprotected endpoint to the API, creating a security window between deployment and first-use
- Hardcoded default credential: obvious security risk

---

## Finding 4: Frontend Auth Gate (No Routing Library)

**Decision**: New `AuthGateContainer` renders either `LoginFormContainer` or the existing `AppContainer` based on Redux `auth.status`. On mount, it dispatches `checkAuthStatus` (a thunk that calls `GET /api/auth/me`) to determine if a valid session cookie is already present.

**Rationale**:
- The constitution prohibits routing libraries ("No Routing" in Code Organization). Conditional rendering in `AuthGateContainer` is the pattern already established by the app.
- `auth.status` states: `'checking'` (initial, shows spinner) → `'authenticated'` (render AppContainer) → `'unauthenticated'` (render LoginFormContainer)
- `index.tsx` wraps `<AuthGateContainer />` instead of `<AppContainer />` directly — a one-line change to the entry point
- This approach means the existing `AppContainer` requires no changes for the auth gate logic; concerns remain separated

**Alternatives considered**:
- Checking auth inside `AppContainer` itself: mixes concerns, makes AppContainer harder to test in isolation, and requires propagating auth state down through existing props/selectors
- Route-based redirect libraries (React Router): explicitly prohibited by the constitution

---

## Finding 5: Protecting Existing API Routes

**Decision**: New `requireAuth` Express middleware reads the `session_token` cookie, validates it against the `sessions` table (checks existence and `expires_at`), and calls `next()` if valid or returns HTTP 401 if not. Applied to `apiRouter` in `server.ts` — all existing routes are protected with one line; `POST /api/auth/login` is mounted before `apiRouter` so it is exempt.

**Rationale**:
- Single middleware application protects all existing and future routes without touching individual route files
- Auth routes (`/api/auth/*`) are mounted directly on `app` (before `app.use('/api', apiRouter)`), making them implicitly exempt from the `requireAuth` middleware applied to `apiRouter`
- This matches the Express middleware ordering pattern already in place for CORS and body parsing

---

## Finding 6: Redux Auth Slice

**Decision**: New `authSlice.ts` in `frontend/src/slices/` with state `{ status: 'checking' | 'authenticated' | 'unauthenticated', error: string | null }`.

**Rationale**:
- Follows the existing slice-per-concern pattern (listsSlice, todosSlice, etc.)
- `status: 'checking'` on initial load triggers a spinner; prevents the login form flashing before the `GET /api/auth/me` response arrives
- Three async thunks: `checkAuthStatus`, `loginUser`, `logoutUser`; the `changePassword` action lives in the settings flow and can use the same slice or a dedicated settings thunk
- No auth state is persisted to localStorage (Principle III satisfied)

---

## Summary of NEEDS CLARIFICATION Resolutions

| Item | Resolution | Source |
|------|-----------|--------|
| Session token storage | HttpOnly cookie (Finding 1) | Spec clarification session |
| Brute-force protection | Out of scope (personal tool) | Spec clarification session |
| Password change session validity | All sessions invalidated on change | Spec clarification session |
| Password complexity | Minimum 8 characters, no composition rules | Spec clarification session |
| Username format | Plain non-empty string, no format validation | Spec clarification session |
| Session duration | 24 hours from login, non-rolling | Spec clarification session |
| Account model | Single owner credential, changeable via settings | Spec clarification session |
