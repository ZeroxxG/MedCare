from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentStatusUpdateSerializer, RescheduleSerializer
from doctors.models import TimeSlot
from notifications.email_service import send_appointment_emails

class AppointmentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AppointmentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'appointment_date']
    ordering_fields = ['appointment_date', 'appointment_time', 'created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'DOCTOR':
            return Appointment.objects.filter(doctor__user=user).select_related('patient__user', 'doctor__user', 'time_slot')
        elif user.role == 'PATIENT':
            return Appointment.objects.filter(patient__user=user).select_related('patient__user', 'doctor__user', 'time_slot')
        return Appointment.objects.all().select_related('patient__user', 'doctor__user', 'time_slot')

    def perform_create(self, serializer):
        appointment = serializer.save()

        # Send confirmation email to Patient & notification email to Doctor
        payment_status = "PENDING"
        if hasattr(appointment, 'payment'):
            payment_status = appointment.payment.status

        send_appointment_emails(appointment, payment_status=payment_status)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        appointment = self.get_object()
        if request.user.role != 'DOCTOR' or appointment.doctor.user != request.user:
            return Response({'error': 'Only the assigned doctor can approve appointments.'}, status=status.HTTP_403_FORBIDDEN)

        appointment.status = Appointment.Status.APPROVED
        appointment.save()

        # Create in-app notification
        from notifications.models import Notification
        Notification.objects.create(
            user=appointment.patient.user,
            title="Appointment Approved",
            message=f"Dr. {appointment.doctor.user.get_full_name()} approved your appointment for {appointment.appointment_date} at {appointment.appointment_time}."
        )

        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        appointment = self.get_object()
        if request.user.role != 'DOCTOR' or appointment.doctor.user != request.user:
            return Response({'error': 'Only the assigned doctor can reject appointments.'}, status=status.HTTP_403_FORBIDDEN)

        appointment.status = Appointment.Status.REJECTED
        if appointment.time_slot:
            appointment.time_slot.is_booked = False
            appointment.time_slot.save()
        appointment.save()

        # Create notification
        from notifications.models import Notification
        Notification.objects.create(
            user=appointment.patient.user,
            title="Appointment Declined",
            message=f"Dr. {appointment.doctor.user.get_full_name()} declined your appointment request."
        )

        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def complete(self, request, pk=None):
        appointment = self.get_object()
        if request.user.role != 'DOCTOR' or appointment.doctor.user != request.user:
            return Response({'error': 'Only the assigned doctor can mark appointments as complete.'}, status=status.HTTP_403_FORBIDDEN)

        notes = request.data.get('doctor_notes', '')
        appointment.status = Appointment.Status.COMPLETED
        if notes:
            appointment.doctor_notes = notes
        appointment.save()

        from notifications.models import Notification
        Notification.objects.create(
            user=appointment.patient.user,
            title="Consultation Completed",
            message=f"Your appointment with Dr. {appointment.doctor.user.get_full_name()} is complete. Please leave a review!"
        )

        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        user = request.user

        if user.role == 'PATIENT' and appointment.patient.user != user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        if user.role == 'DOCTOR' and appointment.doctor.user != user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        appointment.status = Appointment.Status.CANCELLED
        if appointment.time_slot:
            appointment.time_slot.is_booked = False
            appointment.time_slot.save()
        appointment.save()

        return Response({'message': 'Appointment cancelled successfully.', 'appointment': AppointmentSerializer(appointment).data})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reschedule(self, request, pk=None):
        appointment = self.get_object()
        serializer = RescheduleSerializer(data=request.data)
        if serializer.is_valid():
            new_slot_id = serializer.validated_data['new_time_slot_id']
            try:
                new_slot = TimeSlot.objects.get(id=new_slot_id, doctor=appointment.doctor)
            except TimeSlot.DoesNotExist:
                return Response({'error': 'Target time slot not found.'}, status=status.HTTP_400_BAD_REQUEST)

            if new_slot.is_booked:
                return Response({'error': 'Target time slot is already booked.'}, status=status.HTTP_400_BAD_REQUEST)

            # Release old slot
            if appointment.time_slot:
                appointment.time_slot.is_booked = False
                appointment.time_slot.save()

            # Reserve new slot
            new_slot.is_booked = True
            new_slot.save()

            appointment.time_slot = new_slot
            appointment.appointment_date = new_slot.date
            appointment.appointment_time = new_slot.start_time
            appointment.save()

            return Response(AppointmentSerializer(appointment).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
