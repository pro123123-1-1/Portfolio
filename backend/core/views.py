from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Q

from .models import User, Farm, Product, Order, OrderItem
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    UserLoginSerializer,
    FarmSerializer,
    ProductSerializer,
    OrderSerializer
)


class HomeView(APIView):
    """
    API Root View - Lists all available endpoints
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        base_url = request.build_absolute_uri('/api/')
        return Response({
            'message': 'Welcome to Dairy Direct API',
            'endpoints': {
                'authentication': {
                    'register': f'{base_url}auth/register/',
                    'login': f'{base_url}auth/login/',
                    'profile': f'{base_url}auth/profile/',
                    'verify_token': f'{base_url}auth/verify/',
                    'token_refresh': f'{base_url}auth/token/refresh/',
                    'token_verify': f'{base_url}auth/token/verify/',
                },
                'resources': {
                    'farms': f'{base_url}farms/',
                    'products': f'{base_url}products/',
                    'orders': f'{base_url}orders/',
                },
                'admin': {
                    'admin_panel': request.build_absolute_uri('/admin/'),
                }
            },
            'documentation': 'Visit /api/ to see all available endpoints'
        })


class UserRegistrationView(APIView):
    """
    User Registration View
    Allows users to register as consumer, farmer, or both
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            user_data = UserSerializer(user).data
            
            return Response({
                'message': 'User registered successfully',
                'user': user_data,
                'role': user_data.get('role', 'consumer'),
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    """
    User Login View
    Supports login with email or username (like YouTube)
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data.get('email')
        username = serializer.validated_data.get('username')
        password = serializer.validated_data.get('password')
        
        # Try to authenticate with email or username
        user = None
        if email:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                pass
        
        if not user and username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                pass
        
        if user and user.check_password(password):
            # Update last login
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            user_data = UserSerializer(user).data
            
            return Response({
                'message': 'Login successful',
                'user': user_data,
                'role': user_data.get('role', 'consumer'),
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)


class UserProfileView(APIView):
    """
    Get current user profile
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyTokenView(APIView):
    """
    Verify JWT token and return user info
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({
            'valid': True,
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)


# Farm Views
class FarmViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Farm operations
    Only farmers can create/update their own farms
    All users can view farms
    """
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Farm.objects.all()
        # Allow filtering by owner
        owner_id = self.request.query_params.get('owner', None)
        if owner_id:
            queryset = queryset.filter(owner_id=owner_id)
        return queryset
    
    def perform_create(self, serializer):
        # Only farmers can create farms
        if not self.request.user.is_farmer:
            raise permissions.PermissionDenied(
                "Only farmers can create farms"
            )
        # User can have multiple farms, so no need to check
        serializer.save(owner=self.request.user)
    
    def perform_update(self, serializer):
        # Only farm owner can update
        if serializer.instance.owner != self.request.user:
            raise permissions.PermissionDenied(
                "You can only update your own farm"
            )
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only farm owner can delete
        if instance.owner != self.request.user:
            raise permissions.PermissionDenied(
                "You can only delete your own farm"
            )
        instance.delete()


# Product Views
class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product operations
    Only farm owners can create/update products
    All users (including farmers) can view and buy products
    """
    queryset = Product.objects.filter(is_available=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_available=True)
        # Allow filtering by farm
        farm_id = self.request.query_params.get('farm', None)
        if farm_id:
            queryset = queryset.filter(farm_id=farm_id)
        return queryset
    
    def perform_create(self, serializer):
        # Only farmers can create products
        if not self.request.user.is_farmer:
            raise permissions.PermissionDenied(
                "Only farmers can create products"
            )
        # Check if user has at least one farm
        if not self.request.user.farms.exists():
            raise permissions.PermissionDenied(
                "You must create a farm first"
            )
        # Use the first farm (or you can let user choose)
        serializer.save(farm=self.request.user.farms.first())
    
    def perform_update(self, serializer):
        # Only farm owner can update
        if serializer.instance.farm.owner != self.request.user:
            raise permissions.PermissionDenied(
                "You can only update products from your own farm"
            )
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only farm owner can delete
        if instance.farm.owner != self.request.user:
            raise permissions.PermissionDenied(
                "You can only delete products from your own farm"
            )
        instance.is_available = False
        instance.save()


# Order Views
class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Order operations
    All authenticated users (including farmers) can create orders
    Users can only view their own orders
    Farmers can view orders for their farms
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Users see their own orders
        # Farmers also see orders for their farms
        if user.is_farmer and user.farms.exists():
            return Order.objects.filter(
                Q(consumer=user) | Q(farm__in=user.farms.all())
            )
        return Order.objects.filter(consumer=user)
    
    def perform_create(self, serializer):
        # All authenticated users can create orders (including farmers)
        serializer.save(consumer=self.request.user)
