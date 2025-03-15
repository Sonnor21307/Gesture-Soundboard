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
def get_gesture(request,username,gesture):
    user = User.objects.get(username=username)
    gesture = user.gesture_set.get(gesture=gesture)
    return Response(base_url + gesture.audio_name)

@api_view(['POST'])
def upload_gesture(request,username):

    audio_file = request.data.get('audio')
    gesture = request.data.get('gesture')

    credentials = service_account.Credentials.from_service_account_info(creds)
    client = storage.Client(credentials=credentials, project=creds["project_id"])

    bucket = client.get_bucket('audio21307')
    filename = username + "&" + str(audio_file)
    blob = bucket.blob(filename)
    blob.upload_from_file(file_obj=audio_file, content_type='audio/mpeg')

    user = User.objects.get(username=username)
    gesture_obj = user.gesture_set.create(audio_name=filename, gesture=gesture)
    return Response({"url": base_url + gesture_obj.audio_name}, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
def delete_gesture(request,username,gesture):
    user = User.objects.get(username=username)
    gesture = user.gesture_set.get(gesture=gesture)
    filename = gesture.audio_name
    credentials = service_account.Credentials.from_service_account_info(creds)
    client = storage.Client(credentials=credentials, project=creds["project_id"])
    bucket = client.get_bucket('audio21307')
    blob = bucket.blob(filename)
    blob.delete()
    gesture.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

#ignore me





