from rest_framework import serializers
from .models import BankAccount, BankTransaction

class BankAccountSerializer(serializers.ModelSerializer):
    account_id = serializers.UUIDField(read_only=True)
    current_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = BankAccount
        fields = [
            'account_id', 
            'account_number', 
            'bank_name', 
            'account_holder_name',
            'current_balance',
            'is_active',
            'created_at'
        ]
        read_only_fields = ['account_id', 'created_at', 'current_balance']

class BankTransactionSerializer(serializers.ModelSerializer):
    transaction_id = serializers.UUIDField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = BankTransaction
        fields = [
            'transaction_id',
            'bank_account',
            'payment',
            'amount',
            'transaction_type',
            'running_balance',
            'description',
            'status',
            'created_at'
        ]
        read_only_fields = ['transaction_id', 'created_at']