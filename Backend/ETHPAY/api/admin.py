from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Session, Dashboard, Payment, Transaction, Receipt,
    Notification, WalletIntegration, SystemLog, ServiceFeeCalculator
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name', 'role', 'status', 'created_at')
    list_filter = ('role', 'status', 'created_at')
    search_fields = ('email', 'full_name', 'company_name')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'company_name', 'phone_number')}),
        ('Permissions', {'fields': ('role', 'status', 'is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('created_at', 'date_joined')}),
    )


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'user_id', 'created_at', 'expires_at', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('session_id', 'user_id__email')


@admin.register(Dashboard)
class DashboardAdmin(admin.ModelAdmin):
    list_display = ('dashboard_id', 'user_id', 'role', 'last_updated')
    list_filter = ('role', 'last_updated')
    search_fields = ('user_id__email',)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_id', 'user_id', 'amount', 'currency', 'status', 'created_at')
    list_filter = ('status', 'payment_method', 'currency', 'created_at')
    search_fields = ('payment_id', 'user_id__email', 'recipient_id__email')


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'payment_id', 'user_id', 'amount', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('transaction_id', 'payment_id', 'user_id__email')


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ('receipt_id', 'transaction_id', 'user_id', 'total_amount', 'issued_at', 'receipt_format')
    list_filter = ('receipt_format', 'issued_at')
    search_fields = ('receipt_id', 'transaction_id', 'user_id__email')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('notification_id', 'user_id', 'type', 'status', 'sent_at')
    list_filter = ('type', 'status', 'sent_at')
    search_fields = ('user_id__email', 'message')


@admin.register(WalletIntegration)
class WalletIntegrationAdmin(admin.ModelAdmin):
    list_display = ('api_id', 'provider_name', 'connection_status', 'last_synced_at')
    list_filter = ('connection_status', 'provider_name')


@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ('log_id', 'user_id', 'action', 'status', 'timestamp')
    list_filter = ('status', 'action', 'timestamp')
    search_fields = ('user_id__email', 'action', 'details')
    readonly_fields = ('timestamp',)


@admin.register(ServiceFeeCalculator)
class ServiceFeeCalculatorAdmin(admin.ModelAdmin):
    list_display = ('calculator_id', 'fee_percentage', 'minimum_fee', 'maximum_fee')
