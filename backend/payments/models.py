import uuid
from django.db import models
from appointments.models import Appointment

class Payment(models.Model):
    class Gateway(models.TextChoices):
        STRIPE = 'STRIPE', 'Stripe'
        RAZORPAY = 'RAZORPAY', 'Razorpay'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SUCCESS = 'SUCCESS', 'Success'
        FAILED = 'FAILED', 'Failed'
        REFUNDED = 'REFUNDED', 'Refunded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='payment')
    transaction_id = models.CharField(max_length=255, unique=True)
    receipt_number = models.CharField(max_length=50, unique=True, editable=False)
    gateway = models.CharField(max_length=20, choices=Gateway.choices, default=Gateway.RAZORPAY)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            self.receipt_number = f"RCP-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payment {self.receipt_number} - {self.amount} {self.currency} ({self.status})"
