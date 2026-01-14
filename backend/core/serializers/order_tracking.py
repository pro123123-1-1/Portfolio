from rest_framework import serializers
from ..models.order_tracking import OrderStatusHistory
from ..models.order import Order

class OrderStatusHistorySerializer(serializers.ModelSerializer):
    old_status_display = serializers.CharField(source='get_old_status_display', read_only=True)
    new_status_display = serializers.CharField(source='get_new_status_display', read_only=True)
    changed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderStatusHistory
        fields = [
            'id', 'old_status', 'old_status_display',
            'new_status', 'new_status_display',
            'changed_by_name', 'notes', 'created_at'
        ]
        read_only_fields = fields
    
    def get_changed_by_name(self, obj):
        if obj.changed_by:
            return obj.changed_by.get_full_name() or obj.changed_by.email
        return "النظام"

class OrderTrackingSerializer(serializers.ModelSerializer):
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    current_status_display = serializers.SerializerMethodField()
    estimated_delivery = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'status', 'current_status_display',
            'created_at', 'updated_at',
            'total_amount', 'delivery_address',
            'status_history', 'estimated_delivery'
        ]
    
    def get_current_status_display(self, obj):
        status_map = {
            'pending': 'قيد الانتظار',
            'confirmed': 'تم التأكيد',
            'preparing': 'قيد التحضير',
            'ready': 'جاهز للتسليم',
            'shipped': 'تم الشحن',
            'delivered': 'تم التوصيل',
            'cancelled': 'ملغي',
        }
        return status_map.get(obj.status, obj.status)
    
    def get_estimated_delivery(self, obj):
        # يمكنك إضافة منطق تقدير وقت التوصيل
        from django.utils.timezone import now, timedelta
        if obj.status in ['confirmed', 'preparing']:
            return now() + timedelta(hours=2)
        elif obj.status == 'shipped':
            return now() + timedelta(hours=1)
        return None
