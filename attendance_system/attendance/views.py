from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Student, Attendance
from .serializers import StudentSerializer, AttendanceSerializer
import face_recognition
import numpy as np
from PIL import Image
import io
from datetime import datetime
from rest_framework.views import APIView

# ViewSet for Student model
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

# ViewSet for Attendance model
class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

# API endpoint for registering a student
@api_view(['POST'])
def register_student(request):
    name = request.data.get('name')
    roll_number = request.data.get('roll_number')
    image_file = request.FILES.get('image')

    try:
        # Check if student with the same roll number already exists
        if Student.objects.filter(roll_number=roll_number).exists():
            return Response({'error': 'Student with this roll number already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Convert image to RGB using PIL
        image = Image.open(image_file)
        if image.mode != 'RGB':
            image = image.convert('RGB')

        # Use face_recognition on the RGB image
        image_array = np.array(image)
        encodings = face_recognition.face_encodings(image_array)

        if not encodings:
            return Response({'error': 'No face detected in the image'}, status=status.HTTP_400_BAD_REQUEST)

        encoding = encodings[0]

        # Check if student with similar face encoding already exists
        for student in Student.objects.all():
            known_encoding = np.frombuffer(student.face_encodings, dtype=np.float64)
            matches = face_recognition.compare_faces([known_encoding], encoding)
            if matches[0]:
                return Response({'error': 'Student with similar face already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Create a new student with the encoding
        student = Student(
            name=name,
            roll_number=roll_number,
            face_encodings=encoding.tobytes()  # Save the encoding as bytes
        )
        student.save()

        return Response({'success': 'Student registered successfully'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# API endpoint for marking attendance

@api_view(['POST'])
def mark_attendance(request):
    roll_number = request.data.get('roll_number')
    image_file = request.FILES.get('image')
    location = request.data.get('location')

    # Validate input
    if not roll_number or not image_file or not location:
        return Response({'error': 'Missing roll number, image, or location'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        student = Student.objects.get(roll_number=roll_number)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found, please register'}, status=status.HTTP_404_NOT_FOUND)

    try:
        # Open and convert image to RGB using PIL
        img = Image.open(image_file)
        img = img.convert('RGB')
        image = np.array(img)  # Convert PIL image to numpy array

        # Check if image is RGB
        if len(image.shape) != 3 or image.shape[2] != 3:
            return Response({'error': 'Unsupported image type, must be RGB image'}, status=status.HTTP_400_BAD_REQUEST)

        encodings = face_recognition.face_encodings(image)
        
        if not encodings:
            return Response({'error': 'No face detected in the image'}, status=status.HTTP_400_BAD_REQUEST)

        encoding = encodings[0]

        # Convert stored encodings from buffer to numpy array
        known_encoding = np.frombuffer(student.face_encodings, dtype=np.float64)
        
        if known_encoding.shape[0] != 128:
            return Response({'error': 'Stored face encoding is invalid'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        matches = face_recognition.compare_faces([known_encoding], encoding)

        if matches[0]:
            today = datetime.now().date()
            # Check if attendance is already marked for today
            existing_attendance = Attendance.objects.filter(student=student, timestamp__date=today).first()
            if existing_attendance:
                return Response({'error': 'Attendance already marked for today'}, status=status.HTTP_400_BAD_REQUEST)

            # Create attendance record with the current timestamp
            Attendance.objects.create(student=student, location=location, status='present')
            return Response({'success': 'Attendance marked successfully'})
        else:
            return Response({'error': 'Face not recognized, please try again'}, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# API endpoint for getting attendance

class GetAttendanceView(APIView):
    def get(self, request, roll_number):
        try:
            student = Student.objects.get(roll_number=roll_number)
            today = datetime.now().date()

            # Get all attendance records for the student
            attendance_records = Attendance.objects.filter(student=student).order_by('timestamp')
            total_days = attendance_records.count()
            present_days = attendance_records.filter(status='present').count()

            # Calculate attendance percentage
            percentage = (present_days / total_days * 100) if total_days > 0 else 0

            # Determine today's attendance status
            today_attendance = Attendance.objects.filter(student=student, timestamp__date=today).first()
            today_status = today_attendance.status if today_attendance else 'absent'

            # Serialize the attendance data
            attendance_serializer = AttendanceSerializer(attendance_records, many=True)

            # Return the response in the desired format
            return Response({
                'studentName': student.name,
                'attendance': attendance_serializer.data,
                'todayStatus': today_status,
                'attendancePercentage': percentage
            })

        except Student.DoesNotExist:
            return Response({'error': 'Student not found, please register.'}, status=status.HTTP_404_NOT_FOUND)