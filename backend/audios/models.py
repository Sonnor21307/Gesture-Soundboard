from bson import ObjectId
from django.conf import settings
from django.db import models

# Create your models here.

def generate_object_id():
    return str(ObjectId())

class Audio(models.Model):
    _id = models.CharField(max_length=24, primary_key=True, default=generate_object_id())
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.TextField()
    file = models.TextField()

    class Meta:
        unique_together = ("user", "name")

class Gesture(models.Model):
    _id = models.CharField(max_length=24, primary_key=True, default=generate_object_id())
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    audio = models.ForeignKey(Audio, on_delete=models.CASCADE)
    gesture = models.TextField()

    class Meta:
        unique_together = ('user', 'gesture')