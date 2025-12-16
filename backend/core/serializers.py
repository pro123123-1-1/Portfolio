from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Farm, Product, Order, OrderItem


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model - used for user data representation
    Includes role information (Admin, Farmer, Consumer)
    """
    role = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'phone_number', 'is_farmer', 'is_consumer', 'is_staff', 
                  'is_superuser', 'role', 'is_admin', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'is_staff', 'is_superuser']
    
    def get_role(self, obj):
        """Get user role as string"""
        return obj.get_user_role()
    
    def get_is_admin(self, obj):
        """Check if user is admin"""
        return obj.is_admin()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    Supports registering as consumer, farmer, or both
    """
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True,
        label="Confirm Password"
    )
    is_farmer = serializers.BooleanField(required=False, default=False)
    is_consumer = serializers.BooleanField(required=False, default=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 
                  'first_name', 'last_name', 'phone_number', 
                  'is_farmer', 'is_consumer']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate that passwords match"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def validate_email(self, value):
        """Validate that email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def create(self, validated_data):
        """Create a new user"""
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        # Ensure at least one role is selected
        if not validated_data.get('is_farmer') and not validated_data.get('is_consumer'):
            validated_data['is_consumer'] = True
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    Supports login with email or username (like YouTube)
    """
    email = serializers.EmailField(required=False)
    username = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        """Validate that either email or username is provided"""
        email = attrs.get('email')
        username = attrs.get('username')
        
        if not email and not username:
            raise serializers.ValidationError(
                "Either email or username must be provided."
            )
        return attrs


class FarmSerializer(serializers.ModelSerializer):
    """
    Serializer for Farm model
    """
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    owner_name = serializers.CharField(
        source='owner.get_full_name', 
        read_only=True
    )
    
    class Meta:
        model = Farm
        fields = ['id', 'owner', 'owner_email', 'owner_name', 'name', 
                  'description', 'location', 'administrative_region', 
                  'governorate', 'type', 'price_per_kg', 
                  'phone_number', 'image', 'image_url', 
                  'daily_capacity']
        read_only_fields = ['id']


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for Product model
    """
    farm_name = serializers.CharField(source='farm.name', read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'farm', 'farm_name', 'name', 'description', 
                  'price', 'stock_quantity', 'unit', 'image', 'image_url',
                  'is_available', 'created_at']
        read_only_fields = ['id', 'created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for OrderItem model
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']
        read_only_fields = ['id']


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for Order model
    """
    items = OrderItemSerializer(many=True, read_only=True)
    consumer_email = serializers.EmailField(source='consumer.email', read_only=True)
    farm_name = serializers.CharField(source='farm.name', read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'consumer', 'consumer_email', 'farm', 'farm_name', 
                  'status', 'total_amount', 'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
