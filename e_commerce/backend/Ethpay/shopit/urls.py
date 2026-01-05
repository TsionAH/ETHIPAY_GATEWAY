from django.urls import path
from .views import product_list
from .views_payment import (
    create_order, payment_callback, check_payment_status, 
    process_bank_payment
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('products/', product_list, name='product-list'),
    path('orders/create/', create_order, name='create-order'),
    path('payment/callback/', payment_callback, name='payment-callback'),
    path('payment/status/<str:payment_id>/', check_payment_status, name='check-payment-status'),
    path('payment/bank/', process_bank_payment, name='process-bank-payment'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)