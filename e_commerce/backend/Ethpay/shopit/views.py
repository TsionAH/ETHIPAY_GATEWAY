from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer

@api_view(['GET'])
def product_list(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import json
from django.http import JsonResponse
from .models import Product, Order
from .payment_service import EthPayPaymentService
from .serializers import ProductSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """Create order and initiate payment"""
    try:
        user = request.user
        data = request.data
        
        # Get cart from request or localStorage data
        cart_items = data.get('items', [])
        if not cart_items:
            return Response({'error': 'Cart is empty'}, status=400)
        
        # Calculate total
        total_amount = 0
        items_details = []
        
        for item in cart_items:
            try:
                product = Product.objects.get(id=item['id'])
                quantity = item.get('quantity', 1)
                item_total = product.price * quantity
                total_amount += item_total
                
                items_details.append({
                    'id': str(product.id),
                    'name': product.name,
                    'quantity': quantity,
                    'price': str(product.price),
                    'total': str(item_total)
                })
            except Product.DoesNotExist:
                continue
        
        if total_amount <= 0:
            return Response({'error': 'Invalid order total'}, status=400)
        
        # Create order
        order = Order.objects.create(
            user=user,
            customer_email=data.get('email', user.email),
            customer_name=data.get('name', ''),
            customer_address=data.get('address', ''),
            customer_phone=data.get('phone', ''),
            items=items_details,
            subtotal=total_amount,
            total_amount=total_amount,
            payment_status='pending'
        )
        
        # Prepare data for EthPay
        order_data = {
            'order_id': str(order.order_id),
            'amount': str(total_amount),
            'currency': 'ETB',
            'items': items_details,
            'description': f"Order #{order.order_id}"
        }
        
        customer_data = {
            'email': order.customer_email,
            'name': order.customer_name,
            'phone': order.customer_phone
        }
        
        # Initiate payment with EthPay
        payment_result = EthPayPaymentService.initiate_payment(order_data, customer_data)
        
        if payment_result['success']:
            # Update order with payment ID
            order.payment_id = payment_result['payment_id']
            order.save()
            
            return Response({
                'success': True,
                'order_id': str(order.order_id),
                'payment_id': payment_result['payment_id'],
                'payment_url': payment_result['payment_url'],
                'amount': str(total_amount),
                'message': 'Payment initiated successfully'
            }, status=201)
        else:
            return Response({
                'success': False,
                'error': payment_result['error']
            }, status=400)
            
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def payment_callback(request):
    """Handle payment callback from EthPay"""
    try:
        data = request.data
        payment_id = data.get('payment_id')
        status = data.get('status')
        transaction_id = data.get('transaction_id')
        
        if not payment_id:
            return Response({'error': 'Missing payment_id'}, status=400)
        
        # Find order by payment_id
        try:
            order = Order.objects.get(payment_id=payment_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        
        # Update order status
        status_map = {
            'completed': 'paid',
            'success': 'paid',
            'failed': 'failed',
            'cancelled': 'cancelled'
        }
        
        order.payment_status = status_map.get(status, 'processing')
        order.transaction_id = transaction_id
        order.save()
        
        # TODO: Send confirmation email to customer
        
        return Response({'success': True, 'message': 'Payment status updated'})
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_payment_status(request, payment_id):
    """Check payment status"""
    try:
        order = Order.objects.get(payment_id=payment_id, user=request.user)
        
        # Verify with EthPay
        payment_info = EthPayPaymentService.verify_payment(payment_id)
        
        return Response({
            'order_id': str(order.order_id),
            'payment_id': payment_id,
            'status': order.payment_status,
            'payment_info': payment_info,
            'total_amount': str(order.total_amount)
        })
        
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_bank_payment(request):
    """Process payment with bank account (called from EthPay)"""
    try:
        payment_id = request.data.get('payment_id')
        bank_account = request.data.get('bank_account')
        bank_password = request.data.get('bank_password')
        
        if not all([payment_id, bank_account, bank_password]):
            return Response({'error': 'Missing required fields'}, status=400)
        
        # Find order
        try:
            order = Order.objects.get(payment_id=payment_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        
        # Process bank payment through EthPay
        result = EthPayPaymentService.process_bank_payment(
            payment_id, 
            bank_account, 
            bank_password
        )
        
        if result['success']:
            order.payment_status = 'paid'
            order.transaction_id = result.get('transaction_id')
            order.save()
            
            # Clear user's cart
            # Implement cart clearing logic here
            
            return Response({
                'success': True,
                'message': 'Payment successful',
                'transaction_id': result.get('transaction_id'),
                'order_id': str(order.order_id)
            })
        else:
            order.payment_status = 'failed'
            order.save()
            
            return Response({
                'success': False,
                'error': result.get('error', 'Payment failed')
            }, status=400)
            
    except Exception as e:
        return Response({'error': str(e)}, status=500)