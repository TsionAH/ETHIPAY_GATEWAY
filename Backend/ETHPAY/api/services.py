# api/services.py
import os
import secrets
import hashlib
from datetime import datetime, timedelta
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from .models import User, Session, ServiceFeeCalculator, SystemLog
import uuid
# Try to import bcrypt, but use Django's hashing as fallback
try:
    import bcrypt
    USE_BCRYPT = True
except ImportError:
    USE_BCRYPT = False

# Authentication Manager - CLASS 4
class AuthenticationManager:
    """
    Handles JWT token generation, verification, password hashing
    """
    _secret_key = None
    _token_expiry = 3600  # 1 hour in seconds
    _refresh_expiry = 604800  # 7 days in seconds
    
    @classmethod
    def get_secret_key(cls):
        """Get secret key from environment variables"""
        if cls._secret_key is None:
            cls._secret_key = os.environ.get('DJANGO_SECRET_KEY', settings.SECRET_KEY)
        return cls._secret_key
    
    @classmethod
    def hash_password(cls, raw_password):
        """Hash password using Django's password hasher (or bcrypt if available)"""
        if not raw_password or len(raw_password) < 8:
            raise ValueError("Password must be at least 8 characters")
        
        if USE_BCRYPT:
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(raw_password.encode('utf-8'), salt)
            return hashed.decode('utf-8')
        else:
            # Use Django's built-in password hashing (PBKDF2)
            return make_password(raw_password)
    
    @classmethod
    def compare_password(cls, raw_password, hashed_password):
        """Compare raw password with hashed password"""
        if not raw_password or not hashed_password:
            return False
        
        if USE_BCRYPT and hashed_password.startswith('$2b$'):
            # bcrypt hash format
            return bcrypt.checkpw(raw_password.encode('utf-8'), hashed_password.encode('utf-8'))
        else:
            # Django's password hashing
            return check_password(raw_password, hashed_password)
    
    @classmethod
    def generate_token(cls, user):
        """Generate JWT token pair for user"""
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }
    
    @classmethod
    def verify_token(cls, token):
        """Verify JWT token - handled by SimpleJWT"""
        # SimpleJWT handles token verification in middleware
        return True
    
    @classmethod
    def refresh_token(cls, refresh_token):
        """Refresh access token using refresh token"""
        refresh = RefreshToken(refresh_token)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }
    
    @classmethod
    def logout_user(cls, refresh_token):
        """Invalidate refresh token"""
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return True
        except Exception:
            return False


# Session Manager - CLASS 7
# Session Manager - CLASS 7
class SessionManager:
    """
    Manages user sessions
    """
    
    @staticmethod
    def generate_session_id():
        """Generate unique session ID"""
        return secrets.token_urlsafe(32)
    
    @classmethod
    def create_session(cls, user, expiry_hours=24):
        """Create a new session for user"""
        try:
            # Handle both User instance and UUID string
            from .models import User as UserModel
            
            if isinstance(user, (uuid.UUID, str)):
                # It's a user ID, get the User object
                user_obj = UserModel.objects.get(userId=user)
            else:
                # It's already a User object
                user_obj = user
            
            # Check if user has active session
            existing_session = Session.objects.filter(
                user_id=user_obj,
                is_active=True,
                expires_at__gt=timezone.now()
            ).first()
            
            if existing_session:
                return existing_session.session_id
            
            session_id = cls.generate_session_id()
            expires_at = timezone.now() + timedelta(hours=expiry_hours)
            
            session = Session.objects.create(
                session_id=session_id,
                user_id=user_obj,  # Pass User instance
                expires_at=expires_at,
                is_active=True
            )
            
            return str(session.session_id)
        except UserModel.DoesNotExist:
            raise ValueError(f"User does not exist")
        except Exception as e:
            print(f"Session creation error: {e}")
            raise
    
    @classmethod
    def validate_session(cls, session_id):
        """Validate if session is active and not expired"""
        try:
            session = Session.objects.get(session_id=session_id)
            if not session.is_active:
                return False
            
            if session.expires_at <= timezone.now():
                session.is_active = False
                session.save()
                return False
            
            return True
        except Session.DoesNotExist:
            return False
    
    @classmethod
    def terminate_session(cls, session_id):
        """Terminate a session"""
        try:
            session = Session.objects.get(session_id=session_id)
            session.is_active = False
            session.save()
            return True
        except Session.DoesNotExist:
            return False
# Validator - CLASS 10
class Validator:
    """
    Validates user inputs, payment amounts, transaction IDs
    """
    MAX_PAYMENT_AMOUNT = 1000000.00  # 1 million ETB
    TRANSACTION_ID_PATTERN = r'^TXN[A-Z0-9]{10,}$'
    
    @classmethod
    def validate_email(cls, email):
        """Validate email format according to SRS"""
        if not email or len(email) < 5:
            return False
        
        if '@' not in email or '.' not in email:
            return False
        
        at_position = email.index('@')
        dot_position = email.rindex('.')
        
        # Position of @ > 1
        if at_position <= 1:
            return False
        
        # Position of . > position of @ + 2
        if dot_position <= at_position + 2:
            return False
        
        # Position of . + 3 <= total length
        if dot_position + 3 > len(email):
            return False
        
        return True
    
    @classmethod
    def validate_full_name(cls, full_name):
        """Validate full name - must contain at least first and last name, no digits or special chars except hyphen/apostrophe"""
        if not full_name:
            return False
        
        parts = full_name.strip().split()
        if len(parts) < 2:
            return False
        
        # Check for digits or invalid special characters
        allowed_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ '-")
        for part in parts:
            if any(char not in allowed_chars for char in part):
                return False
        
        return True
    
    @classmethod
    def validate_password(cls, password):
        """Validate password complexity"""
        if not password or len(password) < 8:
            return False
        
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
        
        # At least 3 of 4 complexity requirements
        complexity_count = sum([has_upper, has_lower, has_digit, has_special])
        return complexity_count >= 3
    
    @classmethod
    def validate_payment_amount(cls, amount):
        """Validate payment amount"""
        try:
            amount_float = float(amount)
            return 0 < amount_float <= cls.MAX_PAYMENT_AMOUNT
        except (ValueError, TypeError):
            return False
    
    @classmethod
    def validate_transaction_id(cls, transaction_id):
        """Validate transaction ID format"""
        import re
        if not transaction_id:
            return False
        return bool(re.match(cls.TRANSACTION_ID_PATTERN, transaction_id))
    
    @classmethod
    def validate_user_input(cls, input_object):
        """Validate user input object"""
        errors = []
        
        if 'email' in input_object:
            if not cls.validate_email(input_object['email']):
                errors.append("Invalid email format")
        
        if 'full_name' in input_object:
            if not cls.validate_full_name(input_object['full_name']):
                errors.append("Invalid full name format")
        
        if 'password' in input_object:
            if not cls.validate_password(input_object['password']):
                errors.append("Password does not meet complexity requirements")
        
        if 'amount' in input_object:
            if not cls.validate_payment_amount(input_object['amount']):
                errors.append("Invalid payment amount")
        
        return len(errors) == 0, errors

from decimal import Decimal
# ... other imports remain the same

# ServiceFeeCalculator Service - CLASS 19
class ServiceFeeCalculatorService:
    """
    Service for calculating fees
    """
    
    @classmethod
    def get_calculator(cls):
        """Get or create default fee calculator"""
        calculator, created = ServiceFeeCalculator.objects.get_or_create(
            calculator_id='00000000-0000-0000-0000-000000000001',
            defaults={
                'fee_percentage': Decimal('0.02'),  # 2% as Decimal
                'minimum_fee': Decimal('0.50'),
                'maximum_fee': Decimal('100.00')
            }
        )
        return calculator
    
    @classmethod
    def calculate_fee(cls, amount):
        """Calculate service fee based on rules - Returns Decimal"""
        calculator = cls.get_calculator()
        
        # Convert amount to Decimal if it's not already
        if not isinstance(amount, Decimal):
            try:
                amount = Decimal(str(amount))
            except:
                amount = Decimal('0.00')
        
        # Calculate fee using Decimal arithmetic
        fee = amount * Decimal(str(calculator.fee_percentage))
        
        # Apply minimum fee
        if fee < Decimal(str(calculator.minimum_fee)):
            fee = Decimal(str(calculator.minimum_fee))
        
        # Apply maximum fee
        if fee > Decimal(str(calculator.maximum_fee)):
            fee = Decimal(str(calculator.maximum_fee))
        
        # Round to 2 decimal places for currency
        fee = fee.quantize(Decimal('0.01'))
        
        return fee
    
    @classmethod
    def calculate_fee_float(cls, amount):
        """Alternative: Calculate fee and return as float (for compatibility)"""
        fee = cls.calculate_fee(amount)
        return float(fee)
    
    @classmethod
    def validate_fee_range(cls, fee):
        """Validate if fee is within allowed range"""
        calculator = cls.get_calculator()
        
        # Ensure inputs are Decimal
        if not isinstance(fee, Decimal):
            fee = Decimal(str(fee))
        
        min_fee = Decimal(str(calculator.minimum_fee))
        max_fee = Decimal(str(calculator.maximum_fee))
        
        return min_fee <= fee <= max_fee
    
    @classmethod
    def update_fee_rules(cls, fee_percentage, minimum_fee, maximum_fee):
        """Update fee rules (admin only) - Accepts strings or Decimals"""
        calculator = cls.get_calculator()
        
        # Convert to Decimal
        calculator.fee_percentage = Decimal(str(fee_percentage))
        calculator.minimum_fee = Decimal(str(minimum_fee))
        calculator.maximum_fee = Decimal(str(maximum_fee))
        
        calculator.save()
        return calculator
# System Log Service
class SystemLogService:
    """
    Service for creating system logs
    """
    
    @staticmethod
    def create_log(user_id=None, action="", status="SUCCESS", details=""):
        """Create a system log entry"""
        log = SystemLog.objects.create(
            user_id=user_id,
            action=action,
            status=status,
            details=details
        )
        return str(log.log_id)
    
    @staticmethod
    def get_log_details(log_id):
        """Get log details"""
        try:
            log = SystemLog.objects.get(log_id=log_id)
            return {
                'log_id': str(log.log_id),
                'user_id': str(log.user_id.userId) if log.user_id else None,
                'action': log.action,
                'timestamp': log.timestamp,
                'status': log.status,
                'details': log.details
            }
        except SystemLog.DoesNotExist:
            return None
    
    @staticmethod
    def filter_logs(user_id=None, action=None, status=None, date_from=None, date_to=None):
        """Filter logs based on criteria"""
        logs = SystemLog.objects.all()
        
        if user_id:
            logs = logs.filter(user_id=user_id)
        if action:
            logs = logs.filter(action__icontains=action)
        if status:
            logs = logs.filter(status=status)
        if date_from:
            logs = logs.filter(timestamp__gte=date_from)
        if date_to:
            logs = logs.filter(timestamp__lte=date_to)
        
        return logs.order_by('-timestamp')

