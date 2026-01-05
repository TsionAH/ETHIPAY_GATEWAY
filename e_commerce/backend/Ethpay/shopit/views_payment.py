from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import uuid
import json

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """Create order and initiate payment - SIMPLIFIED VERSION"""
    try:
        user = request.user
        data = request.data
        
        print("Order creation request:", data)
        
        # Generate order ID
        order_id = str(uuid.uuid4())
        payment_id = str(uuid.uuid4())
        
        # Calculate total from items
        items = data.get('items', [])
        total = data.get('total', 0)
        
        # Create payment URL for EthPay
        ethpay_url = "http://localhost:8001"
        
        # For now, return a simple response with redirect URL
        return Response({
            'success': True,
            'message': 'Order created successfully',
            'order_id': order_id,
            'payment_id': payment_id,
            'total': total,
            'payment_url': f"{ethpay_url}/bank-payment?payment_id={payment_id}&amount={total}&order_id={order_id}&merchant=ShopIt%20Store",
            'items': items
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print("Error creating order:", str(e))
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def payment_callback(request):
    """Handle payment callback from EthPay - SIMPLIFIED"""
    return Response({'success': True, 'message': 'Callback received'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_payment_status(request, payment_id):
    """Check payment status - SIMPLIFIED"""
    return Response({
        'payment_id': payment_id,
        'status': 'pending',
        'message': 'Payment status check'
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_bank_payment(request):
    """Process payment with bank account - SIMPLIFIED"""
    return Response({
        'success': True,
        'message': 'Bank payment processed',
        'transaction_id': 'demo-txn-' + str(uuid.uuid4())[:8]
    })