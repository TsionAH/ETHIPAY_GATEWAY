from django.db import models

# Create your models here.

from django.contrib.auth.hashers import make_password

class User(models.Model):
    userId = models.ObjectIdField(primary_key=True, editable=False)
    fullName = models.CharField(max_length=100)
    companyName = models.CharField(max_length=100, blank=True, null=True)
    phoneNumber = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(unique=True)
    passwordHash = models.CharField(max_length=128)
    role = models.CharField(max_length=20, default='endUser')
    createdAt = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pending')

    def set_password(self, raw_password):
        self.passwordHash = make_password(raw_password)
        self.save()
