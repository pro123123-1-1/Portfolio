from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Farm, Product, Order, OrderItem


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User Admin"""
    list_display = ['email', 'username', 'first_name', 'last_name', 
                    'is_farmer', 'is_consumer', 'is_staff', 'date_joined']
    list_filter = ['is_farmer', 'is_consumer', 'is_staff', 'is_superuser']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone_number', 'is_farmer', 'is_consumer')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('email', 'phone_number', 'is_farmer', 'is_consumer')}),
    )


@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    """Farm Admin"""
    list_display = ['name', 'owner', 'location', 'daily_capacity', 'type']
    list_filter = ['type', 'administrative_region']
    search_fields = ['name', 'owner__email', 'location', 'governorate']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Product Admin"""
    list_display = ['name', 'farm', 'price', 'stock_quantity', 'is_available', 'created_at']
    list_filter = ['is_available', 'created_at', 'farm']
    search_fields = ['name', 'farm__name']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Order Admin"""
    list_display = ['id', 'consumer', 'farm', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['consumer__email', 'farm__name']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """OrderItem Admin"""
    list_display = ['id', 'order', 'product', 'quantity', 'price']
    list_filter = ['order__status']
