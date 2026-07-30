from rest_framework import generics, permissions
from .models import Review
from .serializers import ReviewSerializer

class ReviewCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReviewSerializer


class DoctorReviewListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ReviewSerializer

    def get_queryset(self):
        doctor_id = self.kwargs.get('doctor_id')
        return Review.objects.filter(doctor_id=doctor_id)
