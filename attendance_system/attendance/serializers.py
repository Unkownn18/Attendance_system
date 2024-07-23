from rest_framework import serializers
from .models import Student, Attendance

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.name')  # Optional: Include student name in the response

    class Meta:
        model = Attendance
        fields = ['student_name', 'timestamp', 'location', 'status']  # Added 'student_name' for clarity
