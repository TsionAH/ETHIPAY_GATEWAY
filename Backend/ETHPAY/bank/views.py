from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .services import BankPaymentService
from .models import BankAccount, BankTransaction
from .serializers import BankAccountSerializer, BankTransactionSerializer
from django.shortcuts import render
import uuid

@api_view(['POST'])
@permission_classes([AllowAny])
def process_bank_payment(request):
    """Process e-commerce payment with fee distribution"""
    try:
        print("=" * 50)
        print("E-COMMERCE BANK PAYMENT REQUEST")
        print("Request data:", request.data)
        print("=" * 50)
        
        payment_id = request.data.get('payment_id')
        account_number = request.data.get('account_number')
        password = request.data.get('password')
        amount = request.data.get('amount', '0')
        
        if not all([payment_id, account_number, password, amount]):
            print("Missing required fields")
            return Response({
                'success': False,
                'error': 'Missing required fields: payment_id, account_number, password, amount'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert amount to Decimal
        try:
            amount_decimal = Decimal(str(amount))
        except:
            return Response({
                'success': False,
                'error': 'Invalid amount format'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Process payment with fee distribution
        result = BankPaymentService.process_ecommerce_payment(
            payment_id, account_number, password, amount_decimal
        )
        
        if result['success']:
            print("Payment successful:", result)
            return Response(result, status=status.HTTP_200_OK)
        else:
            print("Payment failed:", result)
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print(f"Exception in process_bank_payment: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_transaction_details(request, transaction_id):
    """Get transaction details by ID or payment ID"""
    try:
        print(f"Looking up transaction: {transaction_id}")
        
        # Try to find by transaction_id first
        try:
            # Check if it's a UUID
            transaction_uuid = uuid.UUID(transaction_id)
            transaction = BankTransaction.objects.filter(transaction_id=transaction_uuid).first()
        except ValueError:
            # Not a UUID, try as string
            transaction = BankTransaction.objects.filter(transaction_id__icontains=transaction_id).first()
        
        if not transaction:
            # Try to find by payment reference
            from api.models import Payment
            
            # Check if it's a payment ID (starts with PAY-)
            if transaction_id.startswith('PAY-'):
                payment = Payment.objects.filter(payment_id=transaction_id).first()
                if payment:
                    transaction = BankTransaction.objects.filter(payment=payment).first()
            else:
                # Try to find by transaction ID pattern (TXN)
                if transaction_id.startswith('TXN'):
                    transaction = BankTransaction.objects.filter(transaction_id__icontains=transaction_id).first()
        
        if transaction:
            # Get related transaction for merchant if this is customer transaction
            merchant_transaction = None
            service_transaction = None
            
            if transaction.transaction_type == 'debit':
                # This is customer debit, find merchant credit
                merchant_transaction = BankTransaction.objects.filter(
                    description__icontains=transaction.bank_account.account_number,
                    transaction_type='credit'
                ).order_by('-created_at').first()
                
                # Find service fee transaction
                service_transaction = BankTransaction.objects.filter(
                    description__icontains='service fee',
                    created_at__gte=transaction.created_at
                ).order_by('-created_at').first()
            
            response_data = {
                'success': True,
                'transaction': {
                    'transaction_id': str(transaction.transaction_id),
                    'payment_id': str(transaction.payment.payment_id) if transaction.payment else None,
                    'account_number': transaction.bank_account.account_number,
                    'account_holder': transaction.bank_account.account_holder_name,
                    'amount': float(transaction.amount),
                    'transaction_type': transaction.transaction_type,
                    'description': transaction.description,
                    'running_balance': float(transaction.running_balance),
                    'status': transaction.status,
                    'created_at': transaction.created_at.isoformat(),
                    'bank_name': transaction.bank_account.bank_name
                }
            }
            
            # Add merchant transaction details if found
            if merchant_transaction:
                response_data['merchant_transaction'] = {
                    'transaction_id': str(merchant_transaction.transaction_id),
                    'amount': float(merchant_transaction.amount),
                    'merchant_received': float(merchant_transaction.amount),
                    'merchant_balance': float(merchant_transaction.running_balance),
                    'description': merchant_transaction.description
                }
                
                # Calculate service fee
                if transaction.transaction_type == 'debit':
                    total_amount = float(transaction.amount)
                    merchant_received = float(merchant_transaction.amount)
                    service_fee = total_amount - merchant_received
                    response_data['fee_breakdown'] = {
                        'total_amount': total_amount,
                        'merchant_received': merchant_received,
                        'service_fee': service_fee,
                        'fee_percentage': f"{(service_fee/total_amount*100):.1f}%"
                    }
            
            # Add service transaction if found
            if service_transaction:
                response_data['service_transaction'] = {
                    'transaction_id': str(service_transaction.transaction_id),
                    'amount': float(service_transaction.amount),
                    'description': service_transaction.description
                }
            
            return Response(response_data)
        else:
            return Response({
                'success': False,
                'error': 'Transaction not found',
                'suggestions': [
                    'Check if the transaction ID is correct',
                    'Make sure the transaction exists in the database',
                    'Try using the payment ID instead'
                ]
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        print(f"Error in get_transaction_details: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_transaction_by_payment_id(request, payment_id):
    """Get transaction details by payment ID"""
    try:
        print(f"Looking up transaction by payment ID: {payment_id}")
        
        from api.models import Payment
        from .models import BankTransaction
        
        # Find payment
        payment = Payment.objects.filter(payment_id=payment_id).first()
        
        if not payment:
            return Response({
                'success': False,
                'error': f'Payment with ID {payment_id} not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Find bank transaction for this payment
        transaction = BankTransaction.objects.filter(payment=payment).first()
        
        if not transaction:
            return Response({
                'success': False,
                'error': f'No bank transaction found for payment {payment_id}'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Find related transactions
        customer_transaction = BankTransaction.objects.filter(
            bank_account__account_number__in=['910000001', '100035366'],
            description__icontains=payment_id,
            transaction_type='debit'
        ).first()
        
        merchant_transaction = BankTransaction.objects.filter(
            bank_account__account_number='200000001',
            description__icontains=payment_id,
            transaction_type='credit'
        ).first()
        
        service_transaction = BankTransaction.objects.filter(
            bank_account__account_number='900000001',
            description__icontains=payment_id,
            transaction_type='credit'
        ).first()
        
        response_data = {
            'success': True,
            'payment': {
                'payment_id': str(payment.payment_id),
                'amount': float(payment.amount),
                'status': payment.status,
                'created_at': payment.created_at.isoformat()
            }
        }
        
        if customer_transaction:
            response_data['customer_transaction'] = {
                'transaction_id': str(customer_transaction.transaction_id),
                'amount': float(customer_transaction.amount),
                'running_balance': float(customer_transaction.running_balance),
                'description': customer_transaction.description
            }
        
        if merchant_transaction:
            response_data['merchant_transaction'] = {
                'transaction_id': str(merchant_transaction.transaction_id),
                'amount': float(merchant_transaction.amount),
                'merchant_received': float(merchant_transaction.amount),
                'merchant_balance': float(merchant_transaction.running_balance),
                'description': merchant_transaction.description
            }
            
            # Calculate fee breakdown
            if customer_transaction and merchant_transaction:
                total_amount = float(customer_transaction.amount)
                merchant_received = float(merchant_transaction.amount)
                service_fee = total_amount - merchant_received
                
                response_data['fee_breakdown'] = {
                    'total_amount': total_amount,
                    'merchant_received': merchant_received,
                    'service_fee': service_fee,
                    'fee_percentage': f"{(service_fee/total_amount*100):.1f}%"
                }
        
        if service_transaction:
            response_data['service_transaction'] = {
                'transaction_id': str(service_transaction.transaction_id),
                'amount': float(service_transaction.amount),
                'description': service_transaction.description
            }
        
        return Response(response_data)
        
    except Exception as e:
        print(f"Error in get_transaction_by_payment_id: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_demo_accounts(request):
    """Create demo accounts for testing"""
    try:
        accounts = BankPaymentService.create_demo_accounts()
        account_info = []
        for account in accounts:
            account_info.append({
                'account_number': account.account_number,
                'account_holder': account.account_holder_name,
                'balance': float(account.current_balance),
                'user_role': account.user.role,
                'user_email': account.user.email
            })
        
        return Response({
            'success': True,
            'message': 'Demo accounts created/updated',
            'accounts': account_info
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_merchant_dashboard(request):
    """Get merchant dashboard with transactions"""
    try:
        dashboard_data = BankPaymentService.get_merchant_dashboard(request.user)
        
        if not dashboard_data:
            return Response({
                'success': False,
                'error': 'No merchant account found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Prepare response
        account = dashboard_data['account']
        transactions = dashboard_data['transactions']
        stats = dashboard_data['statistics']
        
        # Serialize transactions
        transaction_serializer = BankTransactionSerializer(transactions, many=True)
        
        return Response({
            'success': True,
            'account': {
                'account_number': account.account_number,
                'account_holder_name': account.account_holder_name,
                'bank_name': account.bank_name,
                'current_balance': float(account.current_balance)
            },
            'statistics': {
                'total_received': float(stats['total_received']),
                'total_fees': float(stats['total_fees']),
                'net_income': float(stats['net_income']),
                'transaction_count': stats['transaction_count'],
                'current_balance': float(stats['current_balance'])
            },
            'recent_transactions': transaction_serializer.data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_bank_account(request):
    """Verify bank account credentials"""
    account_number = request.data.get('account_number')
    password = request.data.get('password')
    
    if not account_number or not password:
        return Response({'error': 'Account number and password required'}, status=400)
    
    result = BankPaymentService.verify_account(account_number, password)
    
    return Response(result, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_bank_account(request):
    """Create demo bank account for testing"""
    initial_balance = request.data.get('initial_balance', '10000.00')
    
    # Convert to Decimal
    try:
        initial_balance_decimal = Decimal(str(initial_balance))
    except:
        initial_balance_decimal = Decimal('10000.00')
    
    account_data = {
        'account_number': request.data.get('account_number'),
        'password': request.data.get('password', '123456'),
        'bank_name': request.data.get('bank_name', 'Demo Bank'),
        'account_holder_name': request.user.full_name,
        'initial_balance': initial_balance_decimal
    }
    
    result = BankPaymentService.create_bank_account(request.user, account_data)
    
    if result['success']:
        return Response(result, status=201)
    else:
        return Response(result, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_bank_accounts(request):
    """Get user's bank accounts"""
    accounts = BankAccount.objects.filter(user=request.user, is_active=True)
    serializer = BankAccountSerializer(accounts, many=True)
    return Response(serializer.data, status=200)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_recent_transactions(request):
    """Get recent transactions for all accounts"""
    try:
        limit = int(request.GET.get('limit', 10))
        
        transactions = BankTransaction.objects.all().order_by('-created_at')[:limit]
        
        transaction_data = []
        for tx in transactions:
            transaction_data.append({
                'transaction_id': str(tx.transaction_id),
                'account_number': tx.bank_account.account_number,
                'account_holder': tx.bank_account.account_holder_name,
                'amount': float(tx.amount),
                'type': tx.transaction_type,
                'description': tx.description,
                'balance': float(tx.running_balance),
                'created_at': tx.created_at.isoformat(),
                'status': tx.status
            })
        
        return Response({
            'success': True,
            'transactions': transaction_data,
            'count': len(transaction_data)
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def bank_payment_page(request):
    """Serve the bank payment page"""
    context = {
        'payment_id': request.GET.get('payment_id'),
        'amount': request.GET.get('amount'),
        'order_id': request.GET.get('order_id'),
        'merchant': request.GET.get('merchant', 'Shop')
    }
    return render(request, 'bank_payment.html', context)