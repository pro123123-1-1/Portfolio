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
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'farms', FarmViewSet, basename='farm')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    # Authentication endpoints (like YouTube)
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/login/', UserLoginView.as_view(), name='login'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/verify/', VerifyTokenView.as_view(), name='verify-token'),
    
    # JWT token endpoints
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token-verify'),
    
    # Include router URLs (farms, products, orders)
    path('', include(router.urls)),
]
