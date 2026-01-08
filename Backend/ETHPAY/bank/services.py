from decimal import Decimal
from django.contrib.auth.hashers import check_password, make_password
from .models import BankAccount, BankTransaction
from api.models import Payment, Transaction, User, Receipt
from api.services import ServiceFeeCalculatorService, SystemLogService
from django.utils import timezone
import uuid

# Centralised demo account configuration
MERCHANT_EMAIL = "tsion.ugr-8861-16@aau.edu.et"
MERCHANT_ACCOUNT_NUMBER = "200000001"
SERVICE_FEE_ACCOUNT_NUMBER = "900000001"
CUSTOMER_ACCOUNT_NUMBER = "910000001"
CUSTOMER_NAME = "Tsion Alemu"
CUSTOMER_PASSWORD = "00ldfb@B"
CUSTOMER_BALANCE = Decimal("10000000.00")

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

            # Primary customer wallet (requested mock account)
            tsion_user, _ = User.objects.get_or_create(
                email="tsion.alemu.demo@ethpay.local",
                defaults={
                    'full_name': CUSTOMER_NAME,
                    'phone_number': '+251900000000',
                    'role': 'endUser',
                    'status': 'active'
                }
            )
            
            merchant_user, _ = User.objects.get_or_create(
                email=MERCHANT_EMAIL,
                defaults={
                    'full_name': 'ETHO SHOP',
                    'company_name': 'ETHO SHOP',
                    'phone_number': '+251922222222',
                    'role': 'merchant',
                    'status': 'active'
                }
            )

            system_user, _ = User.objects.get_or_create(
                email="ethpay.system@ethpay.local",
                defaults={
                    'full_name': 'ETHPAY Service Vault',
                    'phone_number': '+251933333333',
                    'role': 'admin',
                    'status': 'active'
                }
            )
            
            # Create or update demo accounts
            demo_accounts = [
                {
                    'user': tsion_user,
                    'account_number': CUSTOMER_ACCOUNT_NUMBER,
                    'bank_name': 'EthPay Demo Bank',
                    'account_holder_name': CUSTOMER_NAME,
                    'password': CUSTOMER_PASSWORD,
                    'initial_balance': CUSTOMER_BALANCE
                },
                {
                    'user': merchant_user,
                    'account_number': MERCHANT_ACCOUNT_NUMBER,
                    'bank_name': 'EthPay Demo Bank',
                    'account_holder_name': 'ETHO SHOP',
                    'password': 'merchant123',
                    'initial_balance': Decimal('0.00')
                },
                {
                    'user': system_user,
                    'account_number': SERVICE_FEE_ACCOUNT_NUMBER,
                    'bank_name': 'EthPay Demo Bank',
                    'account_holder_name': 'ETHPAY Service Fees',
                    'password': 'service@123',
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
        1. Deduct from customer account (order amount)
        2. Transfer 98% to merchant settlement account
        3. Route 2% service fee to the system fee account
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
                merchant_account = BankAccount.objects.get(account_number=MERCHANT_ACCOUNT_NUMBER)
            except BankAccount.DoesNotExist:
                print("Merchant account not found, creating demo accounts...")
                BankPaymentService.create_demo_accounts()
                merchant_account = BankAccount.objects.get(account_number=MERCHANT_ACCOUNT_NUMBER)

            # Get service fee account
            try:
                service_account = BankAccount.objects.get(account_number=SERVICE_FEE_ACCOUNT_NUMBER)
            except BankAccount.DoesNotExist:
                print("Service fee account not found, creating demo accounts...")
                BankPaymentService.create_demo_accounts()
                service_account = BankAccount.objects.get(account_number=SERVICE_FEE_ACCOUNT_NUMBER)
            
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
            
            total_deduction = amount  # Customer pays the order total
            merchant_receives = amount - service_fee  # Settlement amount
            print(f"Total deduction (customer pays): {total_deduction}, Type: {type(total_deduction)}")
            print(f"Merchant receives: {merchant_receives}")
            
            # Check customer has sufficient balance
            if customer_account.current_balance < total_deduction:
                return {
                    'success': False,
                    'error': f'Insufficient funds. Need {total_deduction:.2f} ETB, have {customer_account.current_balance:.2f} ETB'
                }
            
            # Step 1: Deduct from customer (order total)
            print(f"Deducting {total_deduction} from customer...")
            customer_account.current_balance -= total_deduction
            customer_account.save()
            
            # Record customer transaction (debit)
            customer_transaction = BankTransaction.objects.create(
                bank_account=customer_account,
                amount=total_deduction,
                transaction_type='debit',
                running_balance=customer_account.current_balance,
                description=f"E-commerce purchase: {amount} ETB (includes 2% fee)",
                status='completed'
            )
            print(f"Customer transaction recorded: {customer_transaction.transaction_id}")
            
            # Step 2: Transfer to merchant (98%)
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

            # Step 3: Move service fee to system account
            print(f"Routing service fee {service_fee} to system account...")
            service_account.current_balance += service_fee
            service_account.save()
            service_transaction = BankTransaction.objects.create(
                bank_account=service_account,
                amount=service_fee,
                transaction_type='credit',
                running_balance=service_account.current_balance,
                description=f"Service fee collected for payment {payment_id}",
                status='completed'
            )
            print(f"Service fee transaction recorded: {service_transaction.transaction_id}")
            
            # Create transaction ID
            transaction_id = f"TXN{str(uuid.uuid4())[:8].upper()}"

            # Try to synchronise with Payment/Transaction/Receipt models when payment exists
            payment_obj = None
            try:
                payment_obj = Payment.objects.filter(payment_id=payment_id).first()
            except Exception:
                payment_obj = None

            if payment_obj:
                payment_obj.status = 'Completed'
                payment_obj.processed_at = timezone.now()
                payment_obj.save()

                transaction_record = Transaction.objects.create(
                    payment_id=payment_obj,
                    user_id=payment_obj.user_id,
                    amount=amount,
                    service_fee=service_fee,
                    total_amount=amount,
                    status='Success',
                    completed_at=timezone.now()
                )

                Receipt.objects.create(
                    transaction_id=transaction_record,
                    user_id=payment_obj.user_id,
                    amount=amount,
                    service_fee=service_fee,
                    total_amount=amount
                )
            else:
                transaction_record = None
            
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

            # Log service account movement
            SystemLogService.create_log(
                user_id=service_account.user,
                action="Service Fee Collected",
                status="SUCCESS",
                details=f"Service fee {service_fee:.2f} ETB collected for payment {payment_id}"
            )
            
            result = {
                'success': True,
                'transaction_id': transaction_id,
                'customer_transaction_id': str(customer_transaction.transaction_id),
                'merchant_transaction_id': str(merchant_transaction.transaction_id),
                'service_fee_transaction_id': str(service_transaction.transaction_id),
                'amount': float(amount),
                'service_fee': float(service_fee),
                'total_deducted': float(total_deduction),
                'merchant_received': float(merchant_receives),
                'customer_balance': float(customer_account.current_balance),
                'merchant_balance': float(merchant_account.current_balance),
                'service_account_balance': float(service_account.current_balance),
                'fee_percentage': '2%',
                'transaction_record_id': str(transaction_record.transaction_id) if transaction_record else None,
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
                    account_number=MERCHANT_ACCOUNT_NUMBER
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