# MediConnect Healthcare Platform - Entity Relationship (ER) Diagram

The following Mermaid ER Diagram illustrates the database structure, normalized models, and foreign key relationships across all modules of MediConnect.

```mermaid
erDiagram
    USER ||--o| DOCTOR_PROFILE : "has profile (if DOCTOR)"
    USER ||--o| PATIENT_PROFILE : "has profile (if PATIENT)"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ EMAIL_VERIFICATION_TOKEN : "owns"
    USER ||--o{ PASSWORD_RESET_TOKEN : "owns"

    SPECIALIZATION ||--o{ DOCTOR_PROFILE : "categorizes"
    DOCTOR_PROFILE ||--o{ AVAILABILITY : "defines recurring hours"
    DOCTOR_PROFILE ||--o{ TIME_SLOT : "generates slots"
    DOCTOR_PROFILE ||--o{ APPOINTMENT : "consults"
    DOCTOR_PROFILE ||--o{ REVIEW : "receives reviews"

    PATIENT_PROFILE ||--o{ APPOINTMENT : "books"
    PATIENT_PROFILE ||--o{ REVIEW : "authors"

    TIME_SLOT ||--o| APPOINTMENT : "reserved for"
    APPOINTMENT ||--o| PAYMENT : "billed via"
    APPOINTMENT ||--o| REVIEW : "rated via"

    USER {
        uuid id PK
        string email UK
        string password
        string first_name
        string last_name
        string role "PATIENT | DOCTOR | ADMIN"
        boolean is_email_verified
        string phone
        string google_id
        datetime created_at
    }

    DOCTOR_PROFILE {
        uuid id PK
        uuid user_id FK
        uuid specialization_id FK
        string qualification
        integer experience_years
        string hospital_name
        string clinic_address
        string city
        decimal consultation_fee
        float rating_avg
        integer reviews_count
        boolean is_available_for_booking
    }

    PATIENT_PROFILE {
        uuid id PK
        uuid user_id FK
        date date_of_birth
        string gender
        string blood_group
        string emergency_contact
        text medical_history
    }

    SPECIALIZATION {
        uuid id PK
        string name UK
        string icon_name
        text description
    }

    AVAILABILITY {
        uuid id PK
        uuid doctor_id FK
        integer day_of_week
        time start_time
        time end_time
        integer slot_duration_minutes
    }

    TIME_SLOT {
        uuid id PK
        uuid doctor_id FK
        date date
        time start_time
        time end_time
        boolean is_booked
    }

    APPOINTMENT {
        uuid id PK
        string booking_id UK
        uuid patient_id FK
        uuid doctor_id FK
        uuid time_slot_id FK
        date appointment_date
        time appointment_time
        string status "PENDING | APPROVED | REJECTED | COMPLETED | CANCELLED"
        text reason_for_visit
        text doctor_notes
    }

    PAYMENT {
        uuid id PK
        uuid appointment_id FK
        string transaction_id UK
        string receipt_number UK
        string gateway "STRIPE | RAZORPAY"
        decimal amount
        string currency
        string status "PENDING | SUCCESS | FAILED | REFUNDED"
    }

    REVIEW {
        uuid id PK
        uuid appointment_id FK
        uuid patient_id FK
        uuid doctor_id FK
        integer rating "1 to 5"
        text comment
        datetime created_at
    }

    NOTIFICATION {
        uuid id PK
        uuid user_id FK
        string title
        text message
        boolean is_read
        datetime created_at
    }
```
