# 🏥 MediConnect — Healthcare Appointment Booking Platform

> A production-ready, full-stack healthcare appointment booking platform built with **React 18 + Vite** on the frontend and **Django 5 + Django REST Framework** on the backend. Inspired by platforms like Practo.

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.x-092E20?style=flat&logo=django&logoColor=white)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## ✨ Features

| Category | Features |
|---|---|
| 🔐 **Authentication** | Email/Password login, Google OAuth 2.0 (GSI), JWT with refresh rotation, Email verification, Password reset via email |
| 🩺 **Doctor Portal** | Profile management, specialization, clinic details, availability scheduling, appointment management, earnings overview |
| 🧑‍💼 **Patient Portal** | Doctor search & filter, real-time slot booking, appointment history, digital receipts, doctor ratings |
| 📅 **Appointments** | Status workflow (Pending → Confirmed → Completed / Cancelled), doctor approval system, 30-minute time slots |
| 💳 **Payments** | Razorpay (primary), Stripe (secondary), pluggable Strategy pattern, payment verification, digital PDF receipts |
| 📧 **Emails** | Registration confirmation, appointment booking alerts, password reset links via Gmail SMTP |
| ⭐ **Reviews** | Verified patient ratings (only after completed appointments), automatic rating average recalculation |
| 📚 **API Docs** | OpenAPI 3 schema via `drf-spectacular`, live Swagger UI at `/api/docs/` |
| 🌓 **UI** | Dark/Light mode, Glassmorphism design, Tailwind CSS, fully responsive |

---

## 🏗️ Architecture

```
frontend/  (React 18 + Vite + Tailwind)
    └── Axios → JWT interceptors → REST API

backend/   (Django 5 + DRF + SimpleJWT)
    ├── users/          # Auth: registration, login, OAuth, password reset
    ├── doctors/        # Doctor profiles, specializations, availability slots
    ├── patients/       # Patient profiles
    ├── appointments/   # Booking engine, status state machine
    ├── payments/       # Razorpay + Stripe via Strategy pattern
    ├── reviews/        # Patient ratings & review system
    └── notifications/  # In-app notification model
```

See [`docs/Architecture.md`](docs/Architecture.md) for the full system diagram and design patterns.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+, Node.js 18+, Git

### 1. Clone the repository
```bash
git clone https://github.com/your-username/mediconnect.git
cd mediconnect
```

### 2. Backend Setup
```bash
cd backend

# Set up environment
cp .env.example .env
# Edit .env and fill in: SECRET_KEY, email credentials, Razorpay/Google keys

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# (Optional) Seed demo data — doctors, specializations, patients
python seed_data.py

# Start the API server
python manage.py runserver
```
→ API running at **http://127.0.0.1:8000/**  
→ Swagger docs at **http://127.0.0.1:8000/api/docs/**

### 3. Frontend Setup
```bash
cd frontend

# Set up environment
cp .env.example .env
# Edit .env — set VITE_GOOGLE_CLIENT_ID, VITE_RAZORPAY_KEY_ID

npm install
npm run dev
```
→ App running at **http://localhost:5173/**

---

## ⚙️ Environment Variables

All secrets are environment-variable driven. **No credentials are hardcoded in source code.**

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | Django secret key — **app will not start without it** |
| `DEBUG` | | `True` (dev) or `False` (production) |
| `ALLOWED_HOSTS` | | Comma-separated hostnames |
| `EMAIL_HOST_USER` | | Gmail address for SMTP |
| `EMAIL_HOST_PASSWORD` | | Gmail App Password (not your login password) |
| `RAZORPAY_KEY_ID` | | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | | Razorpay secret key |
| `GOOGLE_CLIENT_ID` | | Google OAuth 2.0 Client ID |

Copy `backend/.env.example` → `backend/.env` and fill in your values.

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID (same as backend) |
| `VITE_RAZORPAY_KEY_ID` | Razorpay **public** key only |
| `VITE_API_URL` | Backend base URL |

Copy `frontend/.env.example` → `frontend/.env`.

---

## 📁 Project Structure

```
mediconnect/
├── .gitignore
├── README.md
├── docs/
│   ├── Architecture.md      # System design, tech stack, patterns
│   ├── Authentication.md    # JWT, Google OAuth, password reset flows
│   ├── Database.md          # Schema reference for all tables
│   └── Deployment.md        # Local, VPS/Nginx, Docker deployment
├── backend/
│   ├── .env.example         # ← Copy to .env (fill in secrets)
│   ├── requirements.txt
│   ├── manage.py
│   ├── seed_data.py
│   ├── mediconnect_backend/ # Django project config
│   ├── users/
│   ├── doctors/
│   ├── patients/
│   ├── appointments/
│   ├── payments/
│   ├── reviews/
│   └── notifications/
└── frontend/
    ├── .env.example         # ← Copy to .env (fill in secrets)
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        └── services/
```

---

## 🔑 API Reference

Full OpenAPI 3 documentation is available live at `http://localhost:8000/api/docs/` when the backend is running.

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Public | Register patient or doctor |
| `POST` | `/api/auth/login/` | Public | Email/password login |
| `POST` | `/api/auth/refresh/` | Public | Refresh JWT access token |
| `POST` | `/api/auth/google/` | Public | Google OAuth login |
| `POST` | `/api/auth/forgot-password/` | Public | Send password reset email |
| `POST` | `/api/auth/reset-password/` | Public | Submit new password |
| `GET/PATCH` | `/api/auth/me/` | 🔒 Required | Get / update own profile |

### Key Domain Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/doctors/list/` | Search & filter doctors |
| `GET` | `/api/doctors/list/{id}/` | Doctor public profile |
| `GET` | `/api/doctors/{id}/slots/` | Available time slots for date |
| `POST` | `/api/appointments/` | Book an appointment |
| `POST` | `/api/payments/initiate/` | Create payment order (Razorpay) |
| `POST` | `/api/payments/verify/` | Verify payment signature |
| `GET` | `/api/payments/receipt/{id}/` | Download digital receipt |
| `POST` | `/api/reviews/` | Submit a review |

---

## 🔒 Security

- **No hardcoded secrets** — all API keys live in `.env` files, excluded by `.gitignore`
- **`SECRET_KEY` is required** — Django raises `ValueError` at startup if not set
- **JWT rotation** — refresh tokens are blacklisted after each rotation
- **Single-use tokens** — password reset and email verification tokens are invalidated after first use
- **No email enumeration** — password reset returns `200 OK` regardless of whether the email exists
- **Google OAuth** — token verified server-side via Google's `tokeninfo` API; fake tokens are rejected with `400`

---

## 🌐 Google OAuth Setup

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create a new **OAuth 2.0 Client ID** (Web Application)
3. Add **Authorized JavaScript Origins**:
   - `http://localhost:5173` (local dev)
   - `https://yourdomain.com` (production)
4. Copy the Client ID into both `.env` files

---

## 💳 Razorpay Setup

1. Create an account at [razorpay.com](https://razorpay.com)
2. Go to **Settings → API Keys** → Generate Test API Key
3. Add to `backend/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_XXXX
   RAZORPAY_KEY_SECRET=XXXX
   ```
4. Add **public key only** to `frontend/.env`:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_XXXX
   ```

---

## 📧 Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate an App Password for "Mail"
4. Add to `backend/.env`:
   ```env
   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=xxxx xxxx xxxx xxxx    # 16-char app password
   ```

> Without email credentials, emails are printed to the Django console (safe for local dev).

---

## 🚢 Deployment

See [`docs/Deployment.md`](docs/Deployment.md) for full guides covering:
- **Local development** setup
- **VPS + Nginx + Gunicorn** (Ubuntu production)
- **Docker + docker-compose**
- **Full environment variable reference**
- **Post-deployment checklist**

---

## 📖 Documentation

| File | Contents |
|---|---|
| [`docs/Architecture.md`](docs/Architecture.md) | System design, tech stack, data flow diagrams |
| [`docs/Authentication.md`](docs/Authentication.md) | JWT, Google OAuth, password flows, API examples |
| [`docs/Database.md`](docs/Database.md) | Full schema reference for every table |
| [`docs/Deployment.md`](docs/Deployment.md) | Local, VPS, Docker deployment instructions |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Axios, Lucide Icons |
| Backend | Django 5, Django REST Framework, Python 3.11+ |
| Authentication | SimpleJWT, Google Identity Services (GSI) |
| Database | SQLite (dev) / PostgreSQL (production) |
| Payments | Razorpay, Stripe (pluggable Strategy pattern) |
| Email | Django email + Gmail SMTP |
| API Docs | drf-spectacular (OpenAPI 3 / Swagger UI) |
| Filtering | django-filter |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ for modern healthcare</p>
