from django.urls import path
from .views import NotificationListView, NotificationMarkReadView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('read/', NotificationMarkReadView.as_view(), name='notification-mark-all-read'),
    path('read/<uuid:pk>/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
]
