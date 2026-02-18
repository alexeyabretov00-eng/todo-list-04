# Feature Specification: Simple Login/Password Authentication

**Feature Branch**: `001-simple-auth`  
**Created**: 2026-02-18  
**Status**: Draft  
**Input**: User description: "add simple auth - login/password"

> ✅ **Constitution Amendment Applied — 2026-02-18**
>
> This feature conflicted with **Constitution Principle I – Single-User Architecture**. **The amendment has been applied** to `.specify/memory/constitution.md` (2026-02-18).
>
> **Resolved scope**: This feature adds **access protection for the single owner-user**, with credentials manageable via an in-app settings screen. There are no multiple user accounts and no registration flow. Constitution Principle I now reads: *"Access protection via a single owner credential is permitted; no multi-user account management is in scope."*

## Clarifications

### Session 2026-02-18

- Q: How should the session token be stored on the client? → A: HttpOnly cookie set by the backend
- Q: Should the login endpoint be protected against brute-force / rate limiting? → A: No — out of scope; single-user personal tool, not a public-facing service
- Q: When the owner changes their password, should the current session stay valid or be invalidated? → A: Invalidated — all sessions are terminated on password change; owner is redirected to the login form
- Q: What are the minimum password complexity requirements? → A: Minimum 8 characters; no character-class requirements (uppercase, numbers, symbols)
- Q: What form does the login identifier take? → A: Plain username — any non-empty string, set by the owner at configuration time; no format validation beyond non-empty

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign In to the Application (Priority: P1)

The owner opens the application and sees a login screen. They enter their username and password and, if correct, are taken to their todo lists. If incorrect, they see a clear error message and can try again.

**Why this priority**: The login flow is the entry gate to the entire application. Nothing else is accessible until this story works. It is the minimum viable authentication.

**Independent Test**: Open the app in a fresh browser session. A login form should be displayed. Enter valid credentials and confirm the main todo interface loads. Enter invalid credentials and confirm an error message appears without granting access.

**Acceptance Scenarios**:

1. **Given** a user is not logged in, **When** they open the application, **Then** they see a login form with username and password fields and a submit button
2. **Given** the login form is displayed, **When** the user submits valid credentials, **Then** they are granted access and the main application view loads
3. **Given** the login form is displayed, **When** the user submits incorrect credentials, **Then** access is denied, an error message is shown, and the login form remains visible
4. **Given** the login form is displayed, **When** the user submits with an empty field, **Then** a validation error is shown before the request is sent
5. **Given** the user is logged in, **When** they navigate directly to the app URL, **Then** the main application view loads without showing the login form again

---

### User Story 2 - Stay Logged In Across Sessions (Priority: P2)

The owner logs in and later closes and reopens the browser. They expect to still be logged in without having to enter their credentials again.

**Why this priority**: Without session persistence, the user must log in on every visit, which is disruptive for a personal productivity tool.

**Independent Test**: Log in, close the browser tab, reopen the application, and confirm the main todo view loads without being redirected to the login screen.

**Acceptance Scenarios**:

1. **Given** the user is logged in, **When** they close the browser and reopen the application before the session expires, **Then** they are still logged in and see the main view
2. **Given** the user is logged in, **When** their session expires, **Then** they are automatically redirected to the login form on the next page load
3. **Given** the user is logged in, **When** they explicitly log out, **Then** their session is terminated and they are redirected to the login form

---

### User Story 3 - Log Out (Priority: P3)

The owner can log out from the application, ending their session so that the next person to open the application must log in again.

**Why this priority**: Logout is a basic hygiene requirement for any access-protected application, particularly for shared or public devices.

**Independent Test**: While logged in, trigger the logout action. Confirm the login form is shown. Confirm that pressing the browser back button or navigating directly to the app URL does not bypass the login form.

**Acceptance Scenarios**:

1. **Given** the user is logged in, **When** they click the logout control, **Then** their session is invalidated and the login form is displayed
2. **Given** the user has logged out, **When** they press the browser back button, **Then** they are not granted access to the main application view
3. **Given** the user has logged out, **When** another browser session attempts to use the same session token, **Then** access is denied

---

### User Story 4 - Change Password via Settings (Priority: P3)

The owner is logged in and wants to update their password. They navigate to a settings screen, enter their current password and a new password, and the credential is updated immediately.

**Why this priority**: Password management is a security convenience, but the application remains functional without it. Credentials can still be reset at the configuration level if needed.

**Independent Test**: While logged in, navigate to the settings screen. Enter the current password and a new password. Confirm the change is saved. Log out and confirm the new password grants access while the old one does not.

**Acceptance Scenarios**:

1. **Given** the owner is logged in, **When** they navigate to settings, **Then** a change-password form is visible with fields for current password and new password
2. **Given** the change-password form is shown, **When** the owner submits with the correct current password and a valid new password, **Then** the credential is updated and a success confirmation is shown
3. **Given** the change-password form is shown, **When** the owner submits with an incorrect current password, **Then** the credential is NOT changed and an error message is shown
4. **Given** the change-password form is shown, **When** the owner submits with an empty field, **Then** a validation error is shown before submission
5. **Given** the owner successfully changes their password, **When** the change is saved, **Then** all active sessions are invalidated and the owner is immediately redirected to the login form
6. **Given** the change-password form is shown, **When** the owner enters a new password shorter than 8 characters, **Then** a validation error is shown and the credential is NOT changed

---

### Edge Cases

- What happens when the user opens the application in two browser tabs and logs out in one — does the other tab detect the logout on its next API call?
- What happens when the owner changes their password while logged in — all active sessions are immediately invalidated and the owner is redirected to the login form to authenticate with the new password
- What happens when login credentials are correct but the backend is unreachable — is there an appropriate error message rather than a silent failure?
- What happens when the session expires mid-use (while the user is actively working) — are they prompted to log in again without losing unsaved form state?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST display a login form before allowing access to any part of the main interface when the user is not authenticated
- **FR-002**: The login form MUST require both a username and a password; submission with either field empty MUST be prevented with inline validation feedback; the username field has no format constraints beyond being non-empty
- **FR-003**: The system MUST verify credentials against a stored credential and grant access only when both fields match the configured owner credential
- **FR-004**: The system MUST maintain the authenticated session across page reloads for 24 hours from the time of login; after 24 hours, the session expires and the user must log in again
- **FR-004a**: The session token MUST be stored in an HttpOnly cookie set by the backend; the token MUST NOT be stored in `localStorage` or `sessionStorage`
- **FR-005**: The system MUST provide a logout action that immediately invalidates the current session and clears the session cookie
- **FR-006**: The system MUST prevent access to all application routes/views if a valid session is not present, redirecting unauthenticated requests to the login form
- **FR-007**: Incorrect login attempts MUST produce a clear, user-facing error message without revealing whether the username or password specifically was wrong
- **FR-008**: Credentials MUST NOT be stored or transmitted in plain text
- **FR-009**: The application MUST provide a settings screen where the logged-in owner can change their password; the change requires entering the current password before a new one is accepted
- **FR-010**: There is exactly one owner credential; no user registration or account creation flow exists in the application
- **FR-011**: A successful password change MUST immediately invalidate all active sessions; the owner MUST be redirected to the login form to authenticate with the new password
- **FR-012**: A new password MUST be at least 8 characters in length; passwords shorter than 8 characters MUST be rejected with an inline validation message; no character-class composition rules apply

### Key Entities

- **Session**: Represents an authenticated period of access; has a creation time (24-hour TTL from login), and an association with the authenticated credential; the session token is transmitted as an HttpOnly cookie — it is never accessible to client-side JavaScript
- **Credential**: The stored secret used to verify identity; a username (any non-empty string, configured by the owner at setup) and a hashed password (minimum 8 characters)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user who does not have a valid session cannot access any application data or views
- **SC-002**: A valid login attempt completes and grants access in under 2 seconds on a standard connection
- **SC-003**: An invalid login attempt displays an error message within 2 seconds and does not grant access under any circumstances
- **SC-004**: A logged-in user's session persists for 24 hours without requiring re-authentication, and expires automatically after that period
- **SC-005**: After logout, the session token is no longer accepted by the application
- **SC-006**: After a successful password change, any previously issued session token is no longer accepted by the application

## Assumptions

- The primary use case is **single-owner access protection**: one set of credentials secures the application; there is no self-service user registration
- Initial credentials are pre-configured by the application owner (e.g., via environment variable or a setup step); after setup, the password can be changed via the in-app settings screen
- If the owner is locked out (forgotten password), credentials are reset at the configuration level — there is no in-app recovery flow
- The application remains a single-page application; no new server-side routing is required beyond protecting existing API endpoints
- Session duration of 24 hours is measured from time of login, not last activity (non-rolling)
- The session token is an HttpOnly cookie; this satisfies Constitution Principle III (no application data in `localStorage`) as no client-side storage is used for the token
- Brute-force protection and rate limiting on the login endpoint are explicitly out of scope; this is a single-user personal tool, not a public-facing service
- The existing offline sync queue behaviour (Constitution Principle III) is preserved — authentication state does not affect how pending operations are stored or replayed
