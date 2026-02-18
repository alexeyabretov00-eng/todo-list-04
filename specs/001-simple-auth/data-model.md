# Data Model: Simple Login/Password Authentication

**Feature**: `001-simple-auth`  
**Date**: 2026-02-18

---

## New Database Tables (SQLite — migration `002_auth_schema`)

### `credentials`

Stores the single owner credential. There is exactly one row.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Auto-increment; always 1 in practice |
| `username` | TEXT | NOT NULL, UNIQUE | Owner's login identifier; plain string, any non-empty value |
| `password_hash` | TEXT | NOT NULL | bcrypt hash (work factor 12) of the owner's password |
| `created_at` | TEXT | NOT NULL | ISO 8601 UTC timestamp of initial credential creation |
| `updated_at` | TEXT | NOT NULL | ISO 8601 UTC timestamp of last password change |

**Seeding**: On first startup, if `OWNER_USERNAME` and `OWNER_PASSWORD` are set in the environment and the table is empty, the migration inserts a row with the hashed password. `OWNER_PASSWORD` is the plain-text value; only `password_hash` is persisted.

**State transitions**: `password_hash` and `updated_at` are updated when the owner changes their password. No other mutations occur on this table.

---

### `sessions`

Stores active session tokens. A row exists for each issued session. Rows are deleted on explicit logout or password change. Expired rows are cleaned up opportunistically on login.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `token` | TEXT | PRIMARY KEY | 256-bit cryptographically random hex string (64 hex chars via `crypto.randomBytes(32).toString('hex')`) |
| `created_at` | TEXT | NOT NULL | ISO 8601 UTC timestamp when the session was issued |
| `expires_at` | TEXT | NOT NULL | ISO 8601 UTC timestamp = `created_at + 24 hours`; non-rolling |

**Session lifecycle**:
1. **Created**: On successful `POST /api/auth/login` — one row inserted; token set as HttpOnly cookie
2. **Validated**: On every authenticated request — `requireAuth` middleware reads cookie, checks token exists and `expires_at > NOW()`
3. **Deleted (logout)**: On `POST /api/auth/logout` — row deleted; cookie cleared
4. **Deleted (password change)**: On `PUT /api/auth/password` — all rows in `sessions` deleted; cookie cleared; 200 returned; owner redirected to login form by frontend
5. **Expired passively**: Expired rows are deleted from the table on each successful `POST /api/auth/login` (lazy cleanup — no background job needed for a single-user app)

---

## Redux State (Frontend)

### `authSlice` — `frontend/src/slices/authSlice.ts`

```typescript
interface AuthState {
  status: 'checking' | 'authenticated' | 'unauthenticated';
  error: string | null;
}

const initialState: AuthState = {
  status: 'checking',  // spinner shown until GET /api/auth/me resolves
  error: null,
};
```

**State transitions**:

| From | Action | To |
|------|--------|----|
| `checking` | `checkAuthStatus` fulfilled | `authenticated` |
| `checking` | `checkAuthStatus` rejected | `unauthenticated` |
| `unauthenticated` | `loginUser` fulfilled | `authenticated` |
| `unauthenticated` | `loginUser` rejected | `unauthenticated` + error set |
| `authenticated` | `logoutUser` fulfilled | `unauthenticated` |
| `authenticated` | `changePasswordUser` fulfilled | `unauthenticated` (server invalidates session) |
| `authenticated` | any API call returns 401 | `unauthenticated` (global error handler) |

**Store registration**: Added to `store.ts` as `auth: authSlice.reducer`.

---

## New Frontend API Functions — `frontend/src/api/authApi.ts`

| Function | Method | Path | Body | Returns |
|----------|--------|------|------|---------|
| `login(username, password)` | POST | `/api/auth/login` | `{ username, password }` | `{ ok: true }` or throws |
| `logout()` | POST | `/api/auth/logout` | — | `{ ok: true }` |
| `checkAuth()` | GET | `/api/auth/me` | — | `{ authenticated: true }` or 401 |
| `changePassword(currentPassword, newPassword)` | PUT | `/api/auth/password` | `{ currentPassword, newPassword }` | `{ ok: true }` or throws |

All functions use the existing `fetch` API (no CORS — same domain, dev proxy configured per constitution).

---

## New Backend Services — `backend/src/services/authService.ts`

| Function | Description |
|----------|-------------|
| `getCredential()` | Returns the single `credentials` row or `null` |
| `verifyPassword(plain, hash)` | `bcryptjs.compare(plain, hash)` → boolean |
| `hashPassword(plain)` | `bcryptjs.hash(plain, 12)` → hash string |
| `updatePassword(newHash)` | Updates `credentials.password_hash` and `updated_at`; returns void |
| `createSession()` | Inserts a new `sessions` row; returns the token string |
| `validateSession(token)` | Returns session row if token exists and not expired, else `null` |
| `deleteSession(token)` | Deletes one session row |
| `deleteAllSessions()` | Deletes all session rows (used on password change) |
| `cleanExpiredSessions()` | Deletes all rows where `expires_at < NOW()` (called on login) |

---

## New Backend Middleware — `backend/src/middleware/requireAuth.ts`

```typescript
// Pseudocode
export function requireAuth(req, res, next) {
  const token = req.cookies['session_token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const session = validateSession(token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  next();
}
```

Applied to `apiRouter` in `server.ts`. Auth routes are mounted on `app` directly, before `apiRouter`, so they are exempt.

---

## New Components & Containers

| Artifact | Type | Location | Responsibility |
|----------|------|----------|----------------|
| `AuthGateContainer` | Container | `containers/AuthGateContainer/` | Checks auth on mount; renders `LoginFormContainer` or `AppContainer` |
| `LoginFormContainer` | Container | `containers/LoginFormContainer/` | Dispatches `loginUser`; handles errors; provides props to `LoginForm` |
| `SettingsContainer` | Container | `containers/SettingsContainer/` | Dispatches `logoutUser`, `changePasswordUser`; provides props to `ChangePasswordForm` |
| `LoginForm` | Component | `components/LoginForm/` | Presentational login form (username + password fields + submit) |
| `ChangePasswordForm` | Component | `components/ChangePasswordForm/` | Presentational change-password form (currentPassword + newPassword + submit) |

---

## Zod Validation Schemas

```typescript
// Login
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Change password
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});
```

Used by both frontend (react-hook-form zodResolver) and backend (request body validation).
