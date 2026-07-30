from django.contrib import admin
from .models import Specialization, DoctorProfile, Availability, TimeSlot

@admin.register(Specialization)
class SpecializationAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon_name')
    search_fields = ('name',)

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('get_full_name', 'specialization', 'hospital_name', 'consultation_fee', 'rating_avg')
    search_fields = ('user__first_name', 'user__last_name', 'hospital_name')

    def get_full_name(self, obj):
        return f"Dr. {obj.user.get_full_name()}"

admin.site.register(Availability)
admin.site.register(TimeSlot)
