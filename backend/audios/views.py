import uuid

from django.contrib.auth.models import User
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view

import os.path
import environ
from rest_framework.response import Response

from google.cloud import storage
from google.auth import exceptions
from google.oauth2 import service_account

from .models import Gesture
from .serializers import GestureSerializer

env = environ.Env()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

creds = {
    "type": env("TYPE"),
    "project_id": env("PROJECT_ID"),
    "private_key_id": env("PRIVATE_KEY_ID"),
    "private_key": env('PRIVATE_KEY').replace('\\n', '\n').replace('"',''),
    "client_email": env("CLIENT_EMAIL"),
    "client_id": env("CLIENT_ID"),
    "auth_uri": env("AUTH_URI"),
    "token_uri": env("TOKEN_URI"),
    "auth_provider_x509_cert_url": env("AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": env("CLIENT_X509_CERT_URL"),
    "universe_domain": env("UNIVERSE_DOMAIN"),
}

base_url = "https://storage.googleapis.com/audio21307/"

@api_view(['GET'])
def get_gestures(request,username):
    user = User.objects.get(username=username)
    list_of_gestures = list()
    for gesture in user.gesture_set.all():
        list_of_gestures.append({"gesture": gesture.gesture, "audio_name":gesture.audio_name.split('&')[1], "url": base_url + gesture.audio_name})
    return Response(list_of_gestures, status=status.HTTP_200_OK)


@api_view(['POST'])
def upload_gesture(request,username):
    gesture = request.data.get('gesture')
    audio_name = request.data.get('audio_name')
    user = User.objects.get(username=username)
    name = user.username + "&" + audio_name
    try:
        user.gesture_set.create(gesture=gesture, audio_name=name)
    except Exception as e:
        return Response({"error": "Gesture " + gesture + " already exists for user"}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"url": base_url + name, "audio_name":name.split('&')[1], "gesture":gesture}, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
def delete_gesture(request,username,gesture):
    try:
        user = User.objects.get(username=username)
        gesture = user.gesture_set.get(gesture=gesture)
        gesture.delete()
    except Exception as e:
        print(e)
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
def update_gesture(request,username):
    gesture_name = request.data.get('gesture')
    audio_name = request.data.get('audio_name')
    user = User.objects.get(username=username)
    gesture = user.gesture_set.get(gesture=gesture_name)
    name = user.username + "&" + audio_name
    try:
        gesture.audio_name = name
        gesture.save()
    except Exception as e:
        return Response({"error": "Failed to update gesture"}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"url": base_url + name, "audio_name":audio_name, "gesture":gesture.gesture}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def upload_audio(request, username):
    audio_file = request.data.get('audio')
    audio_name = request.data.get('audio_name')

    credentials = service_account.Credentials.from_service_account_info(creds)
    client = storage.Client(credentials=credentials, project=creds["project_id"])

    bucket = client.get_bucket('audio21307')
    filename = username + "&" + audio_name
    blob = bucket.blob(filename)
    blob.upload_from_file(file_obj=audio_file, content_type='audio/mpeg')

    user = User.objects.get(username=username)
    user.audio_set.create(name=filename)

    return Response({"url": base_url + filename, "audio_name":audio_name}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_audios(request,username):
    user = User.objects.get(username=username)
    audios = user.audio_set.all()
    list_of_audios = list()
    for audio in audios:
        name = audio.name.split("&")[1]
        list_of_audios.append({"audio_name": name, "url": base_url + audio.name})
    return Response(list_of_audios, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def delete_audio(request,username,audio_name):
    user = User.objects.get(username=username)
    filename = username + "&" + audio_name
    audio = user.audio_set.get(name=filename)
    credentials = service_account.Credentials.from_service_account_info(creds)
    client = storage.Client(credentials=credentials, project=creds["project_id"])
    bucket = client.get_bucket('audio21307')
    blob = bucket.blob(filename)
    blob.delete()
    audio.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)





