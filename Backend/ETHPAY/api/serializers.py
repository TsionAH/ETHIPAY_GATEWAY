# api/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (
    User, Session, Dashboard, Payment, Transaction, Receipt,
    Notification, WalletIntegration, SystemLog, ServiceFeeCalculator
)
from .services import Validator, AuthenticationManager, SystemLogService

# Serializer for user registration
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    fullName = serializers.CharField(source='full_name', required=True)
    companyName = serializers.CharField(source='company_name', required=False, allow_blank=True, allow_null=True)
    phoneNumber = serializers.CharField(source='phone_number', required=True)

    class Meta:
        model = User
        fields = ['fullName', 'companyName', 'phoneNumber', 'email', 'password', 'role']

    def validate(self, attrs):
        """
        Validate method receives attrs after field validation but before source mapping.
        We need to handle both the incoming field names and the source-mapped names.
        """
        errors = {}
        
        # Get values - in validate(), attrs contains the source-mapped field names
        email = attrs.get('email', '')
        full_name = attrs.get('full_name', '')  # Source mapped from fullName
        password = attrs.get('password', '')
        role = attrs.get('role', 'endUser')
        company_name = attrs.get('company_name') or ''  # Source mapped from companyName
        phone_number = attrs.get('phone_number', '')  # Source mapped from phoneNumber
        
        # Validate email
        if not email:
            errors['email'] = ["Email is required"]
        elif not Validator.validate_email(email):
            errors['email'] = ["Invalid email format. Must contain @ and ., with proper positioning."]
        elif User.objects.filter(email=email).exists():
            errors['email'] = ["Email already registered"]
        
        # Validate full name
        if not full_name:
            errors['fullName'] = ["Full name is required"]
        elif not Validator.validate_full_name(full_name):
            errors['fullName'] = ["Full name must contain at least first and last name, no digits or special characters (except hyphen/apostrophe)"]
        
        # Validate phone number
        if not phone_number:
            errors['phoneNumber'] = ["Phone number is required"]
        
        # Validate password
        if not password:
            errors['password'] = ["Password is required"]
        elif not Validator.validate_password(password):
            errors['password'] = ["Password must be at least 8 characters and meet complexity requirements (uppercase, lowercase, number, special character)"]
        
        # Validate role
        if role and role not in ['merchant', 'endUser', 'admin']:
            errors['role'] = ["Role must be one of: merchant, endUser, admin"]
        
        # Check if company name is required for merchant
        if role == 'merchant' and not company_name:
            errors['companyName'] = ["Company name is required for merchants"]
        # Check uniqueness of company name (if provided)
        elif company_name:
            # Check if another user with different email has this company name
            existing = User.objects.filter(company_name=company_name).exclude(email=email).first()
            if existing:
                errors['companyName'] = ["Company name already exists"]
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            company_name=validated_data.get('company_name'),
            phone_number=validated_data['phone_number'],
            role=validated_data.get('role', 'endUser'),
            status='pending'
        )
        
        # Log registration
        SystemLogService.create_log(
            user_id=user,
            action="User Registration",
            status="SUCCESS",
            details=f"User {user.email} registered with role {user.role}"
        )
        
        return user


# Serializer for user login
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    companyName = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        company_name = data.get('companyName', '')

        if email and password:
            try:
                user = User.objects.get(email=email)
                
                # Check if user is active (for production, you may want to require active status)
                # For development, we allow pending users to login
                if user.status == 'suspended':
                    raise serializers.ValidationError("Account is suspended. Please contact support.")
                
                # Verify password
                if not user.check_password(password):
                    SystemLogService.create_log(
                        user_id=user,
                        action="Login Attempt",
                        status="FAILED",
                        details="Invalid password"
                    )
                    raise serializers.ValidationError("Invalid email or password")
                
                # For merchants, verify company name if provided
                if user.role == 'merchant' and company_name:
                    if user.company_name != company_name:
                        raise serializers.ValidationError("Invalid company name")
                
                data['user'] = user
                
                # Log successful login
                SystemLogService.create_log(
                    user_id=user,
                    action="Login",
                    status="SUCCESS",
                    details=f"User {user.email} logged in"
                )
                
                return data
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid email or password")
        else:
            raise serializers.ValidationError("Both email and password are required")


# Serializer for displaying user data
class UserSerializer(serializers.ModelSerializer):
    userId = serializers.UUIDField(source='userId', read_only=True)
    fullName = serializers.CharField(source='full_name', read_only=True)
    companyName = serializers.CharField(source='company_name', read_only=True)
    phoneNumber = serializers.CharField(source='phone_number', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = User
        fields = ['userId', 'fullName', 'companyName', 'phoneNumber', 'email', 'role', 'createdAt']


# Serializer for Payment
class PaymentSerializer(serializers.ModelSerializer):
    paymentID = serializers.UUIDField(source='payment_id', read_only=True)
    userID = serializers.UUIDField(source='user_id', read_only=True)
    recipientID = serializers.UUIDField(source='recipient_id', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    processedAt = serializers.DateTimeField(source='processed_at', read_only=True)

    class Meta:
        model = Payment
        fields = ['paymentID', 'userID', 'amount', 'currency', 'recipientID', 'payment_method', 'status', 'createdAt', 'processedAt']


# Serializer for Transaction
class TransactionSerializer(serializers.ModelSerializer):
    transactionID = serializers.UUIDField(source='transaction_id', read_only=True)
    paymentID = serializers.UUIDField(source='payment_id', read_only=True)
    userID = serializers.UUIDField(source='user_id', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    completedAt = serializers.DateTimeField(source='completed_at', read_only=True)

    class Meta:
        model = Transaction
        fields = ['transactionID', 'paymentID', 'userID', 'amount', 'service_fee', 'total_amount', 'status', 'createdAt', 'completedAt']


# Serializer for Receipt
class ReceiptSerializer(serializers.ModelSerializer):
    receiptID = serializers.UUIDField(source='receipt_id', read_only=True)
    transactionID = serializers.UUIDField(source='transaction_id', read_only=True)
    userID = serializers.UUIDField(source='user_id', read_only=True)
    issuedAt = serializers.DateTimeField(source='issued_at', read_only=True)

    class Meta:
        model = Receipt
        fields = ['receiptID', 'transactionID', 'userID', 'amount', 'service_fee', 'total_amount', 'issuedAt', 'receipt_format']


# Serializer for Dashboard
class DashboardSerializer(serializers.ModelSerializer):
    dashboardID = serializers.UUIDField(source='dashboard_id', read_only=True)
    userID = serializers.UUIDField(source='user_id', read_only=True)
    lastUpdated = serializers.DateTimeField(source='last_updated', read_only=True)

    class Meta:
        model = Dashboard
        fields = ['dashboardID', 'userID', 'role', 'widgets', 'lastUpdated']


# Serializer for Notification
class NotificationSerializer(serializers.ModelSerializer):
    notificationID = serializers.UUIDField(source='notification_id', read_only=True)
    userID = serializers.UUIDField(source='user_id', read_only=True)
    sentAt = serializers.DateTimeField(source='sent_at', read_only=True)

    class Meta:
        model = Notification
        fields = ['notificationID', 'userID', 'message', 'type', 'sentAt', 'status']


# Serializer for WalletIntegration
class WalletIntegrationSerializer(serializers.ModelSerializer):
    apiID = serializers.UUIDField(source='api_id', read_only=True)
    lastSyncedAt = serializers.DateTimeField(source='last_synced_at', read_only=True)

    class Meta:
        model = WalletIntegration
        fields = ['apiID', 'provider_name', 'endpoint_url', 'connection_status', 'lastSyncedAt']
