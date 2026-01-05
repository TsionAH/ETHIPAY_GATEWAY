from django.db import models
from django.utils.text import slugify
# Create your models here.
class Product(models.Model):
    CATEGORY_CHOICES = (
        ('clothing', 'Clothing'),
        ('art', 'Art'),
        ('material', 'Material'),
    )

    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    image = models.ImageField(upload_to='products/')
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES
    )

    def __str__(self):
        return self.name
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
            unique_slug = self.slug
            counter = 1

            # check for uniqueness
            while Product.objects.filter(slug=unique_slug).exists():
                unique_slug = f'{self.slug}-{counter}'
                counter += 1

            self.slug = unique_slug

        super().save(*args, **kwargs)
import uuid
from django.db import models
from django.conf import settings

class Order(models.Model):
    order_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    customer_email = models.EmailField()
    customer_name = models.CharField(max_length=200)
    customer_address = models.TextField()
    customer_phone = models.CharField(max_length=20)
    
    # Cart items as JSON
    items = models.JSONField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Payment integration
    payment_id = models.UUIDField(null=True, blank=True)  # EthPay payment_id
    transaction_id = models.UUIDField(null=True, blank=True)  # EthPay transaction_id
    payment_status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded')
    ])
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order {self.order_id} - {self.customer_email}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_items')
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    @property
    def total(self):
        return self.quantity * self.price