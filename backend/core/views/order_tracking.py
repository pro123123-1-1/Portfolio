from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from ..models.order import Order
from ..models.order_tracking import OrderStatusHistory
from ..serializers.order_tracking import OrderStatusHistorySerializer, OrderTrackingSerializer

class OrderHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    عرض سجل الطلبات للمستخدم
    """
    serializer_class = OrderTrackingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_farmer:
            # المزارع يرى طلبات مزرعته
            return Order.objects.filter(farm__owner=user)
        
        # المستهلك يرى طلباته
        return Order.objects.filter(consumer=user)
    
    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        """الحصول على التسلسل الزمني للطلب"""
        order = self.get_object()
        history = order.status_history.all()
        serializer = OrderStatusHistorySerializer(history, many=True)
        return Response(serializer.data)

class OrderStatusUpdateView(APIView):
    """
    تحديث حالة الطلب (للمزارعين/المسؤولين)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        
        # التحقق من الصلاحية
        if not (request.user.is_farmer and order.farm.owner == request.user) and not request.user.is_staff:
            return Response(
                {'error': 'ليس لديك صلاحية لتحديث حالة هذا الطلب'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        # التحقق من صحة الحالة
        valid_statuses = [choice[0] for choice in OrderStatusHistory.ORDER_STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'حالة غير صالحة. الخيارات: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # تحديث الحالة
        order.status = new_status
        order.save()
        
        # تسجيل التاريخ
        OrderStatusHistory.objects.create(
            order=order,
            old_status=order.status,  # تم حفظها قبل التحديث
            new_status=new_status,
            changed_by=request.user,
            notes=notes
        )
        
        return Response({
            'message': 'تم تحديث حالة الطلب بنجاح',
            'new_status': new_status,
            'order_id': order.id
        })
