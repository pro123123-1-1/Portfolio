from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Q
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import requests
import json
import base64

from .models import User, Farm, Product, Order, OrderItem, Payment, ContactMessage
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    UserLoginSerializer,
    FarmSerializer,
    ProductSerializer,
    OrderSerializer,
    PaymentSerializer,
    ContactMessageSerializer
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


# Payment Views
class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Payment operations
    Users can create payments for their orders
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Users see payments for their own orders
        return Payment.objects.filter(order__consumer=user)
    
    @action(detail=True, methods=['get'], url_path='status')
    def payment_status(self, request, pk=None):
        """
        Get payment status by payment ID
        """
        try:
            payment = self.get_object()
            return Response({
                'payment_id': payment.id,
                'order_id': payment.order.id,
                'status': payment.status,
                'amount': str(payment.amount),
                'payment_method': payment.payment_method
            })
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='order/(?P<order_id>[^/.]+)')
    def payment_by_order(self, request, order_id=None):
        """
        Get payment by order ID
        """
        try:
            order = Order.objects.get(id=order_id, consumer=request.user)
            if hasattr(order, 'payment'):
                payment = order.payment
                return Response(PaymentSerializer(payment).data)
            else:
                return Response(
                    {'error': 'No payment found for this order'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'], url_path='create')
    def create_payment(self, request):
        """
        Create a payment for an order using Moyasar
        Supports: Credit Card, Mada, STC Pay, Apple Pay
        """
        order_id = request.data.get('order_id')
        payment_method = request.data.get('payment_method', 'creditcard')  # creditcard, stcpay, applepay, mada
        
        if not order_id:
            return Response(
                {'error': 'order_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            order = Order.objects.get(id=order_id, consumer=request.user)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if payment already exists
        if hasattr(order, 'payment'):
            payment = order.payment
            if payment.status == 'paid':
                return Response(
                    {'error': 'Order already paid'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Return existing payment URL
            return Response({
                'payment': PaymentSerializer(payment).data,
                'payment_url': payment.payment_url
            })
        
        # Get Moyasar credentials from settings
        moyasar_secret_key = getattr(settings, 'MOYASAR_SECRET_KEY', None)
        moyasar_publishable_key = getattr(settings, 'MOYASAR_PUBLISHABLE_KEY', None)
        
        if not moyasar_secret_key:
            return Response(
                {'error': 'Moyasar API key not configured'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Calculate total amount (order total + shipping)
        shipping = 15  # Fixed shipping cost
        total_amount = float(order.total_amount) + shipping
        
        # Prepare Moyasar payment request
        moyasar_url = 'https://api.moyasar.com/v1/payments'
        
        # Build callback URL with success/failure redirects
        base_url = request.build_absolute_uri('/')
        callback_url = request.build_absolute_uri('/api/payments/webhook/')
        
        # Build description with delivery info
        delivery_info = f" - {order.delivery_city}" if order.delivery_city else ""
        
        # Map payment method to Moyasar source type
        source_type_map = {
            'creditcard': 'creditcard',
            'mada': 'mada',
            'stcpay': 'stcpay',
            'applepay': 'applepay'
        }
        
        source_type = source_type_map.get(payment_method, 'creditcard')
        
        payment_data = {
            'amount': int(total_amount * 100),  # Convert to halalas (cents)
            'currency': 'SAR',
            'description': f'Order #{order.id} - {order.farm.name}{delivery_info}',
            'metadata': {
                'order_id': order.id,
                'user_id': request.user.id,
                'payment_method': payment_method
            },
            'callback_url': callback_url,
            'source': {
                'type': source_type,
            }
        }
        
        # Create basic auth header
        auth_string = f"{moyasar_secret_key}:"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        headers = {
            'Authorization': f'Basic {auth_b64}',
            'Content-Type': 'application/json'
        }
        
        try:
            # Create payment in Moyasar
            response = requests.post(moyasar_url, json=payment_data, headers=headers)
            response.raise_for_status()
            moyasar_response = response.json()
            
            # Get payment URL from response
            payment_url = (
                moyasar_response.get('redirect_url') or 
                moyasar_response.get('source', {}).get('transaction_url') or
                moyasar_response.get('source', {}).get('redirect_url')
            )
            
            # Create payment record
            payment = Payment.objects.create(
                order=order,
                moyasar_payment_id=moyasar_response.get('id'),
                amount=total_amount,
                currency='SAR',
                description=payment_data['description'],
                payment_url=payment_url,
                payment_method=payment_method,
                moyasar_response=moyasar_response,
                status='pending'
            )
            
            return Response({
                'payment': PaymentSerializer(payment).data,
                'payment_url': payment.payment_url,
                'moyasar_publishable_key': moyasar_publishable_key
            }, status=status.HTTP_201_CREATED)
            
        except requests.exceptions.RequestException as e:
            return Response(
                {'error': f'Failed to create payment: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
def payment_webhook(request):
    """
    Webhook endpoint for Moyasar payment callbacks
    """
    try:
        data = json.loads(request.body)
        payment_id = data.get('id')
        status_value = data.get('status')
        
        if not payment_id:
            return Response({'error': 'Payment ID missing'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            payment = Payment.objects.get(moyasar_payment_id=payment_id)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Update payment with latest response
        payment.moyasar_response = data
        
        # Update payment status based on Moyasar response
        if status_value == 'paid':
            payment.status = 'paid'
            payment.paid_at = timezone.now()
            payment.save()
            
            # Update order status
            order = payment.order
            order.status = 'confirmed'
            order.save()
            
        elif status_value == 'failed':
            payment.status = 'failed'
            payment.save()
            
        elif status_value == 'authorized':
            # Payment authorized but not yet captured
            payment.status = 'pending'
            payment.save()
            
        elif status_value in ['refunded', 'voided']:
            payment.status = 'cancelled'
            payment.save()
        
        return Response({'status': 'success'}, status=status.HTTP_200_OK)
        
    except json.JSONDecodeError:
        return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def payment_success(request):
    """
    Payment success callback - redirect from Moyasar
    """
    payment_id = request.query_params.get('id')
    order_id = request.query_params.get('order_id')
    
    if not payment_id and not order_id:
        return Response({'error': 'Payment ID or Order ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        if payment_id:
            payment = Payment.objects.get(moyasar_payment_id=payment_id, order__consumer=request.user)
        else:
            order = Order.objects.get(id=order_id, consumer=request.user)
            payment = order.payment
        
        return Response({
            'success': True,
            'payment_id': payment.id,
            'order_id': payment.order.id,
            'status': payment.status,
            'amount': str(payment.amount)
        })
    except (Payment.DoesNotExist, Order.DoesNotExist):
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def payment_failure(request):
    """
    Payment failure callback - redirect from Moyasar
    """
    payment_id = request.query_params.get('id')
    order_id = request.query_params.get('order_id')
    
    if not payment_id and not order_id:
        return Response({'error': 'Payment ID or Order ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        if payment_id:
            payment = Payment.objects.get(moyasar_payment_id=payment_id, order__consumer=request.user)
        else:
            order = Order.objects.get(id=order_id, consumer=request.user)
            payment = order.payment
        
        return Response({
            'success': False,
            'payment_id': payment.id,
            'order_id': payment.order.id,
            'status': payment.status,
            'error': 'Payment failed or was cancelled'
        })
    except (Payment.DoesNotExist, Order.DoesNotExist):
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)


# Contact Views
class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ContactMessage operations
    Allow anyone to create (POST) without auth
    Only admins can list/retrieve
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
