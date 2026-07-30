# MediConnect REST API Reference

Comprehensive guide to MediConnect API endpoints. Interactive Swagger documentation is served at `/api/docs/` when the backend is running.

---

## Authentication Endpoints (`/api/auth/`)

### 1. Register User
- **POST** `/api/auth/register/`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123",
    "password_confirm": "Password123",
    "first_name": "Jane",
    "last_name": "Doe",
    "role": "PATIENT", // or "DOCTOR"
    "phone": "+15550199"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "message": "Registration successful. Verification email sent.",
    "user": { "id": "...", "email": "user@example.com", "role": "PATIENT" },
    "tokens": { "access": "eyJ...", "refresh": "eyJ..." }
  }
  ```

### 2. Login (JWT Obtain Pair)
- **POST** `/api/auth/login/`
- **Body**: `{ "email": "user@example.com", "password": "Password123" }`
- **Response** (`200 OK`): `{ "access": "...", "refresh": "...", "user": { ... } }`

### 3. Refresh Access Token
- **POST** `/api/auth/refresh/`
- **Body**: `{ "refresh": "eyJ..." }`

---

## Doctors Endpoints (`/api/doctors/`)

### 1. List & Search Doctors
- **GET** `/api/doctors/list/?search=Cardiology&city=New+York&ordering=-rating_avg`
- **Response**: Paginated list of Doctor Profiles with rating and fee metadata.

### 2. Get Available Time Slots
- **GET** `/api/doctors/{doctor_id}/slots/?date=YYYY-MM-DD`
- **Response**: Array of available 30-minute consultation slots.

---

## Appointments Endpoints (`/api/appointments/`)

### 1. Book Appointment
- **POST** `/api/appointments/`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "doctor_id": "uuid-here",
    "time_slot_id": "uuid-here",
    "reason_for_visit": "Annual checkup"
  }
  ```

### 2. Doctor Approve / Reject / Complete
- **POST** `/api/appointments/{id}/approve/`
- **POST** `/api/appointments/{id}/reject/`
- **POST** `/api/appointments/{id}/complete/` with `{ "doctor_notes": "Prescribed medication..." }`

---

## Payments Endpoints (`/api/payments/`)

### 1. Initiate Gateway Intent (Stripe / Razorpay)
- **POST** `/api/payments/initiate/`
- **Body**: `{ "appointment_id": "uuid", "gateway": "STRIPE" }`

### 2. Verify Payment
- **POST** `/api/payments/verify/`
- **Body**: `{ "appointment_id": "uuid", "transaction_id": "pi_123", "gateway": "STRIPE" }`

### 3. Download Official Receipt
- **GET** `/api/payments/receipt/{appointment_id}/`
