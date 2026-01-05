import requests
import json
from django.conf import settings

class EthPayPaymentService:
    """Service to handle payments with EthPay gateway"""
    
    # Configure these in your Django settings
    ETHPAY_BASE_URL = getattr(settings, 'ETHPAY_BASE_URL', 'http://localhost:8001')
    ETHPAY_API_KEY = getattr(settings, 'ETHPAY_API_KEY', 'ecommerce-secret-key')
    ETHPAY_MERCHANT_ID = getattr(settings, 'ETHPAY_MERCHANT_ID', 'ECOMMERCE_001')
    
    @classmethod
    def initiate_payment(cls, order_data, customer_data):
        """
        Initiate payment with EthPay
        
        Args:
            order_data: {
                'order_id': str,
                'amount': decimal,
                'currency': str,
                'items': list,
                'description': str
            }
            customer_data: {
                'email': str,
                'name': str,
                'phone': str
            }
        """
        try:
            # Prepare payment payload for EthPay
            payment_payload = {
                'amount': str(order_data['amount']),
                'currency': order_data.get('currency', 'ETB'),
                'order_id': str(order_data['order_id']),
                'description': order_data.get('description', 'E-commerce Purchase'),
                'customer': customer_data,
                'merchant_id': cls.ETHPAY_MERCHANT_ID,
                'callback_url': f"{settings.BASE_URL}/api/payment/callback/",  # Your e-commerce callback
                'return_url': f"{settings.FRONTEND_URL}/order-success/",  # Frontend success page
                'cancel_url': f"{settings.FRONTEND_URL}/cart/",  # Frontend cancel page
                'metadata': {
                    'items': order_data.get('items', []),
                    'source': 'ecommerce_shopit'
                }
            }
            
            # Call EthPay initiate payment endpoint
            response = requests.post(
                f"{cls.ETHPAY_BASE_URL}/api/payment/initiate/",
                json=payment_payload,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {cls.ETHPAY_API_KEY}'
                },
                timeout=30
            )
            
            if response.status_code == 200:
                payment_data = response.json()
                return {
                    'success': True,
                    'payment_id': payment_data.get('paymentID'),
                    'payment_url': payment_data.get('payment_url'),  # URL to redirect user
                    'status': payment_data.get('status', 'pending')
                }
            else:
                return {
                    'success': False,
                    'error': f"EthPay API error: {response.status_code} - {response.text}"
                }
                
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f"Network error connecting to EthPay: {str(e)}"
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Payment initiation failed: {str(e)}"
            }
    
    @classmethod
    def verify_payment(cls, payment_id):
        """Verify payment status with EthPay"""
        try:
            response = requests.get(
                f"{cls.ETHPAY_BASE_URL}/api/payment/{payment_id}/",
                headers={
                    'Authorization': f'Bearer {cls.ETHPAY_API_KEY}'
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return None
                
        except Exception as e:
            print(f"Error verifying payment: {str(e)}")
            return None
    
    @classmethod
    def process_bank_payment(cls, payment_id, bank_account, bank_password):
        """
        Process payment using bank account (for EthPay gateway)
        This would be called from EthPay's bank integration
        """
        # This method would be called by EthPay when user enters bank details
        # For now, we'll return a mock response
        return {
            'success': True,
            'transaction_id': f"TXN{payment_id[:8]}",
            'message': 'Payment processed successfully'
        }