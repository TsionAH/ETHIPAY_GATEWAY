# api/models.py
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission

# Custom User Manager
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('status', 'active')
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)


# Custom User model - CLASS 1
class User(AbstractBaseUser, PermissionsMixin):
    userId = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=200)  # FullName
    company_name = models.CharField(max_length=200, null=True, blank=True, unique=True)  # CompanyName - nullable for end users
    phone_number = models.CharField(max_length=20)  # PhoneNumber
    email = models.EmailField(unique=True)  # Email - Private
    # password is stored in AbstractBaseUser as password hash
    role = models.CharField(max_length=20, choices=[
        ('merchant', 'Merchant'),
        ('endUser', 'End User'),
        ('admin', 'Admin')
    ])  # Role
    created_at = models.DateTimeField(auto_now_add=True)  # CreatedAt
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('suspended', 'Suspended')
    ])  # Status - Private, default pending
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    # Fix for clash errors
    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_groups',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )

    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_user_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'role']

    def __str__(self):
        return self.email
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['company_name'],
                condition=models.Q(company_name__isnull=False) & ~models.Q(company_name=''),
                name='unique_company_name'
            )
        ]


# Session Manager - CLASS 7
class Session(models.Model):
    session_id = models.CharField(max_length=64, primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.session_id} - {self.user_id.email}"


# Dashboard - CLASS 13
class Dashboard(models.Model):
    dashboard_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    role = models.CharField(max_length=20, choices=[
        ('admin', 'Admin'),
        ('merchant', 'Merchant'),
        ('endUser', 'End User')
    ])
    widgets = models.JSONField(default=list)  # Array of widget objects
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Dashboard {self.dashboard_id} - {self.user_id.email}"


# ServiceFeeCalculator - CLASS 19
class ServiceFeeCalculator(models.Model):
    calculator_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fee_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.02)  # Default 2%
    minimum_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.50)
    maximum_fee = models.DecimalField(max_digits=10, decimal_places=2, default=100.00)
    
    def __str__(self):
        return f"Fee Calculator - {self.fee_percentage}%"
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(fee_percentage__gte=0) & models.Q(fee_percentage__lte=0.10),
                name='fee_percentage_range'
            ),
            models.CheckConstraint(
                check=models.Q(maximum_fee__gt=models.F('minimum_fee')),
                name='max_fee_greater_than_min'
            )
        ]


# Payment - CLASS 16
class Payment(models.Model):
    payment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments', db_column='user_id')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='ETB')
    recipient_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_payments', db_column='recipient_id')
    payment_method = models.CharField(max_length=20, choices=[
        ('Wallet', 'Wallet'),
        ('BankTransfer', 'Bank Transfer'),
        ('Card', 'Card')
    ])
    status = models.CharField(max_length=20, default='Pending', choices=[
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
        ('Cancelled', 'Cancelled')
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Payment {self.payment_id} - {self.amount} {self.currency}"


# Transaction - CLASS 22
class Transaction(models.Model):
    transaction_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment_id = models.ForeignKey(Payment, on_delete=models.CASCADE, db_column='payment_id')
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    service_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, default='Pending', choices=[
        ('Pending', 'Pending'),
        ('Success', 'Success'),
        ('Failed', 'Failed'),
        ('Reversed', 'Reversed')
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Transaction {self.transaction_id} - {self.status}"


# Receipt - CLASS 25
class Receipt(models.Model):
    receipt_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_id = models.ForeignKey(Transaction, on_delete=models.CASCADE, db_column='transaction_id')
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    service_fee = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    issued_at = models.DateTimeField(auto_now_add=True)
    receipt_format = models.CharField(max_length=10, default='PDF', choices=[
        ('PDF', 'PDF'),
        ('JSON', 'JSON'),
        ('Text', 'Text')
    ])
    
    def __str__(self):
        return f"Receipt {self.receipt_id}"


# Notification - CLASS 28
class Notification(models.Model):
    notification_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    message = models.TextField()
    type = models.CharField(max_length=10, choices=[
        ('SMS', 'SMS'),
        ('EMAIL', 'Email'),
        ('IN_APP', 'In App')
    ])
    sent_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='PENDING', choices=[
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('FAILED', 'Failed')
    ])
    
    def __str__(self):
        return f"Notification {self.notification_id} - {self.type}"


# WalletIntegration / BankAPI - CLASS 31
class WalletIntegration(models.Model):
    api_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider_name = models.CharField(max_length=100)  # e.g., "Telebirr", "CBE Bank", "Amole"
    endpoint_url = models.URLField()
    connection_status = models.CharField(max_length=20, default='DISCONNECTED', choices=[
        ('CONNECTED', 'Connected'),
        ('DISCONNECTED', 'Disconnected'),
        ('FAILED', 'Failed')
    ])
    last_synced_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.provider_name} - {self.connection_status}"


# SystemLog - CLASS 34
class SystemLog(models.Model):
    log_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_column='user_id')
    action = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='SUCCESS', choices=[
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('PENDING', 'Pending')
    ])
    details = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Log {self.log_id} - {self.action} - {self.status}"
