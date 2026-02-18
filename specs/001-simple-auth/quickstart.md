# Quickstart: Simple Login/Password Authentication

**Feature**: `001-simple-auth` | **Branch**: `001-simple-auth`

---

## Setup: Initial Credential Configuration

Before the application will accept logins, an owner credential must be seeded. This is done once via environment variables, which are consumed by database migration `002_auth_schema` on first startup.

### 1. Add to `backend/.env`

```env
# Set your desired username and initial password
OWNER_USERNAME=admin
OWNER_PASSWORD=your-password-here
```

> **Important**: `OWNER_PASSWORD` is the plain-text password. The migration hashes it with bcrypt (work factor 12) and stores only the hash. After the first successful startup you may (and should) remove `OWNER_PASSWORD` from your `.env` file — it is no longer needed. The credential is now stored in the database.

### 2. Start the backend

```bash
cd backend
npm run dev
```

Migration `002_auth_schema` runs automatically on startup. Look for:

```
[migrations] Applied migration 2
[server] Listening on http://localhost:4000
```

### 3. Verify (optional)

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password-here"}'
# Expected: {"ok":true}
```

---

## Changed Files

### Backend

| File | Change |
|------|--------|
| `backend/src/services/migrations/002_auth_schema.ts` | New — creates `credentials` and `sessions` tables; seeds credential from env on first run |
| `backend/src/services/authService.ts` | New — credential verification, session create/validate/delete, password hashing |
| `backend/src/api/auth.ts` | New — `POST /login`, `POST /logout`, `GET /me`, `PUT /password` routes |
| `backend/src/middleware/requireAuth.ts` | New — reads `session_token` cookie; validates against `sessions` table; calls `next()` or returns 401 |
| `backend/src/server.ts` | Modified — mount `authRouter` on `app` before `apiRouter`; add `cookie-parser` middleware; apply `requireAuth` to `apiRouter` |
| `backend/package.json` | Modified — add `bcryptjs`, `cookie-parser`; add `@types/bcryptjs`, `@types/cookie-parser` |

### Frontend

| File | Change |
|------|--------|
| `frontend/src/slices/authSlice.ts` | New — `status: checking/authenticated/unauthenticated`; thunks: `checkAuthStatus`, `loginUser`, `logoutUser`, `changePasswordUser` |
| `frontend/src/slices/index.ts` | Modified — export `authSlice` |
| `frontend/src/api/authApi.ts` | New — `login()`, `logout()`, `checkAuth()`, `changePassword()` |
| `frontend/src/api/index.ts` | Modified — export authApi functions |
| `frontend/src/store/store.ts` | Modified — add `auth: authSlice.reducer` to `configureStore` |
| `frontend/src/components/LoginForm/LoginForm.tsx` | New — presentational login form |
| `frontend/src/components/LoginForm/LoginForm.styled.ts` | New — styled-components for LoginForm |
| `frontend/src/components/LoginForm/__tests__/LoginForm.test.tsx` | New — unit tests |
| `frontend/src/components/LoginForm/__stories__/LoginForm.stories.tsx` | New — Storybook stories |
| `frontend/src/components/LoginForm/index.ts` | New — barrel export |
| `frontend/src/components/ChangePasswordForm/ChangePasswordForm.tsx` | New — presentational change-password form |
| `frontend/src/components/ChangePasswordForm/ChangePasswordForm.styled.ts` | New |
| `frontend/src/components/ChangePasswordForm/__tests__/ChangePasswordForm.test.tsx` | New |
| `frontend/src/components/ChangePasswordForm/__stories__/ChangePasswordForm.stories.tsx` | New |
| `frontend/src/components/ChangePasswordForm/index.ts` | New |
| `frontend/src/components/index.ts` | Modified — export LoginForm, ChangePasswordForm |
| `frontend/src/containers/AuthGateContainer/AuthGateContainer.tsx` | New — dispatches `checkAuthStatus` on mount; renders LoginFormContainer or AppContainer |
| `frontend/src/containers/AuthGateContainer/index.ts` | New |
| `frontend/src/containers/LoginFormContainer/LoginFormContainer.tsx` | New — wires loginUser thunk to LoginForm |
| `frontend/src/containers/LoginFormContainer/index.ts` | New |
| `frontend/src/containers/SettingsContainer/SettingsContainer.tsx` | New — wires logoutUser, changePasswordUser to ChangePasswordForm + logout button |
| `frontend/src/containers/SettingsContainer/index.ts` | New |
| `frontend/src/containers/index.ts` | Modified — export new containers |
| `frontend/src/index.tsx` | Modified — render `<AuthGateContainer />` instead of `<AppContainer />` |

---

## Changing Your Password

Once logged in, navigate to Settings (accessible from the main UI). Enter your current password and a new password (minimum 8 characters) and submit. You will be immediately logged out and redirected to the login form — log in with your new password.

---

## Resetting a Forgotten Password

There is no in-app recovery flow. To reset a forgotten password:

1. Stop the backend server
2. Delete (or reset) the database: `rm backend/data/todos.db`  
   **Warning**: this deletes all todo data. Alternatively, use a SQLite client to delete the row from the `credentials` table directly.
3. Re-add `OWNER_USERNAME` and `OWNER_PASSWORD` to `backend/.env`
4. Restart the backend — migration seeds a new credential
