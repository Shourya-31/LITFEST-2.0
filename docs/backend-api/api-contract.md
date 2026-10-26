# LitFest 2.0 — Backend API Contract

Base URL: `/api/v1`

## Conventions

- Request and response bodies use JSON unless otherwise specified.
- Authentication uses the `litfest_session` HTTP-only cookie.
- Frontend requests requiring authentication must include credentials.
- Database IDs use 64-bit integers and are serialized as JSON strings.
- Password hashes, reset-token hashes, and session secrets must never be returned.
- Email addresses are normalized to lowercase.
- Validation failures should be handled by the frontend without exposing internal errors.

## Authentication

### POST `/auth/register`
Create an account.

Request:
- `name`: string
- `email`: valid email address
- `password`: string

Success: account information and an authenticated session cookie.

### POST `/auth/login`
Authenticate an existing user.

Request:
- `email`: valid email address
- `password`: string

Success: account information and an authenticated session cookie.

### POST `/auth/logout`
Clear the current session cookie.

### GET `/auth/me`
Return the currently authenticated user's information.

Requires authentication.

## User Profile

### GET `/users/me`
Return the authenticated user's profile.

Requires authentication.

### PATCH `/users/me`
Update profile fields.

Accepted fields:
- `name`
- `phone`
- `college`
- `bio`

Requires authentication.

### PATCH `/users/me/password`
Change the current password.

Requires authentication. The request must include the current password and new password.

## Password Reset

### POST `/auth/forgot-password`
Request a password-reset token.

Request:
- `email`: valid email address

The response should not disclose whether the email belongs to an account. In development, the response may include a reset token for testing. Production must not expose the token in the API response.

### POST `/auth/reset-password`
Reset a password using a valid, unused, unexpired reset token.

The request includes the reset token and new password.

Reset tokens expire after 15 minutes and may be used only once.

## Database Models

- `User`: account and profile data
- `Event`: event details and publication status
- `EventRegistration`: user-to-event registration; each user can have at most one registration per event
- `Team`: event-associated team
- `TeamMember`: user membership in a team
- `PasswordResetToken`: hashed, expiring reset tokens

## Integration Notes

- Registration and login establish the session cookie.
- Authenticated frontend requests must send cookies.
- IDs are strings in JSON even though database IDs are 64-bit integers.
- Registration uniqueness is enforced by the database.
- Event listing, event details, registration management, and team endpoints are not defined by this document yet; coordinate their request and response shapes with Dev B before implementation.
- Password-reset email delivery is not implemented by the current development flow.
