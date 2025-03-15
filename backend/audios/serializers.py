from rest_framework import serializers

from .models import Gesture, Audio


class GestureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gesture
        fields = ['audio_name','gesture']

class AudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audio
        fields = ['name','file']