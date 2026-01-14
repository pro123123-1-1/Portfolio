from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class OrderStatusHistory(models.Model):
    """
    تتبع تغييرات حالة الطلب عبر الوقت
    """
    ORDER_STATUS_CHOICES = [
        ('pending', 'قيد الانتظار'),
        ('confirmed', 'تم التأكيد'),
        ('preparing', 'قيد التحضير'),
        ('ready', 'جاهز للتسليم'),
        ('shipped', 'تم الشحن'),
        ('delivered', 'تم التوصيل'),
        ('cancelled', 'ملغي'),
    ]
    
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='status_history')
    old_status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, blank=True)
    new_status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES)
    
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True, help_text="ملاحظات إضافية عن التغيير")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'order_status_history'
        verbose_name = 'سجل حالة الطلب'
        verbose_name_plural = 'سجلات حالات الطلبات'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"طلب #{self.order.id}: {self.get_old_status_display()} → {self.get_new_status_display()}"
    
    def get_old_status_display(self):
        """الحالة السابقة بالعربي"""
        status_map = {
            'pending': 'قيد الانتظار',
            'confirmed': 'تم التأكيد',
            'preparing': 'قيد التحضير',
            'ready': 'جاهز للتسليم',
            'shipped': 'تم الشحن',
            'delivered': 'تم التوصيل',
            'cancelled': 'ملغي',
        }
        return status_map.get(self.old_status, self.old_status)
    
    def get_new_status_display(self):
        """الحالة الجديدة بالعربي"""
        status_map = {
            'pending': 'قيد الانتظار',
            'confirmed': 'تم التأكيد',
            'preparing': 'قيد التحضير',
            'ready': 'جاهز للتسليم',
            'shipped': 'تم الشحن',
            'delivered': 'تم التوصيل',
            'cancelled': 'ملغي',
        }
        return status_map.get(self.new_status, self.new_status)
