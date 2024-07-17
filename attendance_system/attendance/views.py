from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Student, Attendance
from .serializers import StudentSerializer, AttendanceSerializer
import face_recognition
from PIL import Image
import numpy as np

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
        # Load image using face_recognition
        image = face_recognition.load_image_file(image_file)

        # Check if image is RGB
        if len(image.shape) == 3 and image.shape[2] == 3:
            encodings = face_recognition.face_encodings(image)
        else:
            return Response({'error': 'Unsupported image type, must be RGB image'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not encodings:
            return Response({'error': 'No face detected in the image'}, status=status.HTTP_400_BAD_REQUEST)

        encoding = encodings[0]

        if Student.objects.filter(face_encodings=encoding.tobytes()).exists():
            return Response({'error': 'Student already exists'}, status=status.HTTP_400_BAD_REQUEST)

        student = Student(name=name, roll_number=roll_number, face_encodings=encoding.tobytes())
        student.save()

        return Response({'success': 'Student registered successfully'})

    except ValidationError as ve:
        return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)
    except FileNotFoundError as fnfe:
        return Response({'error': 'File not found'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# API endpoint for marking attendance
@api_view(['POST'])
def mark_attendance(request):
    roll_number = request.data.get('roll_number')
    image_file = request.FILES.get('image')
    location = request.data.get('location')

    try:
        student = Student.objects.get(roll_number=roll_number)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found, please register'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Open and convert image to RGB using PIL
        img = Image.open(image_file)
        img = img.convert('RGB')
        image = np.array(img)  # Convert PIL image to numpy array

        # Check if image is RGB
        if len(image.shape) == 3 and image.shape[2] == 3:
            encodings = face_recognition.face_encodings(image)
        else:
            return Response({'error': 'Unsupported image type, must be RGB image'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not encodings:
            return Response({'error': 'No face detected in the image'}, status=status.HTTP_400_BAD_REQUEST)

        encoding = encodings[0]

        known_encoding = np.frombuffer(student.face_encodings, dtype=np.float64)
        matches = face_recognition.compare_faces([known_encoding], encoding)

        if matches[0]:
            Attendance.objects.create(student=student, location=location)
            return Response({'success': 'Attendance marked successfully'})
        else:
            return Response({'error': 'Face not recognized, please try again'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# API endpoint for retrieving attendance
@api_view(['GET'])
def get_attendance(request, roll_number):
    try:
        student = Student.objects.get(roll_number=roll_number)
        attendance = Attendance.objects.filter(student=student)
        serializer = AttendanceSerializer(attendance, many=True)
        return Response(serializer.data)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_400_BAD_REQUEST)
