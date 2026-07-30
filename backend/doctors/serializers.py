from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Specialization, DoctorProfile, Availability, TimeSlot

class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = '__all__'


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['id', 'doctor', 'date', 'start_time', 'end_time', 'is_booked']
        read_only_fields = ['id', 'is_booked']


class AvailabilitySerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = Availability
        fields = ['id', 'doctor', 'day_of_week', 'day_name', 'start_time', 'end_time', 'slot_duration_minutes', 'is_active']
        read_only_fields = ['id', 'doctor']


class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    specialization = SpecializationSerializer(read_only=True)
    specialization_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    secondary_specialization = SpecializationSerializer(read_only=True)
    secondary_specialization_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'user', 'medical_registration_number', 'specialization', 'specialization_id',
            'secondary_specialization', 'secondary_specialization_id', 'qualification',
            'experience_years', 'gender', 'profile_photo', 'hospital_name', 'clinic_address', 'city',
            'consultation_fee', 'online_consultation_fee', 'consultation_duration_minutes', 'bio',
            'languages_spoken', 'services_offered', 'awards_certifications', 'education_history',
            'professional_experience', 'social_links', 'medical_license', 'degree_certificates',
            'verification_status', 'rating_avg', 'reviews_count', 'is_available_for_booking', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'verification_status', 'rating_avg', 'reviews_count', 'created_at']

    def update(self, instance, validated_data):
        specialization_id = validated_data.pop('specialization_id', None)
        if specialization_id:
            instance.specialization = Specialization.objects.get(id=specialization_id)
        elif specialization_id is None and 'specialization_id' in validated_data:
            instance.specialization = None

        sec_spec_id = validated_data.pop('secondary_specialization_id', None)
        if sec_spec_id:
            instance.secondary_specialization = Specialization.objects.get(id=sec_spec_id)
        elif sec_spec_id is None and 'secondary_specialization_id' in validated_data:
            instance.secondary_specialization = None

        return super().update(instance, validated_data)
