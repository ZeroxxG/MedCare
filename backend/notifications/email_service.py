import threading
from django.core.mail import send_mail
from django.conf import settings


def _send_email_async(subject, message, recipient_list):
    """
    Sends email in a background thread so it NEVER blocks the HTTP request.
    Logs success/failure to stdout (visible in Render logs).
    """
    def _send():
        try:
            result = send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipient_list,
                fail_silently=False
            )
            print(f"[EMAIL OK] Sent '{subject}' to {recipient_list} — result: {result}")
        except Exception as e:
            print(f"[EMAIL FAIL] Could not send '{subject}' to {recipient_list} — {type(e).__name__}: {e}")

    t = threading.Thread(target=_send, daemon=True)
    t.start()


def _save_notification(user, title, message):
    """Save in-app notification — separate try/except so it never affects email."""
    try:
        from notifications.models import Notification
        Notification.objects.create(user=user, title=title, message=message)
    except Exception as e:
        print(f"[NOTIFICATION ERROR] {e}")


def send_appointment_emails(appointment, payment_status="PENDING"):
    """
    Sends confirmation emails to patient and doctor after appointment booking.
    Uses background threading — never blocks or crashes the booking request.
    """
    try:
        patient_email = appointment.patient.user.email
        doctor_email = appointment.doctor.user.email
        patient_name = appointment.patient.user.get_full_name() or "Valued Patient"
        doctor_name = f"Dr. {appointment.doctor.user.get_full_name()}"
        clinic_name = getattr(appointment.doctor, 'hospital_name', 'MediConnect Clinic')
        clinic_address = getattr(appointment.doctor, 'clinic_address', '')
        date_str = str(appointment.appointment_date)
        time_str = str(appointment.appointment_time)
        booking_id = appointment.booking_id
        fee = appointment.doctor.consultation_fee
        spec = appointment.doctor.specialization.name if appointment.doctor.specialization else 'General'
    except Exception as e:
        print(f"[EMAIL SERVICE] Could not read appointment data: {e}")
        return

    # --- Patient email ---
    patient_subject = f"Appointment Confirmation — Booking #{booking_id} | MediConnect"
    patient_body = f"""Dear {patient_name},

Your healthcare appointment has been successfully booked on MediConnect.

══════════════════════════════════
  APPOINTMENT DETAILS
══════════════════════════════════
  Booking ID      : {booking_id}
  Doctor          : {doctor_name} ({spec})
  Clinic/Hospital : {clinic_name}
  Address         : {clinic_address}
  Date            : {date_str}
  Time            : {time_str}
  Consultation Fee: ₹{fee}
  Payment Status  : {payment_status}
══════════════════════════════════

Please arrive 10 minutes before your scheduled time.
You can view and manage your appointments at your MediConnect Patient Dashboard.

Thank you for choosing MediConnect!
The MediConnect Team
"""

    # --- Doctor email ---
    doctor_subject = f"New Patient Booking — Booking #{booking_id} | MediConnect"
    doctor_body = f"""Dear {doctor_name},

You have a new appointment booking on MediConnect.

══════════════════════════════════
  APPOINTMENT DETAILS
══════════════════════════════════
  Booking ID      : {booking_id}
  Patient Name    : {patient_name}
  Patient Email   : {patient_email}
  Reason for Visit: {appointment.reason_for_visit}
  Date            : {date_str}
  Time            : {time_str}
  Payment Status  : {payment_status}
══════════════════════════════════

Please log in to your MediConnect Doctor Dashboard to manage this appointment.

The MediConnect Team
"""

    print(f"[EMAIL SERVICE] Queuing emails for Booking #{booking_id} -> {patient_email}, {doctor_email}")

    # Send in background threads — no blocking
    _send_email_async(patient_subject, patient_body, [patient_email])
    _send_email_async(doctor_subject, doctor_body, [doctor_email])

    # Save in-app notifications
    try:
        _save_notification(appointment.patient.user, patient_subject, patient_body)
        _save_notification(appointment.doctor.user, doctor_subject, doctor_body)
    except Exception as e:
        print(f"[NOTIFICATION ERROR] {e}")


def send_registration_email(user):
    """
    Send welcome + email verification email after registration.
    Runs in background thread.
    """
    try:
        from users.models import EmailVerificationToken
        token_obj = EmailVerificationToken.objects.create(user=user)
        token = str(token_obj.token)

        subject = "Welcome to MediConnect — Verify Your Email"
        body = f"""Dear {user.get_full_name() or user.email},

Welcome to MediConnect — your trusted healthcare appointment platform!

To complete your registration, please verify your email address using the token below:

  Verification Token: {token}

Enter this token on the MediConnect app to activate your account.

If you did not register on MediConnect, please ignore this email.

Thank you,
The MediConnect Team
"""
        _send_email_async(subject, body, [user.email])
        print(f"[EMAIL SERVICE] Verification email queued for {user.email}")
    except Exception as e:
        print(f"[EMAIL SERVICE] Registration email error: {e}")


def send_password_reset_email(user, reset_link):
    """
    Send password reset email. Runs in background thread.
    """
    subject = "Reset Your MediConnect Password"
    body = f"""Dear {user.get_full_name() or 'User'},

We received a request to reset your MediConnect account password.

Click the link below to set a new password:

  {reset_link}

This link will expire in 24 hours.

If you did not request a password reset, please ignore this email — your account is safe.

Thank you,
The MediConnect Team
"""
    _send_email_async(subject, body, [user.email])
    print(f"[EMAIL SERVICE] Password reset email queued for {user.email}")
