from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.order_tracking import OrderHistoryViewSet, OrderStatusUpdateView

# إنشاء router جديد خاص بالتتبع
tracking_router = DefaultRouter()
tracking_router.register(r'history', OrderHistoryViewSet, basename='order-history')

urlpatterns = [
    # APIs لتتبع الطلبات
    path('', include(tracking_router.urls)),
    
    # تحديث حالة طلب معين
    path('orders/<int:order_id>/update-status/', 
         OrderStatusUpdateView.as_view(), 
         name='update-order-status'),
    
    # التسلسل الزمني للطلب
    path('orders/<int:pk>/timeline/', 
         OrderHistoryViewSet.as_view({'get': 'timeline'}), 
         name='order-timeline'),
]
