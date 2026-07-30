from rest_framework import serializers
from doctors.serializers import DoctorProfileSerializer, TimeSlotSerializer
from patients.serializers import PatientProfileSerializer
from doctors.models import DoctorProfile, TimeSlot
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorProfileSerializer(read_only=True)
    patient = PatientProfileSerializer(read_only=True)
    time_slot = TimeSlotSerializer(read_only=True)
    doctor_id = serializers.UUIDField(write_only=True)
    time_slot_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'booking_id', 'doctor', 'doctor_id', 'patient', 'time_slot',
            'time_slot_id', 'appointment_date', 'appointment_time', 'status',
            'reason_for_visit', 'doctor_notes', 'created_at'
        ]
        read_only_fields = ['id', 'booking_id', 'appointment_date', 'appointment_time', 'status', 'created_at']

    def create(self, validated_data):
        doctor_id = validated_data.pop('doctor_id')
        time_slot_id = validated_data.pop('time_slot_id')

        try:
            doctor = DoctorProfile.objects.get(id=doctor_id)
        except DoctorProfile.DoesNotExist:
            raise serializers.ValidationError({"doctor_id": "Doctor not found."})

        try:
            time_slot = TimeSlot.objects.get(id=time_slot_id, doctor=doctor)
        except TimeSlot.DoesNotExist:
            raise serializers.ValidationError({"time_slot_id": "Time slot not found for this doctor."})

        if time_slot.is_booked:
            raise serializers.ValidationError({"time_slot_id": "This time slot is already booked."})

        patient_profile = self.context['request'].user.patient_profile

        # Mark time slot as booked
        time_slot.is_booked = True
        time_slot.save()

        appointment = Appointment.objects.create(
            patient=patient_profile,
            doctor=doctor,
            time_slot=time_slot,
            appointment_date=time_slot.date,
            appointment_time=time_slot.start_time,
            **validated_data
        )

        return appointment


class AppointmentStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['status', 'doctor_notes']


class RescheduleSerializer(serializers.Serializer):
    new_time_slot_id = serializers.UUIDField(required=True)
