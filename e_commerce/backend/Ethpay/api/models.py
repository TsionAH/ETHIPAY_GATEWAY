from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.conf import settings

class CustomUser(AbstractUser):
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.username

# Signal to create token when user is created - FIXED VERSION
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    """Create a token for new users only if it doesn't exist"""
    if created:
        # Only create token if one doesn't already exist
        if not Token.objects.filter(user=instance).exists():
            Token.objects.create(user=instance)