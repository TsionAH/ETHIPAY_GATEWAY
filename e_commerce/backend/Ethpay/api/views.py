from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import CustomUser
from rest_framework import status
import traceback

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        print("=" * 50)
        print("REGISTRATION REQUEST DATA:", request.data)
        print("=" * 50)
        
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Debug print
        print(f"Username: {username}")
        print(f"Email: {email}")
        print(f"Password: {password}")
        
        # Validation
        if not username:
            print("ERROR: Username is required")
            return Response(
                {'error': 'Username is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not password:
            print("ERROR: Password is required")
            return Response(
                {'error': 'Password is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if username already exists
        if CustomUser.objects.filter(username=username).exists():
            print(f"ERROR: Username '{username}' already exists")
            return Response(
                {'error': 'Username already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if email already exists (only if email provided)
        if email and CustomUser.objects.filter(email=email).exists():
            print(f"ERROR: Email '{email}' already exists")
            return Response(
                {'error': 'Email already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        print(f"Creating user: {username}")
        # Create user
        user = CustomUser.objects.create_user(
            username=username,
            email=email,  # email can be empty string
            password=password
        )
        
        print(f"User created successfully: {user.id}")
        
        # Create token (delete any existing first)
        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)
        
        print(f"Token created: {token.key[:20]}...")
        
        return Response({
            'message': 'User created successfully',
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'email': user.email if user.email else ''
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print("=" * 50)
        print("EXCEPTION OCCURRED:")
        print(str(e))
        traceback.print_exc()
        print("=" * 50)
        
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    try:
        print("=" * 50)
        print("LOGIN REQUEST DATA:", request.data)
        print("=" * 50)
        
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Please provide both username and password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if user:
            # Delete any existing token and create new one
            Token.objects.filter(user=user).delete()
            token = Token.objects.create(user=user)
            
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'email': user.email if user.email else ''
            })
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
    except Exception as e:
        print("Login exception:", str(e))
        traceback.print_exc()
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )