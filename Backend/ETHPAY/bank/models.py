from django.db import models

# Create your models here.
from django.db import models

class Account(models.Model):
    account_number = models.CharField(max_length=20, unique=True)
    owner_name = models.CharField(max_length=100)
    balance = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return self.account_number


class Transaction(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10)  # debit / credit
    created_at = models.DateTimeField(auto_now_add=True)
