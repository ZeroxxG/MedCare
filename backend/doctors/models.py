import uuid
from django.db import models
from django.conf import settings

class Specialization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    icon_name = models.CharField(max_length=50, default='Stethoscope')
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class DoctorProfile(models.Model):
    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Verification'
        VERIFIED = 'VERIFIED', 'Verified'
        REJECTED = 'REJECTED', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_profile')
    medical_registration_number = models.CharField(max_length=100, unique=True, null=True, blank=True)
    specialization = models.ForeignKey(Specialization, on_delete=models.SET_NULL, null=True, blank=True, related_name='doctors')
    secondary_specialization = models.ForeignKey(Specialization, on_delete=models.SET_NULL, null=True, blank=True, related_name='secondary_doctors')
    qualification = models.CharField(max_length=255, blank=True, default="MBBS")
    experience_years = models.PositiveIntegerField(default=0)
    gender = models.CharField(max_length=20, blank=True, null=True, choices=[('MALE', 'Male'), ('FEMALE', 'Female'), ('OTHER', 'Other')])
    profile_photo = models.ImageField(upload_to='doctor_photos/', blank=True, null=True)
    hospital_name = models.CharField(max_length=255, blank=True, default="MediConnect Central Clinic")
    clinic_address = models.TextField(blank=True, default="123 Health Ave, Medical District")
    city = models.CharField(max_length=100, blank=True, default="Mumbai")
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    online_consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=400.00)
    consultation_duration_minutes = models.PositiveIntegerField(default=30)
    bio = models.TextField(blank=True, default="Experienced healthcare professional dedicated to patient care.")
    languages_spoken = models.CharField(max_length=255, blank=True, default="English, Hindi")
    services_offered = models.TextField(blank=True, default="General Consultation, Health Checkup, Follow-up")
    awards_certifications = models.TextField(blank=True, default="")
    education_history = models.JSONField(blank=True, default=list)
    professional_experience = models.JSONField(blank=True, default=list)
    social_links = models.JSONField(blank=True, default=dict)
    medical_license = models.FileField(upload_to='doctor_licenses/', blank=True, null=True)
    degree_certificates = models.FileField(upload_to='doctor_certificates/', blank=True, null=True)
    verification_status = models.CharField(max_length=20, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)
    rating_avg = models.FloatField(default=0.0)
    reviews_count = models.PositiveIntegerField(default=0)
    is_available_for_booking = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def update_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            self.rating_avg = round(sum(r.rating for r in reviews) / len(reviews), 2)
            self.reviews_count = len(reviews)
        else:
            self.rating_avg = 0.0
            self.reviews_count = 0
        self.save()

    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.specialization.name if self.specialization else 'General'}"


class Availability(models.Model):
    class DayOfWeek(models.IntegerChoices):
        MONDAY = 0, 'Monday'
        TUESDAY = 1, 'Tuesday'
        WEDNESDAY = 2, 'Wednesday'
        THURSDAY = 3, 'Thursday'
        FRIDAY = 4, 'Friday'
        SATURDAY = 5, 'Saturday'
        SUNDAY = 6, 'Sunday'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.IntegerField(choices=DayOfWeek.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_duration_minutes = models.IntegerField(default=30)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Availabilities"
        unique_together = ('doctor', 'day_of_week', 'start_time')

    def __str__(self):
        return f"{self.doctor.user.get_full_name()} - {self.get_day_of_week_display()} ({self.start_time}-{self.end_time})"


class TimeSlot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='time_slots')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)

    class Meta:
        ordering = ['date', 'start_time']
        unique_together = ('doctor', 'date', 'start_time')

    def __str__(self):
        return f"{self.doctor.user.get_full_name()} - {self.date} {self.start_time} - {'Booked' if self.is_booked else 'Available'}"
