from django.urls import path
from .views import (
    register, login, logout, refresh_token_view,
    view_dashboard, initiate_payment, process_payment,
    cancel_payment, get_payment_details, get_transaction_details,
    get_user_transactions, get_receipt_details, get_notifications,
    calculate_fee, update_fee_rules, get_user_profile
)

urlpatterns = [
    # Authentication
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
    path('auth/refresh/', refresh_token_view, name='refresh-token'),
    
    # User
    path('auth/profile/', get_user_profile, name='user-profile'),
    path('auth/dashboard/', view_dashboard, name='view-dashboard'),
    
    # Payment
    path('payment/initiate/', initiate_payment, name='initiate-payment'),
    path('payment/process/', process_payment, name='process-payment'),
    path('payment/cancel/', cancel_payment, name='cancel-payment'),
    path('payment/<uuid:payment_id>/', get_payment_details, name='get-payment-details'),
    
    # Transaction
    path('transaction/<uuid:transaction_id>/', get_transaction_details, name='get-transaction-details'),
    path('transactions/', get_user_transactions, name='get-user-transactions'),
    
    # Receipt
    path('receipt/<uuid:receipt_id>/', get_receipt_details, name='get-receipt-details'),
    
    # Notifications
    path('notifications/', get_notifications, name='get-notifications'),
    
    # Service Fee
    path('fee/calculate/', calculate_fee, name='calculate-fee'),
    path('fee/update/', update_fee_rules, name='update-fee-rules'),
]
