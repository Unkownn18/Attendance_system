
# Create your models here.

from django.db import models
from datetime import date

class Student(models.Model):
    name = models.CharField(max_length=100)
    roll_number = models.CharField(max_length=20, unique=True)
    face_encodings = models.BinaryField()
    def __str__(self):
        return f'{self.name} ({self.roll_number})'


# models.pyfrom datetime import date

class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=[('present', 'Present'), ('absent', 'Absent')], default='absent')

    def __str__(self):
        return f'{self.student.name} - {self.timestamp.strftime("%Y-%m-%d %H:%M:%S")} - {self.location} - {self.status}'

    def is_today(self):
        return self.timestamp.date() == date.today()

