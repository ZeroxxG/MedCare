from rest_framework import serializers
from users.serializers import UserSerializer
from .models import PatientProfile

class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['id', 'user', 'date_of_birth', 'gender', 'blood_group', 'emergency_contact', 'medical_history', 'address', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
