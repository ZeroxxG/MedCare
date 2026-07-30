from rest_framework import generics, permissions
from .models import PatientProfile
from .serializers import PatientProfileSerializer

class PatientSelfProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PatientProfileSerializer

    def get_object(self):
        profile, created = PatientProfile.objects.get_or_create(user=self.request.user)
        return profile
