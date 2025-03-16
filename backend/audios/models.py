from bson import ObjectId
from django.conf import settings
from django.db import models

# Create your models here.

def generate_object_id():
    return str(ObjectId())

class Audio(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.TextField()
    class Meta:
        unique_together = ("user", "name")

class Gesture(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    audio_name = models.TextField()
    gesture = models.TextField()

    class Meta:
        unique_together = ('user', 'gesture')