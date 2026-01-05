# In ETHPAY backend: bank/urls.py
from django.urls import path
from .views import (
    process_bank_payment, verify_bank_account,
    create_demo_accounts, get_bank_accounts,
    bank_payment_page, get_merchant_dashboard,
    create_bank_account
)

urlpatterns = [
    path('process/', process_bank_payment, name='process-bank-payment'),
    path('verify/', verify_bank_account, name='verify-bank-account'),
    path('create-demo/', create_demo_accounts, name='create-demo-accounts'),
    path('create/', create_bank_account, name='create-bank-account'),
    path('accounts/', get_bank_accounts, name='get-bank-accounts'),
    path('merchant/dashboard/', get_merchant_dashboard, name='merchant-dashboard'),
    path('bank-payment/', bank_payment_page, name='bank-payment-page'),
]