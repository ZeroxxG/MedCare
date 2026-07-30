from rest_framework import serializers
from patients.serializers import PatientProfileSerializer
from .models import Review
from appointments.models import Appointment

class ReviewSerializer(serializers.ModelSerializer):
    patient = PatientProfileSerializer(read_only=True)
    appointment_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Review
        fields = ['id', 'appointment_id', 'patient', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'patient', 'created_at']

    def create(self, validated_data):
        appointment_id = validated_data.pop('appointment_id')
        try:
            appointment = Appointment.objects.get(id=appointment_id, patient__user=self.context['request'].user)
        except Appointment.DoesNotExist:
            raise serializers.ValidationError({"appointment_id": "Completed appointment not found for this user."})

        if hasattr(appointment, 'review'):
            raise serializers.ValidationError({"appointment_id": "A review has already been submitted for this appointment."})

        patient_profile = self.context['request'].user.patient_profile
        review = Review.objects.create(
            appointment=appointment,
            patient=patient_profile,
            doctor=appointment.doctor,
            **validated_data
        )
        return review
