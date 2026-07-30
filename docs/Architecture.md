# MediConnect — System Architecture

## Overview

MediConnect is a **full-stack, role-based Healthcare Appointment Booking Platform** built with a decoupled frontend/backend architecture. The system is designed to be production-ready, environment-driven, and horizontally scalable.

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT BROWSER                          │
│            React 18 + Vite + Tailwind CSS                   │
│                  (http://localhost:5173)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP/REST (JSON)
                       │  JWT Bearer Tokens
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   DJANGO REST API                           │
│         Django 5 + DRF + SimpleJWT + drf-spectacular        │
│                  (http://localhost:8000)                     │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  users   │ │ doctors  │ │patients  │ │appointments  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │ payments │ │ reviews  │ │notifs    │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┼───────────┐
           ▼           ▼           ▼
      ┌─────────┐ ┌─────────┐ ┌──────────────┐
      │SQLite / │ │ Gmail   │ │  Razorpay /  │
      │Postgres │ │  SMTP   │ │  Stripe API  │
      └─────────┘ └─────────┘ └──────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios |
| **Backend** | Django 5, Django REST Framework, Python 3.11+ |
| **Auth** | SimpleJWT (access + refresh tokens), Google OAuth 2.0 (GSI) |
| **API Docs** | drf-spectacular (OpenAPI 3 / Swagger UI) |
| **Database** | SQLite (dev) → PostgreSQL (production) |
| **Email** | Django email backend → Gmail SMTP / any SMTP provider |
| **Payments** | Razorpay, Stripe (pluggable Strategy pattern) |
| **CORS** | django-cors-headers |
| **Filtering** | django-filter, DRF SearchFilter, OrderingFilter |

---

## Django App Structure

```
backend/
├── mediconnect_backend/     # Project config (settings, urls, wsgi)
├── users/                   # Custom User model, JWT auth, Google OAuth
│   ├── models.py            # User, EmailVerificationToken, PasswordResetToken
│   ├── serializers.py       # Registration, Login, Password flows
│   ├── views.py             # RegisterView, LoginView, GoogleLoginView, etc.
│   └── urls.py
├── doctors/                 # Doctor profiles, specializations, availability
│   ├── models.py            # DoctorProfile, Specialization, Availability
│   ├── views.py             # DoctorListView, DoctorMeView, AvailabilityView
│   └── urls.py
├── patients/                # Patient profiles
├── appointments/            # Booking engine, slot logic, approval flow
│   ├── models.py            # Appointment (status FSM)
│   └── views.py             # Book, Approve, Cancel, Complete
├── payments/                # Payment gateway abstraction layer
│   ├── gateways.py          # BasePaymentGateway, RazorpayGateway, StripeGateway
│   ├── models.py            # Payment, PaymentReceipt
│   └── views.py             # Initiate, Verify, Receipt
├── reviews/                 # Patient ratings on completed appointments
├── notifications/           # In-app notification model
└── seed_data.py             # Dev database seeder
```

---

## Frontend Structure

```
frontend/src/
├── components/              # Reusable UI components
│   ├── GoogleAuthModal.jsx  # Real Google GSI OAuth modal
│   ├── RazorpayCheckoutModal.jsx
│   ├── AppointmentCard.jsx
│   └── ...
├── context/
│   └── AuthContext.jsx      # Global auth state (user, login, logout)
├── pages/                   # Route-level page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── PatientDashboard.jsx
│   ├── DoctorDashboard.jsx
│   ├── DoctorSearch.jsx
│   ├── DoctorDetail.jsx
│   ├── ForgotPassword.jsx
│   └── ...
├── services/                # API service layer (Axios)
│   ├── api.js               # Axios instance + JWT interceptors + token refresh
│   ├── authService.js
│   ├── doctorService.js
│   ├── appointmentService.js
│   ├── paymentService.js
│   └── ...
└── main.jsx                 # App entry, RouterProvider, AuthProvider
```

---

## Key Design Patterns

### 1. Strategy Pattern — Payment Gateways
`payments/gateways.py` implements a **Strategy Pattern**. Each gateway (Razorpay, Stripe) extends `BasePaymentGateway` and overrides `create_order` and `verify_payment`. Adding a new gateway requires no changes to the views layer.

### 2. JWT Token Rotation
Access tokens expire in **1 day**; refresh tokens expire in **7 days**. On every refresh, the old refresh token is blacklisted via `rest_framework_simplejwt.token_blacklist`. The Axios interceptor in `api.js` handles silent refresh automatically on 401 responses.

### 3. Role-Based Access Control (RBAC)
The `User.role` field (`PATIENT | DOCTOR | ADMIN`) gates all protected views. DRF permission classes enforce role at the API level; the frontend router guards redirect unauthorized users.

### 4. Environment-Driven Configuration
All secrets (SECRET_KEY, database credentials, API keys) are loaded from `.env` files. There are **zero hardcoded secrets** in source code. A missing `SECRET_KEY` raises a `ValueError` at startup — the app will not run silently with an insecure default.

---

## Data Flow — Booking an Appointment

```
Patient selects slot
      │
      ▼
POST /api/appointments/          →  Appointment created (status: PENDING)
      │
      ▼
POST /api/payments/initiate/     →  Gateway creates order (Razorpay order_id returned)
      │
      ▼
Razorpay Checkout.js opens in browser  (payment handled client-side)
      │
      ▼
POST /api/payments/verify/       →  Backend verifies signature
      │
      ├─ SUCCESS → Appointment status: CONFIRMED, receipt created, email sent
      └─ FAILURE → Payment record marked FAILED
```

---

## Production Deployment Checklist

- [ ] Set `DEBUG=False` in `.env`
- [ ] Set a strong random `SECRET_KEY`
- [ ] Set `ALLOWED_HOSTS` to your domain
- [ ] Switch database to PostgreSQL (`DATABASE_URL`)
- [ ] Configure real SMTP credentials
- [ ] Set `CORS_ALLOW_ALL_ORIGINS=False` and list specific origins in `CORS_ALLOWED_ORIGINS`
- [ ] Run `python manage.py collectstatic`
- [ ] Serve Django via **Gunicorn** behind **Nginx**
- [ ] Serve React via **Nginx** static files (run `npm run build`)
- [ ] Enable HTTPS (Let's Encrypt / AWS ACM)
- [ ] Use **environment variables** (not `.env` files) in production containers

See [Deployment.md](./Deployment.md) for full step-by-step instructions.
