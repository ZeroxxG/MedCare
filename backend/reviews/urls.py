from django.urls import path
from .views import ReviewCreateView, DoctorReviewListView

urlpatterns = [
    path('', ReviewCreateView.as_view(), name='review-create'),
    path('doctor/<uuid:doctor_id>/', DoctorReviewListView.as_view(), name='doctor-reviews'),
]
