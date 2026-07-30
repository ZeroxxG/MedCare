from rest_framework import viewsets, generics, permissions, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime, timedelta

from .models import Specialization, DoctorProfile, Availability, TimeSlot
from .serializers import SpecializationSerializer, DoctorProfileSerializer, AvailabilitySerializer, TimeSlotSerializer

class SpecializationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer
    permission_classes = [permissions.AllowAny]


class DoctorProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DoctorProfile.objects.filter(user__is_active=True).select_related('user', 'specialization')
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['specialization', 'city', 'is_available_for_booking']
    search_fields = ['user__first_name', 'user__last_name', 'specialization__name', 'hospital_name', 'city']
    ordering_fields = ['consultation_fee', 'rating_avg', 'experience_years', 'created_at']


class DoctorSelfProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DoctorProfileSerializer

    def get_object(self):
        profile, created = DoctorProfile.objects.get_or_create(user=self.request.user)
        return profile


class DoctorTimeSlotListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, doctor_id):
        date_str = request.query_params.get('date')
        if not date_str:
            date_obj = datetime.now().date()
        else:
            try:
                date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or generate slots for this doctor and date
        slots = TimeSlot.objects.filter(doctor_id=doctor_id, date=date_obj)

        if not slots.exists():
            # Generate slots based on doctor's Availability rules if present, or generate default slots
            day_of_week = date_obj.weekday()
            availabilities = Availability.objects.filter(doctor_id=doctor_id, day_of_week=day_of_week, is_active=True)

            if availabilities.exists():
                for avail in availabilities:
                    curr_dt = datetime.combine(date_obj, avail.start_time)
                    end_dt = datetime.combine(date_obj, avail.end_time)
                    while curr_dt + timedelta(minutes=avail.slot_duration_minutes) <= end_dt:
                        slot_start = curr_dt.time()
                        curr_dt += timedelta(minutes=avail.slot_duration_minutes)
                        slot_end = curr_dt.time()
                        TimeSlot.objects.get_or_create(
                            doctor_id=doctor_id,
                            date=date_obj,
                            start_time=slot_start,
                            end_time=slot_end
                        )
            else:
                # Default mock slots (9 AM - 1 PM)
                default_times = [
                    ("09:00:00", "09:30:00"),
                    ("09:30:00", "10:00:00"),
                    ("10:00:00", "10:30:00"),
                    ("11:00:00", "11:30:00"),
                    ("11:30:00", "12:00:00"),
                    ("14:00:00", "14:30:00"),
                    ("14:30:00", "15:00:00"),
                    ("15:00:00", "15:30:00"),
                ]
                for start_t, end_t in default_times:
                    TimeSlot.objects.get_or_create(
                        doctor_id=doctor_id,
                        date=date_obj,
                        start_time=datetime.strptime(start_t, "%H:%M:%S").time(),
                        end_time=datetime.strptime(end_t, "%H:%M:%S").time()
                    )

            slots = TimeSlot.objects.filter(doctor_id=doctor_id, date=date_obj)

        serializer = TimeSlotSerializer(slots, many=True)
        return Response(serializer.data)


class AvailabilityManageView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AvailabilitySerializer

    def get_queryset(self):
        return Availability.objects.filter(doctor__user=self.request.user)

    def perform_create(self, serializer):
        profile = DoctorProfile.objects.get(user=self.request.user)
        serializer.save(doctor=profile)
