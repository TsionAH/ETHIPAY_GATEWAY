from django.db import models
from decimal import Decimal
import uuid

class Account(models.Model):
    account_number = models.CharField(max_length=20, unique=True)
    owner_name = models.CharField(max_length=100)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    def deduct_amount(self, amount):
        # Ensure amount is Decimal
        if isinstance(amount, float):
            amount = Decimal(str(amount))
        elif isinstance(amount, str):
            amount = Decimal(amount)
        
        self.balance -= amount
        self.save()
    
    def __str__(self):
        return self.account_number

class Transaction(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10)  # debit / credit
    created_at = models.DateTimeField(auto_now_add=True)

class BankAccount(models.Model):
    """Bank account model for payment processing"""
    account_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('api.User', on_delete=models.CASCADE, related_name='bank_accounts')
    account_number = models.CharField(max_length=20, unique=True)
    bank_name = models.CharField(max_length=100)
    account_holder_name = models.CharField(max_length=200)
    password_hash = models.CharField(max_length=255)  # Hashed password
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.account_number} - {self.bank_name}"

class BankTransaction(models.Model):
    """Bank transaction records"""
    transaction_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE)
    payment = models.ForeignKey('api.Payment', on_delete=models.CASCADE, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=[
        ('debit', 'Debit'),
        ('credit', 'Credit')
    ])
    running_balance = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField()
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('reversed', 'Reversed')
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.transaction_id} - {self.transaction_type} {self.amount}"