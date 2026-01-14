from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models.order import Order
from .models.order_tracking import OrderStatusHistory

User = get_user_model()

@receiver(post_save, sender=Order)
def track_order_status_change(sender, instance, created, **kwargs):
    """
    تلقائياً تسجيل تغيير حالة الطلب
    """
    if created:
        # عند إنشاء طلب جديد
        OrderStatusHistory.objects.create(
            order=instance,
            new_status=instance.status,
            notes="تم إنشاء الطلب"
        )
    else:
        # عند تحديث الطلب
        try:
            old_order = Order.objects.get(pk=instance.pk)
            if old_order.status != instance.status:
                OrderStatusHistory.objects.create(
                    order=instance,
                    old_status=old_status,
                    new_status=instance.status,
                    notes=f"تم تغيير الحالة من {old_status} إلى {instance.status}"
                )
        except Order.DoesNotExist:
            pass
