from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from appointments.models import Appointment
from .models import Payment
from .serializers import PaymentSerializer, InitiatePaymentSerializer, VerifyPaymentSerializer
from .gateways import PaymentGatewayFactory

class InitiatePaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        if serializer.is_valid():
            appointment_id = serializer.validated_data['appointment_id']
            gateway_type = serializer.validated_data['gateway']

            try:
                appointment = Appointment.objects.get(id=appointment_id, patient__user=request.user)
            except Appointment.DoesNotExist:
                return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

            gateway_service = PaymentGatewayFactory.get_gateway(gateway_type)
            intent = gateway_service.create_payment_intent(
                amount=float(appointment.doctor.consultation_fee),
                currency='INR'
            )

            # Create or update Payment record
            payment, _ = Payment.objects.update_or_create(
                appointment=appointment,
                defaults={
                    'transaction_id': intent['transaction_id'],
                    'gateway': gateway_type,
                    'amount': appointment.doctor.consultation_fee,
                    'currency': intent['currency'],
                    'status': Payment.Status.PENDING
                }
            )

            return Response({
                'payment': PaymentSerializer(payment).data,
                'gateway_intent': intent
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyPaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        if serializer.is_valid():
            appointment_id = serializer.validated_data['appointment_id']
            gateway_type = serializer.validated_data['gateway']
            transaction_id = serializer.validated_data['transaction_id']
            token = serializer.validated_data.get('signature_or_token', '')

            try:
                appointment = Appointment.objects.get(id=appointment_id)
                payment = Payment.objects.get(appointment=appointment)
            except (Appointment.DoesNotExist, Payment.DoesNotExist):
                return Response({'error': 'Appointment or Payment record not found.'}, status=status.HTTP_404_NOT_FOUND)

            gateway_service = PaymentGatewayFactory.get_gateway(gateway_type)
            is_valid, confirmed_tx_id = gateway_service.verify_payment(transaction_id, token)

            if is_valid:
                payment.status = Payment.Status.SUCCESS
                payment.transaction_id = confirmed_tx_id
                payment.save()

                # Send Email notification upon payment completion
                from notifications.email_service import send_appointment_emails
                send_appointment_emails(appointment, payment_status="PAID / SUCCESS")

                return Response({
                    'message': 'Payment verified successfully!',
                    'payment': PaymentSerializer(payment).data
                }, status=status.HTTP_200_OK)
            else:
                payment.status = Payment.Status.FAILED
                payment.save()
                return Response({'error': 'Payment verification failed.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PaymentHistoryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PATIENT':
            return Payment.objects.filter(appointment__patient__user=user)
        elif user.role == 'DOCTOR':
            return Payment.objects.filter(appointment__doctor__user=user)
        return Payment.objects.all()


class ReceiptDownloadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, appointment_id):
        try:
            appointment = Appointment.objects.select_related('patient__user', 'doctor__user', 'payment').get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role == 'PATIENT' and appointment.patient.user != request.user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        payment = getattr(appointment, 'payment', None)

        receipt_data = {
            'title': 'MediConnect Official Consultation Receipt',
            'receipt_number': payment.receipt_number if payment else 'N/A',
            'booking_id': appointment.booking_id,
            'date': str(appointment.appointment_date),
            'time': str(appointment.appointment_time),
            'patient_name': appointment.patient.user.get_full_name(),
            'patient_email': appointment.patient.user.email,
            'doctor_name': f"Dr. {appointment.doctor.user.get_full_name()}",
            'doctor_specialization': appointment.doctor.specialization.name if appointment.doctor.specialization else 'General Medicine',
            'clinic': appointment.doctor.hospital_name,
            'clinic_address': appointment.doctor.clinic_address,
            'amount_paid': str(payment.amount) if payment else str(appointment.doctor.consultation_fee),
            'currency': payment.currency if payment else 'INR',
            'payment_status': payment.status if payment else 'UNPAID',
            'payment_gateway': payment.gateway if payment else 'N/A',
            'transaction_id': payment.transaction_id if payment else 'N/A',
            'issued_at': str(payment.created_at) if payment else str(appointment.created_at)
        }

        return Response(receipt_data, status=status.HTTP_200_OK)
