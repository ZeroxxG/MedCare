# MediConnect — Authentication Guide

## Overview

MediConnect uses a **dual-authentication** system:
1. **Email + Password** — via Django REST Framework + SimpleJWT
2. **Google OAuth 2.0** — via Google Identity Services (GSI)

All protected API routes require a **JWT Bearer token** in the `Authorization` header.

---

## 1. Email / Password Authentication

### Registration — `POST /api/auth/register/`

**Request Body:**
```json
{
  "first_name": "Rahul",
  "last_name": "Sharma",
  "email": "rahul@example.com",
  "password": "SecurePass@123",
  "password_confirm": "SecurePass@123",
  "role": "PATIENT"
}
```

**Doctor-only additional fields:**
```json
{
  "role": "DOCTOR",
  "medical_registration_number": "MCI-123456",
  "specialization_id": "Cardiology",
  "experience_years": 8
}
```

**Success Response `201 Created`:**
```json
{
  "message": "Registration successful. Verification email sent.",
  "user": { "id": "...", "email": "...", "role": "PATIENT", ... },
  "tokens": {
    "access": "<JWT access token>",
    "refresh": "<JWT refresh token>"
  }
}
```

> **Note**: Tokens are issued immediately on registration — no separate login required.

---

### Login — `POST /api/auth/login/`

**Request Body:**
```json
{
  "email": "rahul@example.com",
  "password": "SecurePass@123"
}
```

**Success Response `200 OK`:**
```json
{
  "access": "<JWT access token — 1 day lifetime>",
  "refresh": "<JWT refresh token — 7 day lifetime>",
  "user": { "id": "...", "email": "...", "role": "PATIENT", ... }
}
```

**Failure Response `401 Unauthorized`:**
```json
{ "detail": "No active account found with the given credentials" }
```

---

### Token Refresh — `POST /api/auth/refresh/`

Access tokens expire after **1 day**. Refresh tokens expire after **7 days**.

**Request Body:**
```json
{ "refresh": "<your refresh token>" }
```

**Response:**
```json
{ "access": "<new access token>", "refresh": "<new refresh token>" }
```

> The old refresh token is **blacklisted** after rotation (via `rest_framework_simplejwt.token_blacklist`). Store the new refresh token.

The Axios `api.js` interceptor handles this **automatically** — if a request receives a `401`, it attempts a silent refresh and retries the original request. If refresh fails, the user is logged out.

---

### Authenticated Requests

Include the access token in all protected requests:

```http
GET /api/auth/me/ HTTP/1.1
Authorization: Bearer <access_token>
```

---

## 2. Password Reset Flow

### Step 1 — Request Reset — `POST /api/auth/forgot-password/`

```json
{ "email": "rahul@example.com" }
```

Response is always `200 OK` (for security — no email enumeration):
```json
{ "message": "Password reset link has been dispatched to your email." }
```

A time-limited reset link is emailed to the user:
```
http://localhost:5173/forgot-password?token=<uuid-token>
```

---

### Step 2 — Submit New Password — `POST /api/auth/reset-password/`

```json
{
  "token": "<uuid from the email link>",
  "new_password": "NewSecurePass@456"
}
```

**Success:** `200 OK` — `{ "message": "Password reset successfully!" }`  
**Failure:** `400 Bad Request` — `{ "error": "Invalid or expired reset token." }`

> Tokens are single-use. Attempting to reuse a token returns an error.

---

### Change Password (Authenticated) — `POST /api/auth/change-password/`

```json
{
  "old_password": "CurrentPassword",
  "new_password": "NewPassword@123"
}
```

Requires `Authorization: Bearer <token>` header.

---

## 3. Google OAuth 2.0

### How It Works

```
Browser                              Backend
   │                                    │
   │  User clicks "Continue with Google"│
   │                                    │
   │  Google GSI renders button         │
   │  User selects Google account       │
   │                                    │
   │  Google returns id_token (JWT)     │
   │                                    │
   │── POST /api/auth/google/ ─────────►│
   │   { id_token, role }               │
   │                                    │ Verifies token via:
   │                                    │  1. oauth2.googleapis.com/tokeninfo
   │                                    │  2. JWT payload decode (fallback)
   │                                    │
   │                                    │ get_or_create User
   │◄── { user, tokens } ──────────────│
```

### Setup Requirements

1. **Google Cloud Console** → Create a project → Enable "Google Identity" API
2. Create OAuth 2.0 Credentials → **Web Application**
3. Add Authorized JavaScript Origins:
   - `http://localhost:5173` (local dev)
   - `https://yourdomain.com` (production)
4. Copy the **Client ID** (ends in `.apps.googleusercontent.com`)

### Configuration

**`backend/.env`:**
```env
GOOGLE_CLIENT_ID=626396xxxx.apps.googleusercontent.com
```

**`frontend/.env`:**
```env
VITE_GOOGLE_CLIENT_ID=626396xxxx.apps.googleusercontent.com
```

### API Endpoint — `POST /api/auth/google/`

```json
{
  "id_token": "<Google GSI credential string>",
  "role": "PATIENT"
}
```

**Success Response `200 OK`:**
```json
{
  "message": "Google Login successful",
  "user": { "id": "...", "email": "...", "role": "PATIENT", ... },
  "tokens": {
    "access": "<JWT access token>",
    "refresh": "<JWT refresh token>"
  }
}
```

**Failure:** Returns `400` if token verification fails — no fallback fake accounts.

---

## 4. Email Verification

After registration, a verification email is sent with a one-time token.

### Verify Email — `POST /api/auth/verify-email/`

```json
{ "token": "<uuid from email>" }
```

Sets `user.is_email_verified = True`. Tokens are single-use.

---

## 5. JWT Token Details

| Property | Value |
|---|---|
| Algorithm | `HS256` |
| Access Token Lifetime | **1 day** |
| Refresh Token Lifetime | **7 days** |
| Rotation | ✅ Enabled (`ROTATE_REFRESH_TOKENS=True`) |
| Blacklist on Rotation | ✅ Enabled (`BLACKLIST_AFTER_ROTATION=True`) |
| Token Claim | `user_id` (UUID) |
| Auth Header | `Authorization: Bearer <token>` |

---

## 6. Security Considerations

- **Secrets in `.env` only** — `SECRET_KEY`, `GOOGLE_CLIENT_ID`, Razorpay/Stripe keys are never hardcoded in source
- **No email enumeration** — password reset always returns `200 OK` regardless of whether the email exists
- **Single-use tokens** — email verification and password reset tokens are marked `is_used=True` after first use
- **Token blacklisting** — old refresh tokens are invalidated immediately on rotation
- **CORS** — configure `CORS_ALLOWED_ORIGINS` to specific domains in production (not `*`)
- **HTTPS** — always use HTTPS in production to protect tokens in transit
