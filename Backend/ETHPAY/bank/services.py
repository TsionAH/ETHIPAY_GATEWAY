from decimal import Decimal
from django.contrib.auth.hashers import check_password, make_password
from .models import BankAccount, BankTransaction
from api.models import Payment, Transaction, User
from api.services import ServiceFeeCalculatorService, SystemLogService
from django.utils import timezone
import uuid

class BankPaymentService:
    """Service for processing bank payments with fee distribution"""
    
    @staticmethod
    def verify_account(account_number, password):
        """Verify bank account credentials"""
        try:
            account = BankAccount.objects.get(
                account_number=account_number,
                is_active=True
            )
            
            # Verify password
            if check_password(password, account.password_hash) or password == account.password_hash:
                return {
                    'verified': True,
                    'account': account,
                    'balance': float(account.current_balance)  # Convert to float for JSON
                }
            else:
                return {
                    'verified': False,
                    'error': 'Invalid credentials'
                }
                
        except BankAccount.DoesNotExist:
            return {
                'verified': False,
                'error': 'Account not found'
            }
        except Exception as e:
            return {
                'verified': False,
                'error': str(e)
            }
    
    @staticmethod
    def create_demo_accounts():
        """Create demo accounts for testing"""
        try:
            # Create or get demo users
            from api.models import User
            customer_user, _ = User.objects.get_or_create(
                email="customer@demo.com",
                defaults={
                    'full_name': 'Demo Customer',
                    'phone_number': '+251911111111',
                    'role': 'endUser',
                    'status': 'active'
                }
            )
            
            merchant_user, _ = User.objects.get_or_create(
                email="merchant@shop.com",
                defaults={
                    'full_name': 'Demo Merchant Shop',
                    'company_name': 'Demo E-commerce Store',
                    'phone_number': '+251922222222',
                    'role': 'merchant',
                    'status': 'active'
                }
            )
            
            # Create or update demo accounts
            demo_accounts = [
                {
                    'user': customer_user,
                    'account_number': '100035366',
                    'bank_name': 'Demo Bank',
                    'account_holder_name': 'Demo Customer',
                    'password': 'customer123',
                    'initial_balance': Decimal('10000.00')
                },
                {
                    'user': merchant_user,
                    'account_number': '200000001',
                    'bank_name': 'Demo Bank',
                    'account_holder_name': 'Demo Merchant Shop',
                    'password': 'merchant123',
                    'initial_balance': Decimal('0.00')
                }
            ]
            
            created_accounts = []
            for account_data in demo_accounts:
                account, created = BankAccount.objects.update_or_create(
                    account_number=account_data['account_number'],
                    defaults={
                        'user': account_data['user'],
                        'bank_name': account_data['bank_name'],
                        'account_holder_name': account_data['account_holder_name'],
                        'password_hash': make_password(account_data['password']),
                        'current_balance': account_data['initial_balance'],
                        'is_active': True
                    }
                )
                created_accounts.append(account)
            
            return created_accounts
            
        except Exception as e:
            print(f"Error creating demo accounts: {e}")
            return []
    
    @staticmethod
    def process_ecommerce_payment(payment_id, account_number, password, amount):
        """
        Process e-commerce payment with fee distribution
        1. Deduct from customer account (amount + 2% fee)
        2. Transfer amount to merchant (98% of original)
        3. EthPay keeps 2% as service fee
        """
        try:
            print("=" * 60)
            print(f"PROCESSING E-COMMERCE PAYMENT")
            print(f"Payment ID: {payment_id}")
            print(f"Account: {account_number}")
            print(f"Amount input: {amount}, Type: {type(amount)}")
            print("=" * 60)
            
            # Verify customer account
            verification = BankPaymentService.verify_account(account_number, password)
            if not verification['verified']:
                return {
                    'success': False,
                    'error': verification['error']
                }
            
            customer_account = verification['account']
            print(f"Customer account found: {customer_account.account_number}")
            print(f"Customer balance: {customer_account.current_balance}, Type: {type(customer_account.current_balance)}")
            
            # Get or create merchant account (your shop)
            try:
                merchant_account = BankAccount.objects.get(account_number='200000001')
            except BankAccount.DoesNotExist:
                print("Merchant account not found, creating demo accounts...")
                BankPaymentService.create_demo_accounts()
                merchant_account = BankAccount.objects.get(account_number='200000001')
            
            print(f"Merchant account: {merchant_account.account_number}")
            print(f"Merchant balance: {merchant_account.current_balance}")
            
            # Ensure amount is Decimal
            if not isinstance(amount, Decimal):
                try:
                    amount = Decimal(str(amount))
                except:
                    return {
                        'success': False,
                        'error': 'Invalid amount format'
                    }
            
            print(f"Amount after conversion: {amount}, Type: {type(amount)}")
            
            # Calculate fees (2%)
            print("Calculating service fee...")
            service_fee = ServiceFeeCalculatorService.calculate_fee(amount)
            print(f"Service fee: {service_fee}, Type: {type(service_fee)}")
            
            # DEBUG: Check if service_fee is Decimal
            if not isinstance(service_fee, Decimal):
                print(f"WARNING: service_fee is {type(service_fee)}, converting to Decimal...")
                service_fee = Decimal(str(service_fee))
                print(f"Service fee after conversion: {service_fee}, Type: {type(service_fee)}")
            
            total_deduction = amount + service_fee  # Both should be Decimal now
            print(f"Total deduction: {total_deduction}, Type: {type(total_deduction)}")
            
            # Check customer has sufficient balance
            if customer_account.current_balance < total_deduction:
                return {
                    'success': False,
                    'error': f'Insufficient funds. Need {total_deduction:.2f} ETB, have {customer_account.current_balance:.2f} ETB'
                }
            
            # Step 1: Deduct from customer (amount + fee)
            print(f"Deducting {total_deduction} from customer...")
            customer_account.current_balance -= total_deduction
            customer_account.save()
            
            # Record customer transaction (debit)
            customer_transaction = BankTransaction.objects.create(
                bank_account=customer_account,
                amount=total_deduction,
                transaction_type='debit',
                running_balance=customer_account.current_balance,
                description=f"E-commerce purchase: {amount} ETB + {service_fee:.2f} ETB fee",
                status='completed'
            )
            print(f"Customer transaction recorded: {customer_transaction.transaction_id}")
            
            # Step 2: Transfer to merchant (original amount - fee)
            merchant_receives = amount - service_fee
            print(f"Transferring {merchant_receives} to merchant...")
            merchant_account.current_balance += merchant_receives
            merchant_account.save()
            
            # Record merchant transaction (credit)
            merchant_transaction = BankTransaction.objects.create(
                bank_account=merchant_account,
                amount=merchant_receives,
                transaction_type='credit',
                running_balance=merchant_account.current_balance,
                description=f"Payment from customer: {amount} ETB (-{service_fee:.2f} ETB fee)",
                status='completed'
            )
            print(f"Merchant transaction recorded: {merchant_transaction.transaction_id}")
            
            # Create transaction ID
            transaction_id = f"TXN{str(uuid.uuid4())[:8].upper()}"
            
            # Log the transaction
            SystemLogService.create_log(
                user_id=customer_account.user,
                action="E-commerce Payment Processed",
                status="SUCCESS",
                details=f"Payment {payment_id}: Customer paid {amount} ETB. Merchant received {merchant_receives:.2f} ETB. Fee: {service_fee:.2f} ETB"
            )
            
            # Also log for merchant
            SystemLogService.create_log(
                user_id=merchant_account.user,
                action="Payment Received from Customer",
                status="SUCCESS",
                details=f"Received {merchant_receives:.2f} ETB from customer {customer_account.account_number} for payment {payment_id}"
            )
            
            result = {
                'success': True,
                'transaction_id': transaction_id,
                'customer_transaction_id': str(customer_transaction.transaction_id),
                'merchant_transaction_id': str(merchant_transaction.transaction_id),
                'amount': float(amount),
                'service_fee': float(service_fee),
                'total_deducted': float(total_deduction),
                'merchant_received': float(merchant_receives),
                'customer_balance': float(customer_account.current_balance),
                'merchant_balance': float(merchant_account.current_balance),
                'fee_percentage': '2%',
                'message': f'Payment successful! Merchant received ETB {merchant_receives:.2f}'
            }
            
            print("=" * 60)
            print("PAYMENT SUCCESSFUL!")
            print(f"Result: {result}")
            print("=" * 60)
            
            return result
            
        except Exception as e:
            print(f"Error in process_ecommerce_payment: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_merchant_dashboard(user):
        """Get merchant dashboard with transactions"""
        try:
            # Get merchant account
            merchant_account = BankAccount.objects.filter(
                user=user,
                user__role='merchant'
            ).first()
            
            if not merchant_account:
                # Try to get by account number
                merchant_account = BankAccount.objects.filter(
                    account_number='200000001'
                ).first()
            
            if not merchant_account:
                return None
            
            # Get recent transactions
            transactions = BankTransaction.objects.filter(
                bank_account=merchant_account
            ).order_by('-created_at')[:50]
            
            # Calculate statistics - ensure all are Decimal
            total_received = Decimal('0.00')
            total_fees = Decimal('0.00')
            
            for tx in transactions:
                if tx.transaction_type == 'credit':
                    total_received += tx.amount
                    # Calculate fee for each transaction
                    try:
                        fee = ServiceFeeCalculatorService.calculate_fee(tx.amount)
                        total_fees += fee
                    except:
                        # If calculation fails, use 2% approximation
                        total_fees += tx.amount * Decimal('0.02')
            
            net_income = total_received - total_fees
            
            return {
                'account': merchant_account,
                'transactions': transactions,
                'statistics': {
                    'total_received': total_received,
                    'total_fees': total_fees,
                    'net_income': net_income,
                    'transaction_count': len(transactions),
                    'current_balance': merchant_account.current_balance
                }
            }
            
        except Exception as e:
            print(f"Error in get_merchant_dashboard: {str(e)}")
            return None
    
    @staticmethod
    def create_bank_account(user, account_data):
        """Create a new bank account"""
        try:
            # Check if account number already exists
            if BankAccount.objects.filter(account_number=account_data['account_number']).exists():
                return {
                    'success': False,
                    'error': 'Account number already exists'
                }
            
            # Create the account
            account = BankAccount.objects.create(
                user=user,
                account_number=account_data['account_number'],
                bank_name=account_data['bank_name'],
                account_holder_name=account_data['account_holder_name'],
                password_hash=make_password(account_data['password']),
                current_balance=account_data['initial_balance'],
                is_active=True
            )
            
            return {
                'success': True,
                'account_id': str(account.account_id),
                'account_number': account.account_number,
                'balance': float(account.current_balance)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }