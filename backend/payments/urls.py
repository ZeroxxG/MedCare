from django.urls import path
from .views import InitiatePaymentView, VerifyPaymentView, PaymentHistoryView, ReceiptDownloadView

urlpatterns = [
    path('initiate/', InitiatePaymentView.as_view(), name='payment-initiate'),
    path('verify/', VerifyPaymentView.as_view(), name='payment-verify'),
    path('history/', PaymentHistoryView.as_view(), name='payment-history'),
    path('receipt/<uuid:appointment_id>/', ReceiptDownloadView.as_view(), name='payment-receipt'),
]
