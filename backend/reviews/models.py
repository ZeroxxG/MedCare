import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from appointments.models import Appointment
from doctors.models import DoctorProfile
from patients.models import PatientProfile

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='review')
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='reviews')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.doctor.update_rating()

    def delete(self, *args, **kwargs):
        doctor = self.doctor
        super().delete(*args, **kwargs)
        doctor.update_rating()

    def __str__(self):
        return f"Review ({self.rating}/5) for Dr. {self.doctor.user.get_full_name()} by {self.patient.user.get_full_name()}"
