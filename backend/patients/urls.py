from django.urls import path
from .views import PatientSelfProfileView

urlpatterns = [
    path('me/', PatientSelfProfileView.as_view(), name='patient-self-profile'),
]
