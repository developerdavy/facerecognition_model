import cv2
from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import Person
from .face_recognition import get_face_encodings, match_face_with_database
import numpy as np

def scan_face(request):
    if request.method == 'POST':
        image = request.FILES['face_image']
        # Convert image to OpenCV format
        image_np = np.fromstring(image.read(), np.uint8)
        image_cv = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

        # Get face encodings from the image
        encodings = get_face_encodings(image_cv)

        if encodings:
            matched_person = match_face_with_database(encodings)
            if matched_person:
                # Person found, display their details
                return render(request, 'person_detail.html', {'person': matched_person})
            else:
                # No match found, render the add person page
                return redirect('enroll_person')
        else:
            return HttpResponse("No face detected. Please try again.")

    return render(request, 'scan_face.html')

def enroll_person(request):
    if request.method == 'POST':
        # Save person's data and face encoding
        first_name = request.POST['first_name']
        last_name = request.POST['last_name']
        email = request.POST['email']
        face_image = request.FILES['face_image']

        # Convert to OpenCV format and get face encoding
        image_np = np.fromstring(face_image.read(), np.uint8)
        image_cv = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        encodings = get_face_encodings(image_cv)

        if encodings:
            person = Person.objects.create(
                first_name=first_name,
                last_name=last_name,
                email=email,
                face_encoding=encodings[0].tobytes()  # Convert encoding to binary format
            )
            return HttpResponse(f"Person {person.first_name} enrolled successfully!")
        else:
            return HttpResponse("No face detected. Please try again.")

    return render(request, 'enroll_person.html')
