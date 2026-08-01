from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

def send_appointment_emails(appointment, payment_status="PENDING"):
    """
    Sends reusable HTML/Text email notifications to Patient and Doctor after appointment booking or status updates.
    """
    patient_email = appointment.patient.user.email
    doctor_email = appointment.doctor.user.email

    patient_name = appointment.patient.user.get_full_name() or "Valued Patient"
    doctor_name = f"Dr. {appointment.doctor.user.get_full_name()}"
    clinic_name = appointment.doctor.hospital_name
    clinic_address = appointment.doctor.clinic_address
    date_str = str(appointment.appointment_date)
    time_str = str(appointment.appointment_time)
    booking_id = appointment.booking_id

    # 1. Email to Patient
    patient_subject = f"Appointment Confirmation - Booking #{booking_id}"
    patient_body = f"""
Dear {patient_name},

Your healthcare appointment has been successfully placed on MediConnect.

--- APPOINTMENT DETAILS ---
Booking ID: {booking_id}
Doctor: {doctor_name} ({appointment.doctor.specialization.name if appointment.doctor.specialization else 'General'})
Clinic/Hospital: {clinic_name}
Address: {clinic_address}
Date: {date_str}
Time: {time_str}
Payment Status: {payment_status}
Fee: ₹{appointment.doctor.consultation_fee}

Thank you for choosing MediConnect!
    """

    # 2. Email to Doctor
    doctor_subject = f"New Patient Booking Alert - Booking #{booking_id}"
    doctor_body = f"""
Dear {doctor_name},

You have a new appointment booking on MediConnect.

--- APPOINTMENT DETAILS ---
Booking ID: {booking_id}
Patient Name: {patient_name}
Patient Contact Email: {patient_email}
Reason for Visit: {appointment.reason_for_visit}
Date: {date_str}
Time: {time_str}
Payment Status: {payment_status}

Please log in to your MediConnect Doctor Dashboard to manage this appointment.
    """

    print(f"[EMAIL SERVICE] Sending appointment confirmation email to {patient_email} & {doctor_email} for Booking #{booking_id}")

    try:
        send_mail(
            subject=patient_subject,
            message=patient_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[patient_email],
            fail_silently=True
        )

        send_mail(
            subject=doctor_subject,
            message=doctor_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[doctor_email],
            fail_silently=True
        )
    except Exception as e:
        print(f"[EMAIL SERVICE ERROR] {e}")

    # Create in-app Notifications so users can view emails directly in dashboard
    try:
        from notifications.models import Notification
        Notification.objects.create(
            user=appointment.patient.user,
            title=patient_subject,
            message=patient_body
        )
        Notification.objects.create(
            user=appointment.doctor.user,
            title=doctor_subject,
            message=doctor_body
        )
    except Exception as e:
        print(f"[NOTIFICATION ERROR] {e}")
