from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, AttendanceViewSet, register_student, mark_attendance, GetAttendanceView

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'attendance', AttendanceViewSet)

urlpatterns = [
    path('register/', register_student, name='register_student'),
    path('mark-attendance/', mark_attendance, name='mark_attendance'),
    path('attendance/<str:roll_number>/',  GetAttendanceView.as_view(), name='get_attendance'),
    path('', include(router.urls)),
]
