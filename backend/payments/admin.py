from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'appointment', 'gateway', 'amount', 'currency', 'status', 'created_at')
    list_filter = ('gateway', 'status')
    search_fields = ('receipt_number', 'transaction_id')
