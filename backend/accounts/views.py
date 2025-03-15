from django.contrib.auth.models import User
from django.shortcuts import render
from rest_framework import status

from rest_framework.decorators import api_view
from rest_framework.response import Response


# Create your views here.

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = User.objects.get(username=username)
    if not user.check_password(password):
        return Response({'error': 'Invalid username or password'}, status=status.HTTP_403_FORBIDDEN)
    else:
        return Response({"username":user.username},status=status.HTTP_200_OK)

@api_view(['POST'])
def signup(request):
    username=request.data['username']
    password=request.data['password']
    User.objects.create_user(username=username, password=password)
    return Response(status=status.HTTP_201_CREATED)

@api_view(['PUT'])
def update_user(request):
    username = request.data['username']
    password = request.data['password']
    user=User.objects.get(username=username)
    user.password=password
    user.save()
    return Response(status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_user(request, username):
    user=User.objects.get(username=username)
    user.delete()
    return Response(status=status.HTTP_200_OK)
