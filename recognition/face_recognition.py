import cv2
import face_recognition
from .models import Person

def get_face_encodings(image):
    # Detect the face locations and compute the facial embeddings
    face_locations = face_recognition.face_locations(image)
    face_encodings = face_recognition.face_encodings(image, face_locations)
    return face_encodings

def match_face_with_database(face_encodings):
    persons = Person.objects.all()
    for person in persons:
        # Load person's face encoding from the database
        person_encoding = face_recognition.face_encodings(person.face_encoding)[0]
        matches = face_recognition.compare_faces([person_encoding], face_encodings[0])
        if True in matches:
            return person
    return None
