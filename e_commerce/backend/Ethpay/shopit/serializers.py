import base64
from django.core.files.base import ContentFile
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    # Remove image_base64 or fix it properly
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'category', 'slug', 'image', 'image_url']
    
    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None