from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator

# Default image placeholder URL
DEFAULT_IMAGE_URL = 'https://www.alyaum.com/uploads/images/2021/07/05/thumbs/350x350/1097681.jpg'


class User(AbstractUser):
    """
    Custom User model that extends Django's AbstractUser.
    Users can have multiple roles: Farmer, Consumer, or both.
    """
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_farmer = models.BooleanField(default=False)
    is_consumer = models.BooleanField(default=True)  # Default to consumer
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.email
    
    def has_farmer_role(self):
        """Check if user has farmer role"""
        return self.is_farmer
    
    def has_consumer_role(self):
        """Check if user has consumer role"""
        return self.is_consumer
    
    def can_browse_and_buy(self):
        """All users (including farmers) can browse and buy"""
        return True
    
    def get_user_role(self):
        """
        Get user role as string
        Returns: 'admin', 'farmer', 'consumer', 'farmer_consumer', or 'admin_farmer_consumer'
        """
        roles = []
        if self.is_superuser or self.is_staff:
            roles.append('admin')
        if self.is_farmer:
            roles.append('farmer')
        if self.is_consumer:
            roles.append('consumer')
        
        if not roles:
            return 'consumer'  # Default
        
        return '_'.join(roles)
    
    def is_admin(self):
        """Check if user is admin"""
        return self.is_superuser or self.is_staff


class Farm(models.Model):
    """
    Farm model - represents a farm owned by a farmer
    """
    TYPE_CHOICES = [
        ('تمور', 'تمور'),
        ('ألبان', 'ألبان'),
        ('خضروات', 'خضروات'),
        ('فواكه', 'فواكه'),
    ]
    
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farms')
    name = models.CharField(max_length=200)  # أسم المزرعة
    description = models.TextField(blank=True)  # وصفال
    location = models.URLField(max_length=500)  # موقع المزرعة (رابط الخريطة)
    administrative_region = models.CharField(max_length=200, blank=True, null=True)  # المنطقة_الإدارية
    governorate = models.CharField(max_length=200, blank=True, null=True)  # المحافظة/الموقع
    type = models.CharField(max_length=100, choices=TYPE_CHOICES, blank=True, null=True)  # النوع
    price_per_kg = models.CharField(max_length=50, blank=True, null=True, help_text="السعر/كجم (مثل: 78 ريال/كجم)")
    phone_number = models.CharField(max_length=15, blank=True)  # رقم التواصل
    image = models.ImageField(upload_to='farms/', blank=True, null=True)  # صورة المزرعة
    image_url = models.TextField(max_length=500, default=DEFAULT_IMAGE_URL, blank=True, null=True)
    daily_capacity = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        blank=True,
        null=True,
        help_text="Maximum number of orders per day"
    )
    
    class Meta:
        db_table = 'farms'
        verbose_name = 'Farm'
        verbose_name_plural = 'Farms'
    
    def __str__(self):
        return f"{self.name} - {self.owner.email}"


class Product(models.Model):
    """
    Product model - products sold by farms
    """
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    stock_quantity = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    unit = models.CharField(max_length=50, default='kg')  # kg, liter, piece, etc.
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    image_url = models.TextField(max_length=500, default=DEFAULT_IMAGE_URL, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.farm.name}"
    
    def is_in_stock(self):
        """Check if product is in stock"""
        return self.stock_quantity > 0 and self.is_available


class Order(models.Model):
    """
    Order model - orders placed by consumers (including farmers acting as consumers)
    """
    ORDER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    consumer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Delivery Information
    delivery_name = models.CharField(max_length=200, blank=True, null=True)  # اسم المستلم
    delivery_phone = models.CharField(max_length=15, blank=True, null=True)  # رقم الجوال للتوصيل
    delivery_address = models.TextField(blank=True, null=True)  # العنوان الكامل
    delivery_city = models.CharField(max_length=100, blank=True, null=True)  # المدينة
    delivery_region = models.CharField(max_length=100, blank=True, null=True)  # المنطقة
    delivery_notes = models.TextField(blank=True, null=True)  # ملاحظات إضافية للتوصيل
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'orders'
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order #{self.id} - {self.consumer.email}"


class OrderItem(models.Model):
    """
    OrderItem model - individual items in an order
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'order_items'
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'
    
    def __str__(self):
        return f"{self.product.name} x{self.quantity}"


class Payment(models.Model):
    """
    Payment model - tracks payments for orders via Moyasar
    """
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('creditcard', 'Credit Card'),
        ('mada', 'Mada'),
        ('stcpay', 'STC Pay'),
        ('applepay', 'Apple Pay'),
    ]
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    moyasar_payment_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='SAR')
    description = models.TextField(blank=True)
    payment_url = models.URLField(max_length=500, blank=True, null=True)
    
    # Moyasar response data
    moyasar_response = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'payments'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment #{self.id} - Order #{self.order.id} - {self.status}"


class ContactMessage(models.Model):
    """
    Model for storing contact form submissions
    """
    SUBJECT_CHOICES = [
        ('general', 'General Inquiry'),
        ('products', 'Product Inquiry'),
        ('farmers', 'Join as Farmer'),
        ('complaint', 'Complaint'),
        ('suggestion', 'Suggestion'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    subject = models.CharField(max_length=20, choices=SUBJECT_CHOICES, default='general')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contact_messages'
        verbose_name = 'Contact Message'
        verbose_name_plural = 'Contact Messages'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} - {self.name}"
