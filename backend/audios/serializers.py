from rest_framework import serializers

from .models import Gesture


class GestureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gesture
        fields = ['audio_name','gesture']