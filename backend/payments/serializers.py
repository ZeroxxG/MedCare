from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'appointment', 'transaction_id', 'receipt_number',
            'gateway', 'amount', 'currency', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'receipt_number', 'status', 'created_at']


class InitiatePaymentSerializer(serializers.Serializer):
    appointment_id = serializers.UUIDField(required=True)
    gateway = serializers.ChoiceField(choices=Payment.Gateway.choices, default=Payment.Gateway.RAZORPAY)


class VerifyPaymentSerializer(serializers.Serializer):
    appointment_id = serializers.UUIDField(required=True)
    transaction_id = serializers.CharField(required=True)
    gateway = serializers.ChoiceField(choices=Payment.Gateway.choices, default=Payment.Gateway.RAZORPAY)
    signature_or_token = serializers.CharField(required=False, allow_blank=True)
