from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SpecializationViewSet,
    DoctorProfileViewSet,
    DoctorSelfProfileView,
    DoctorTimeSlotListView,
    AvailabilityManageView
)

router = DefaultRouter()
router.register('specializations', SpecializationViewSet, basename='specialization')
router.register('list', DoctorProfileViewSet, basename='doctor-list')

urlpatterns = [
    path('me/', DoctorSelfProfileView.as_view(), name='doctor-self-profile'),
    path('availabilities/', AvailabilityManageView.as_view(), name='doctor-availabilities'),
    path('<uuid:doctor_id>/slots/', DoctorTimeSlotListView.as_view(), name='doctor-slots'),
    path('', include(router.urls)),
]
