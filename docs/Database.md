# MediConnect — Database Schema

## Engine

| Environment | Database | Notes |
|---|---|---|
| Development | **SQLite 3** | Zero-config, file-based (`backend/db.sqlite3`) |
| Production | **PostgreSQL 15+** | Recommended; update `DATABASES` in settings |

---

## Entity Relationship Overview

```
User ──────────────┬──── DoctorProfile ──── Specialization
                   │         │
                   │         ├──── Availability (weekly slots)
                   │
                   └──── PatientProfile
                              │
                              └──── MedicalRecord

Appointment ──── User (patient FK)
            └─── DoctorProfile (doctor FK)
                      │
                      └──── Payment ──── PaymentReceipt

Review ──── User (patient FK)
       └─── DoctorProfile (doctor FK)

Notification ──── User (FK)
```

---

## Table Reference

### `users_user`
Custom user model extending Django's `AbstractUser`. Uses **email as the primary login field**.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | Auto-generated |
| `email` | VARCHAR(254) | UNIQUE, NOT NULL | Primary login identifier |
| `username` | VARCHAR(150) | UNIQUE | Set to email value by `UserManager` |
| `first_name` | VARCHAR(150) | NOT NULL | |
| `last_name` | VARCHAR(150) | NOT NULL | |
| `role` | VARCHAR(20) | CHOICES | `PATIENT` \| `DOCTOR` \| `ADMIN` |
| `is_email_verified` | BOOLEAN | DEFAULT False | Set True after email verification |
| `phone` | VARCHAR(20) | NULLABLE | Optional |
| `gender` | VARCHAR(20) | NULLABLE | `MALE` \| `FEMALE` \| `OTHER` |
| `date_of_birth` | DATE | NULLABLE | |
| `blood_group` | VARCHAR(10) | NULLABLE | e.g. `A+`, `O-` |
| `google_id` | VARCHAR(255) | NULLABLE | Google OAuth `sub` claim |
| `avatar` | ImageField | NULLABLE | Stored in `media/avatars/` |
| `created_at` | DATETIME | AUTO | |
| `updated_at` | DATETIME | AUTO | |

---

### `users_emailverificationtoken`

| Column | Type | Notes |
|---|---|---|
| `id` | INT | PK |
| `user_id` | UUID FK | → `users_user` |
| `token` | UUID | Unique one-time-use token |
| `is_used` | BOOLEAN | Marked True after use |
| `created_at` | DATETIME | |

---

### `users_passwordresettoken`

| Column | Type | Notes |
|---|---|---|
| `id` | INT | PK |
| `user_id` | UUID FK | → `users_user` |
| `token` | UUID | Unique one-time-use token |
| `is_used` | BOOLEAN | |
| `created_at` | DATETIME | |

---

### `doctors_specialization`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `name` | VARCHAR(100) | UNIQUE |
| `description` | TEXT | NULLABLE |
| `icon` | VARCHAR(50) | Emoji or icon name |
| `created_at` | DATETIME | |

---

### `doctors_doctorprofile`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID FK | ONE-TO-ONE → `users_user` |
| `specialization_id` | UUID FK | → `doctors_specialization` |
| `medical_registration_number` | VARCHAR(100) | NULLABLE |
| `experience_years` | INT | DEFAULT 0 |
| `consultation_fee` | DECIMAL(8,2) | DEFAULT 0 |
| `online_consultation_fee` | DECIMAL(8,2) | DEFAULT 0 |
| `bio` | TEXT | NULLABLE |
| `clinic_name` | VARCHAR(200) | NULLABLE |
| `clinic_address` | TEXT | NULLABLE |
| `gender` | VARCHAR(20) | NULLABLE |
| `languages` | TEXT | NULLABLE |
| `rating_avg` | DECIMAL(3,2) | DEFAULT 0 — computed on review save |
| `total_reviews` | INT | DEFAULT 0 |
| `is_verified` | BOOLEAN | DEFAULT False |
| `is_available` | BOOLEAN | DEFAULT True |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

---

### `doctors_availability`

Weekly recurring schedule for each doctor.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `doctor_id` | UUID FK | → `doctors_doctorprofile` |
| `day_of_week` | INT | 0=Monday … 6=Sunday |
| `start_time` | TIME | |
| `end_time` | TIME | |
| `slot_duration_minutes` | INT | DEFAULT 30 |
| `is_active` | BOOLEAN | DEFAULT True |
| `created_at` | DATETIME | |

---

### `patients_patientprofile`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID FK | ONE-TO-ONE → `users_user` |
| `emergency_contact_name` | VARCHAR(100) | NULLABLE |
| `emergency_contact_phone` | VARCHAR(20) | NULLABLE |
| `allergies` | TEXT | NULLABLE |
| `chronic_conditions` | TEXT | NULLABLE |
| `created_at` | DATETIME | |

---

### `appointments_appointment`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `patient_id` | UUID FK | → `users_user` |
| `doctor_id` | UUID FK | → `doctors_doctorprofile` |
| `appointment_date` | DATE | |
| `start_time` | TIME | |
| `end_time` | TIME | |
| `status` | VARCHAR(20) | `PENDING` → `CONFIRMED` → `COMPLETED` \| `CANCELLED` |
| `appointment_type` | VARCHAR(20) | `IN_PERSON` \| `ONLINE` |
| `reason` | TEXT | NULLABLE |
| `notes` | TEXT | NULLABLE |
| `fee_charged` | DECIMAL(8,2) | Snapshot of fee at time of booking |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

---

### `payments_payment`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `appointment_id` | UUID FK | ONE-TO-ONE → `appointments_appointment` |
| `patient_id` | UUID FK | → `users_user` |
| `gateway` | VARCHAR(20) | `RAZORPAY` \| `STRIPE` |
| `amount` | DECIMAL(10,2) | Amount in INR/USD |
| `currency` | VARCHAR(5) | DEFAULT `INR` |
| `status` | VARCHAR(20) | `PENDING` → `SUCCESS` \| `FAILED` \| `REFUNDED` |
| `gateway_order_id` | VARCHAR(200) | NULLABLE — Razorpay/Stripe order ID |
| `gateway_payment_id` | VARCHAR(200) | NULLABLE — Razorpay payment_id |
| `gateway_signature` | TEXT | NULLABLE — Razorpay signature |
| `transaction_id` | UUID | UNIQUE — internal reference number |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

---

### `payments_paymentreceipt`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `payment_id` | UUID FK | ONE-TO-ONE → `payments_payment` |
| `receipt_number` | VARCHAR(50) | UNIQUE — e.g. `MCR-20260729-0001` |
| `doctor_name` | VARCHAR(200) | Snapshot |
| `patient_name` | VARCHAR(200) | Snapshot |
| `appointment_date` | DATE | Snapshot |
| `fee_paid` | DECIMAL(10,2) | Snapshot |
| `issued_at` | DATETIME | |

---

### `reviews_review`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `patient_id` | UUID FK | → `users_user` |
| `doctor_id` | UUID FK | → `doctors_doctorprofile` |
| `appointment_id` | UUID FK | UNIQUE → must be a COMPLETED appointment |
| `rating` | INT | 1–5 |
| `comment` | TEXT | NULLABLE |
| `created_at` | DATETIME | |

> **Note**: On every `Review.save()`, the doctor's `rating_avg` and `total_reviews` are recalculated automatically via a Django `post_save` signal.

---

### `notifications_notification`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID FK | → `users_user` |
| `title` | VARCHAR(200) | |
| `message` | TEXT | |
| `is_read` | BOOLEAN | DEFAULT False |
| `created_at` | DATETIME | |

---

## Switching to PostgreSQL

1. Install driver: `pip install psycopg2-binary`
2. Add to `backend/.env`:
   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/mediconnect_db
   ```
3. Update `settings.py`:
   ```python
   import dj_database_url
   DATABASES = {'default': dj_database_url.config(conn_max_age=600)}
   ```
4. Run `python manage.py migrate`
