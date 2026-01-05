from django.core.management.base import BaseCommand
from bank.models import BankAccount
from api.models import User
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Populate demo bank accounts for testing'

    def handle(self, *args, **options):
        # Get or create a demo user
        user, created = User.objects.get_or_create(
            email='demo@ethpay.com',
            defaults={
                'full_name': 'Demo User',
                'password': 'demo123',
                'role': 'endUser',
                'status': 'active'
            }
        )
        
        if created:
            user.set_password('demo123')
            user.save()
        
        # Demo bank accounts
        demo_accounts = [
            {
                'account_number': '100035363',
                'bank_name': 'Commercial Bank of Ethiopia',
                'account_holder_name': 'John Doe',
                'password': 'bank123',
                'initial_balance': 5000.00
            },
            {
                'account_number': '100035364',
                'bank_name': 'Awash Bank',
                'account_holder_name': 'Jane Smith',
                'password': 'secure456',
                'initial_balance': 2500.00
            },
            {
                'account_number': '100035365',
                'bank_name': 'Dashen Bank',
                'account_holder_name': 'Bob Wilson',
                'password': 'test789',
                'initial_balance': 10000.00
            }
        ]
        
        for acc_data in demo_accounts:
            account, created = BankAccount.objects.get_or_create(
                account_number=acc_data['account_number'],
                defaults={
                    'user': user,
                    'bank_name': acc_data['bank_name'],
                    'account_holder_name': acc_data['account_holder_name'],
                    'password_hash': make_password(acc_data['password']),
                    'current_balance': acc_data['initial_balance']
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created demo account: {acc_data["account_number"]}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Account {acc_data["account_number"]} already exists')
                )
        
        self.stdout.write(
            self.style.SUCCESS('Demo bank accounts populated successfully!')
        )