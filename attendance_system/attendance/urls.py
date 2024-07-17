from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, AttendanceViewSet, register_student, mark_attendance, get_attendance

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'attendance', AttendanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_student),
    path('mark-attendance/', mark_attendance),
    path('attendance/<str:roll_number>/', get_attendance),
]
