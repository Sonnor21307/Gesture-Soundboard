from django.urls import path

from . import views

app_name = 'gestures'

urlpatterns = [
    path('<str:username>/create', views.upload_gesture, name='fart'),
    path('<str:username>/<str:gesture>', views.get_gesture, name='get_gesture'),
    path('<str:username>/<str:gesture>/delete', views.delete_gesture, name='delete'),
]