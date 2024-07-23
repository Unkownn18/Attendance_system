from django.contrib import admin
from .models import Student, Attendance
from .forms import AttendanceForm

class AttendanceAdmin(admin.ModelAdmin):
    form = AttendanceForm

admin.site.register(Student)
admin.site.register(Attendance, AttendanceAdmin)
