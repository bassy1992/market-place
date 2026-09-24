from rest_framework import serializers

from .models import Car, CarVideo, Dealer


class CarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = '__all__'


class DealerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dealer
        fields = '__all__'


class CarVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarVideo
        fields = ['id', 'video', 'uploaded_at']
