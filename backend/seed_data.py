import os
import sys
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediconnect_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from doctors.models import Specialization, DoctorProfile, Availability, TimeSlot
from patients.models import PatientProfile
from appointments.models import Appointment
from payments.models import Payment
from reviews.models import Review

User = get_user_model()

def seed_database():
    print("[+] Seeding MediConnect Healthcare Database...")

    # 1. Specializations
    specs_data = [
        {"name": "Cardiology", "icon_name": "Heart", "description": "Heart & Vascular Healthcare"},
        {"name": "Dermatology", "icon_name": "Sparkles", "description": "Skin, Hair & Nail Treatments"},
        {"name": "Pediatrics", "icon_name": "Baby", "description": "Child Healthcare & Wellness"},
        {"name": "Neurology", "icon_name": "Brain", "description": "Brain, Nerve & Spinal Care"},
        {"name": "Orthopedics", "icon_name": "Bone", "description": "Bone, Joint & Musculoskeletal Care"},
        {"name": "General Physician", "icon_name": "Stethoscope", "description": "Primary Healthcare & Routine Consultations"},
    ]

    specs = {}
    for s_data in specs_data:
        spec, _ = Specialization.objects.get_or_create(name=s_data["name"], defaults=s_data)
        specs[s_data["name"]] = spec
    print("OK: Created 6 Specializations")

    # 2. Doctors
    doctors_seed = [
        {
            "email": "dr.sarah.jenkins@mediconnect.com",
            "first_name": "Sarah",
            "last_name": "Jenkins",
            "spec": "Cardiology",
            "qualification": "MD, FACC - Harvard Medical School",
            "experience": 14,
            "hospital": "Apollo Heart Institute",
            "city": "Mumbai",
            "fee": 1500.00,
            "bio": "Board-certified cardiologist specializing in preventive cardiology, hypertension, and heart failure management with over 14 years of clinical excellence."
        },
        {
            "email": "dr.marcus.vance@mediconnect.com",
            "first_name": "Marcus",
            "last_name": "Vance",
            "spec": "Dermatology",
            "qualification": "MBBS, MD (Dermatology) - Johns Hopkins",
            "experience": 10,
            "hospital": "Max Skin & Laser Clinic",
            "city": "Delhi",
            "fee": 1200.00,
            "bio": "Leading expert in cosmetic and clinical dermatology, specializing in acne, laser surgery, and anti-aging treatments."
        },
        {
            "email": "dr.elena.rostova@mediconnect.com",
            "first_name": "Elena",
            "last_name": "Rostova",
            "spec": "Pediatrics",
            "qualification": "MD (Pediatrics) - Stanford Medicine",
            "experience": 8,
            "hospital": "Fortis Children Hospital",
            "city": "Bangalore",
            "fee": 800.00,
            "bio": "Compassionate pediatrician devoted to child growth development, immunizations, and pediatric wellness care."
        },
        {
            "email": "dr.james.wilson@mediconnect.com",
            "first_name": "James",
            "last_name": "Wilson",
            "spec": "General Physician",
            "qualification": "MBBS, FACP",
            "experience": 18,
            "hospital": "Manipal Healthcare",
            "city": "Hyderabad",
            "fee": 500.00,
            "bio": "Senior general physician with 18+ years of expertise in chronic disease management and preventive family health."
        },
    ]

    doctor_profiles = []
    for d_data in doctors_seed:
        user = User.objects.filter(email=d_data["email"]).first()
        if not user:
            user = User.objects.create_user(
                email=d_data["email"],
                password="doctor123",
                first_name=d_data["first_name"],
                last_name=d_data["last_name"],
                role=User.Role.DOCTOR,
                is_email_verified=True
            )

        profile, p_created = DoctorProfile.objects.get_or_create(
            user=user,
            defaults={
                "specialization": specs[d_data["spec"]],
                "qualification": d_data["qualification"],
                "experience_years": d_data["experience"],
                "hospital_name": d_data["hospital"],
                "city": d_data["city"],
                "consultation_fee": d_data["fee"],
                "bio": d_data["bio"]
            }
        )
        doctor_profiles.append(profile)
    print("OK: Created 4 Doctor accounts & profiles")

    # 3. Patient
    patient_user = User.objects.filter(email="john.doe@gmail.com").first()
    if not patient_user:
        patient_user = User.objects.create_user(
            email="john.doe@gmail.com",
            password="patient123",
            first_name="John",
            last_name="Doe",
            role=User.Role.PATIENT,
            is_email_verified=True,
            phone="+1 555-0199"
        )

    patient_profile, _ = PatientProfile.objects.get_or_create(
        user=patient_user,
        defaults={
            "gender": PatientProfile.GenderChoices.MALE,
            "blood_group": PatientProfile.BloodGroupChoices.O_POSITIVE,
            "emergency_contact": "+1 555-0900",
            "medical_history": "Mild seasonal allergies. No surgical history."
        }
    )
    print("OK: Created Demo Patient (john.doe@gmail.com / patient123)")

    # 4. Generate Time Slots & Sample Appointment
    today = datetime.now().date()
    for doc_profile in doctor_profiles:
        for day_offset in range(1, 5):
            slot_date = today + timedelta(days=day_offset)
            times = [("09:00:00", "09:30:00"), ("10:00:00", "10:30:00"), ("11:00:00", "11:30:00"), ("14:00:00", "14:30:00"), ("15:00:00", "15:30:00")]
            for st, et in times:
                TimeSlot.objects.get_or_create(
                    doctor=doc_profile,
                    date=slot_date,
                    start_time=datetime.strptime(st, "%H:%M:%S").time(),
                    end_time=datetime.strptime(et, "%H:%M:%S").time()
                )

    print("OK: Created Future Time Slots for Doctors")

    # 5. Book a completed appointment with review
    sample_slot = TimeSlot.objects.filter(doctor=doctor_profiles[0], is_booked=False).first()
    if sample_slot:
        sample_slot.is_booked = True
        sample_slot.save()

        appointment, _ = Appointment.objects.get_or_create(
            patient=patient_profile,
            doctor=doctor_profiles[0],
            time_slot=sample_slot,
            defaults={
                "appointment_date": sample_slot.date,
                "appointment_time": sample_slot.start_time,
                "status": Appointment.Status.COMPLETED,
                "reason_for_visit": "Routine annual cardiovascular checkup.",
                "doctor_notes": "Patient BP is 120/80. Normal ECG. Continue current lifestyle regimen."
            }
        )

        import uuid
        Payment.objects.get_or_create(
            appointment=appointment,
            defaults={
                "transaction_id": f"pi_stripe_demo_seed_{uuid.uuid4().hex[:6]}",
                "gateway": Payment.Gateway.STRIPE,
                "amount": doctor_profiles[0].consultation_fee,
                "currency": "INR",
                "status": Payment.Status.SUCCESS
            }
        )

        Review.objects.get_or_create(
            appointment=appointment,
            patient=patient_profile,
            doctor=doctor_profiles[0],
            defaults={
                "rating": 5,
                "comment": "Dr. Sarah Jenkins was extremely attentive and thorough. Explained everything clearly!"
            }
        )
        print("OK: Created Completed Appointment, Stripe Payment record, and 5-Star Doctor Review")

    print("\nSUCCESS: Database Seeding Complete!")
    print("--------------------------------------------------")
    print("Demo Patient Login: john.doe@gmail.com / patient123")
    print("Demo Doctor Login:  dr.sarah.jenkins@mediconnect.com / doctor123")
    print("--------------------------------------------------")

if __name__ == '__main__':
    seed_database()
