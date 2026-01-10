from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)

from .views import (
    HomeView,
    UserRegistrationView,
    UserLoginView,
    UserProfileView,
    VerifyTokenView,
    FarmViewSet,
    ProductViewSet,
    OrderViewSet,
    PaymentViewSet,
    ContactMessageViewSet,
    payment_webhook,
    payment_success,
    payment_failure,
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'farms', FarmViewSet, basename='farm')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'contact', ContactMessageViewSet, basename='contact')

urlpatterns = [
    # Authentication endpoints (like YouTube)
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/login/', UserLoginView.as_view(), name='login'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/verify/', VerifyTokenView.as_view(), name='verify-token'),
    
    # JWT token endpoints
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token-verify'),
    
    # Payment webhook and callbacks
    path('payments/webhook/', payment_webhook, name='payment-webhook'),
    path('payments/success/', payment_success, name='payment-success'),
    path('payments/failure/', payment_failure, name='payment-failure'),
    
    # Include router URLs (farms, products, orders, payments)
    path('', include(router.urls)),
]
