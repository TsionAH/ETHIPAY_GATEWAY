# api/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.http import JsonResponse

from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, PaymentSerializer,
    TransactionSerializer, ReceiptSerializer, DashboardSerializer,
    NotificationSerializer, WalletIntegrationSerializer
)
from .models import (
    User, Payment, Transaction, Receipt, Dashboard, Notification,
    WalletIntegration, SystemLog
)
from .services import (
    AuthenticationManager, SessionManager, Validator,
    ServiceFeeCalculatorService, SystemLogService
)

# At the top of api/views.py
import json
import secrets
from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from .services import AuthenticationManager
from .models import Session
def root(request):
    return JsonResponse({"message": "ETHPAY API is running"})


# USER OPERATIONS - CLASS 1
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """RegisterUser() - Register a new user"""
    try:
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "User registered successfully",
                    "userId": str(user.userId),
                    "status": user.status
                },
                status=status.HTTP_201_CREATED
            )
        
        # Return validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        # Log the exception for debugging
        import traceback
        print(f"Registration error: {str(e)}")
        print(traceback.format_exc())
        return Response(
            {"error": f"Registration failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """LoginUser() - Login user and return JWT tokens"""
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate tokens
        tokens = AuthenticationManager.generate_token(user)
        
        # Create session
        session_id = SessionManager.create_session(user)
        
        return Response({
            "access": tokens['access'],
            "refresh": tokens['refresh'],
            "userId": str(user.userId),
            "email": user.email,
            "role": user.role,
            "fullName": user.full_name,
            "sessionId": session_id
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """LogoutUser() - Logout user and invalidate token"""
    refresh_token = request.data.get('refresh')
    if refresh_token:
        AuthenticationManager.logout_user(refresh_token)
    
    return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_dashboard(request):
    """ViewDashboard() - Get user dashboard"""
    user = request.user
    dashboard, created = Dashboard.objects.get_or_create(
        user_id=user,
        defaults={'role': user.role, 'widgets': []}
    )
    
    # Generate dashboard based on role
    if created or not dashboard.widgets:
        dashboard = generate_dashboard(user, dashboard)
    
    serializer = DashboardSerializer(dashboard)
    return Response(serializer.data, status=status.HTTP_200_OK)


def generate_dashboard(user, dashboard):
    """GenerateDashboard() - Populate dashboard with role-specific widgets"""
    widgets = []
    
    if user.role == 'admin':
        widgets = [
            {'type': 'statistics', 'title': 'Total Users', 'id': 'stats_users'},
            {'type': 'statistics', 'title': 'Total Transactions', 'id': 'stats_transactions'},
            {'type': 'statistics', 'title': 'Total Revenue', 'id': 'stats_revenue'},
            {'type': 'recent_activity', 'title': 'Recent Activity', 'id': 'activity'}
        ]
    elif user.role == 'merchant':
        widgets = [
            {'type': 'balance', 'title': 'Account Balance', 'id': 'balance'},
            {'type': 'recent_payments', 'title': 'Recent Payments', 'id': 'payments'},
            {'type': 'statistics', 'title': 'Transactions', 'id': 'stats'}
        ]
    else:  # endUser
        widgets = [
            {'type': 'balance', 'title': 'My Balance', 'id': 'balance'},
            {'type': 'quick_pay', 'title': 'Quick Pay', 'id': 'quick_pay'},
            {'type': 'recent_transactions', 'title': 'Recent Transactions', 'id': 'transactions'}
        ]
    
    dashboard.widgets = widgets
    dashboard.role = user.role
    dashboard.save()
    
    return dashboard


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_token_view(request):
    """RefreshToken() - Refresh access token"""
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        return Response({"error": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        tokens = AuthenticationManager.refresh_token(refresh_token)
        return Response(tokens, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST)


# PAYMENT OPERATIONS - CLASS 16
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    """InitiatePayment() - Create a new payment"""
    user = request.user
    
    # Validate input
    amount = request.data.get('amount')
    recipient_id = request.data.get('recipientID')
    payment_method = request.data.get('paymentMethod', 'Wallet')
    currency = request.data.get('currency', 'ETB')
    
    if not amount or not recipient_id:
        return Response({"error": "Amount and recipientID are required"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate amount
    is_valid, errors = Validator.validate_user_input({'amount': amount})
    if not is_valid:
        return Response({"error": errors}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get recipient
    try:
        recipient = User.objects.get(userId=recipient_id)
    except User.DoesNotExist:
        return Response({"error": "Recipient not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user has sufficient balance (simplified - would check wallet/account)
    # For now, we'll just create the payment
    
    payment = Payment.objects.create(
        user_id=user,
        amount=amount,
        currency=currency,
        recipient_id=recipient,
        payment_method=payment_method,
        status='Pending'
    )
    
    SystemLogService.create_log(
        user_id=user,
        action="Payment Initiated",
        status="SUCCESS",
        details=f"Payment {payment.payment_id} initiated for {amount} {currency}"
    )
    
    serializer = PaymentSerializer(payment)
    return Response({
        "paymentID": str(payment.payment_id),
        **serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_payment(request):
    """ProcessPayment() - Process a pending payment"""
    payment_id = request.data.get('paymentID')
    
    if not payment_id:
        return Response({"error": "PaymentID is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        payment = Payment.objects.get(payment_id=payment_id)
    except Payment.DoesNotExist:
        return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if payment.status != 'Pending':
        return Response({"error": "Payment is not in pending status"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Calculate service fee
    service_fee = ServiceFeeCalculatorService.calculate_fee(payment.amount)
    total_amount = float(payment.amount) + service_fee
    
    # Create transaction
    transaction = Transaction.objects.create(
        payment_id=payment,
        user_id=payment.user_id,
        amount=payment.amount,
        service_fee=service_fee,
        total_amount=total_amount,
        status='Pending'
    )
    
    # Process payment (simplified - would integrate with wallet/bank API)
    # For now, we'll mark it as completed
    payment.status = 'Completed'
    payment.processed_at = timezone.now()
    payment.save()
    
    transaction.status = 'Success'
    transaction.completed_at = timezone.now()
    transaction.save()
    
    # Generate receipt
    receipt = Receipt.objects.create(
        transaction_id=transaction,
        user_id=payment.user_id,
        amount=payment.amount,
        service_fee=service_fee,
        total_amount=total_amount,
        receipt_format='PDF'
    )
    
    # Send notification
    Notification.objects.create(
        user_id=payment.user_id,
        message=f"Payment of {payment.amount} {payment.currency} processed successfully",
        type='IN_APP',
        status='PENDING'
    )
    
    SystemLogService.create_log(
        user_id=payment.user_id,
        action="Payment Processed",
        status="SUCCESS",
        details=f"Payment {payment_id} processed successfully"
    )
    
    return Response({
        "message": "Payment processed successfully",
        "transactionID": str(transaction.transaction_id),
        "receiptID": str(receipt.receipt_id)
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_payment(request):
    """CancelPayment() - Cancel a pending payment"""
    payment_id = request.data.get('paymentID')
    
    if not payment_id:
        return Response({"error": "PaymentID is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        payment = Payment.objects.get(payment_id=payment_id, user_id=request.user)
    except Payment.DoesNotExist:
        return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if payment.status != 'Pending':
        return Response({"error": "Only pending payments can be cancelled"}, status=status.HTTP_400_BAD_REQUEST)
    
    payment.status = 'Cancelled'
    payment.save()
    
    SystemLogService.create_log(
        user_id=request.user,
        action="Payment Cancelled",
        status="SUCCESS",
        details=f"Payment {payment_id} cancelled"
    )
    
    return Response({"message": "Payment cancelled successfully"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_details(request, payment_id):
    """GetPaymentDetails() - Get payment details"""
    try:
        payment = Payment.objects.get(payment_id=payment_id)
        # Check if user has access to this payment
        if payment.user_id != request.user and payment.recipient_id != request.user:
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Payment.DoesNotExist:
        return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)


# TRANSACTION OPERATIONS - CLASS 22
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transaction_details(request, transaction_id):
    """GetTransactionDetails() - Get transaction details"""
    try:
        transaction = Transaction.objects.get(transaction_id=transaction_id)
        if transaction.user_id != request.user:
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Transaction.DoesNotExist:
        return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_transactions(request):
    """Get all transactions for authenticated user"""
    transactions = Transaction.objects.filter(user_id=request.user).order_by('-created_at')
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# RECEIPT OPERATIONS - CLASS 25
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_receipt_details(request, receipt_id):
    """GetReceiptDetails() - Get receipt details"""
    try:
        receipt = Receipt.objects.get(receipt_id=receipt_id)
        if receipt.user_id != request.user:
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ReceiptSerializer(receipt)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Receipt.DoesNotExist:
        return Response({"error": "Receipt not found"}, status=status.HTTP_404_NOT_FOUND)


# NOTIFICATION OPERATIONS - CLASS 28
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Get all notifications for authenticated user"""
    notifications = Notification.objects.filter(user_id=request.user).order_by('-sent_at')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# SERVICE FEE CALCULATOR - CLASS 19
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def calculate_fee(request):
    """CalculateFee() - Calculate service fee for an amount"""
    amount = request.query_params.get('amount')
    
    if not amount:
        return Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        fee = ServiceFeeCalculatorService.calculate_fee(amount)
        return Response({
            "amount": float(amount),
            "serviceFee": fee,
            "totalAmount": float(amount) + fee
        }, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_fee_rules(request):
    """UpdateFeeRules() - Update fee rules (admin only)"""
    if request.user.role != 'admin':
        return Response({"error": "Only admins can update fee rules"}, status=status.HTTP_403_FORBIDDEN)
    
    fee_percentage = request.data.get('feePercentage')
    minimum_fee = request.data.get('minimumFee')
    maximum_fee = request.data.get('maximumFee')
    
    if not all([fee_percentage, minimum_fee, maximum_fee]):
        return Response({"error": "All fee parameters are required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        calculator = ServiceFeeCalculatorService.update_fee_rules(
            float(fee_percentage),
            float(minimum_fee),
            float(maximum_fee)
        )
        return Response({
            "message": "Fee rules updated successfully",
            "feePercentage": float(calculator.fee_percentage),
            "minimumFee": float(calculator.minimum_fee),
            "maximumFee": float(calculator.maximum_fee)
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# USER PROFILE
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """Get authenticated user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)
