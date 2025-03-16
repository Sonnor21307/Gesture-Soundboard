from django.urls import path

from . import views

app_name = 'gestures'

urlpatterns = [
    path('audio/<str:username>', views.get_audios, name='get_audios'),
    path('audio/<str:username>/create', views.upload_audio, name="audio_create"),
    path('audio/<str:username>/<str:audio_name>/delete', views.delete_audio, name="audio_delete"),
    path('<str:username>/update', views.update_gesture, name="update_gesture"),
    path('<str:username>/all', views.get_gestures, name='get_gestures'),
    path('<str:username>/create', views.upload_gesture, name='fart'),
    path('<str:username>/<str:gesture>/delete', views.delete_gesture, name='delete'),
]