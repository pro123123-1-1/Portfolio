from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from core.models import Farm, Product, Order, OrderItem
from core.serializers import OrderSerializer

User = get_user_model()

class StrictOrderTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create Users
        self.farmer = User.objects.create_user(
            username='farmer', email='farmer@example.com', password='password123', is_farmer=True
        )
        self.consumer = User.objects.create_user(
            username='consumer', email='consumer@example.com', password='password123', is_consumer=True
        )
        
        # Create Farm with Capacity 10
        self.farm = Farm.objects.create(
            owner=self.farmer,
            name='Test Farm',
            daily_capacity=10,
            price_per_kg='10'
        )
        
        # Create Product
        self.product = Product.objects.create(
            farm=self.farm,
            name='Test Product',
            price=10.0,
            stock_quantity=100
        )
        
    def test_daily_capacity_enforcement(self):
        """Test that daily capacity (Total Quantity) is enforced"""
        # 1. Create Order A with Quantity 5 (OK)
        order_data_a = {
            'items': [{'product': self.product, 'quantity': 5, 'price': 10}],
            'consumer': self.consumer,
            'farm': self.farm # Serializer expects this to be populated by validate usually, but let's see
        }
        # We need to simulate the Serializer usage as done in ViewSet
        # Or easier: Create orders directly via logic to fill the DB, then test Serializer validation
        
        # Let's use Serializer directly to test validation logic
        data = {
            'items': [{'product': self.product.id, 'quantity': 5, 'price': 10}],
            'delivery_address': 'Test Address'
        }
        
        # Mock request context with consumer
        self.client.force_authenticate(user=self.consumer)
        
        # Create Order via API (Validation runs here)
        # Note: input expects product ID in items
        # Serializer handles nested items slightly differently in write vs read.
        # OrderSerializer has items = OrderItemSerializer(many=True). 
        # Standard DRF nested write is tricky, but let's assume standard behavior or custom create.
        # The Custom create method we wrote expects `validated_data` which comes from serializer.is_valid()
        
        # Let's bypass API for setup and test specific validation failure.
        
        # Case 1: Order with 5 items. capacity 10. Should pass.
        # Need to construct the payload exactly as the serializer expects.
        # OrderSerializer expects 'items' which is list of OrderItemSerializer.
        # OrderItemSerializer expects 'product'. FK field default is ID.
        
        # Let's test via direct DB manipulation to fill capacity, then try to create one via Serializer validation.
        
        # Day 1: Order 1 (Qty 5)
        o1 = Order.objects.create(consumer=self.consumer, farm=self.farm, status='pending')
        OrderItem.objects.create(order=o1, product=self.product, quantity=5, price=10)
        
        # Day 1: Order 2 (Qty 4) -> Total 9. OK.
        o2 = Order.objects.create(consumer=self.consumer, farm=self.farm, status='confirmed')
        OrderItem.objects.create(order=o2, product=self.product, quantity=4, price=10)
        
        # Try to create Order 3 via Serializer (Qty 2) -> Total 11 > 10. Should Fail.
        serializer_input = {
            'items': [{'product': self.product.id, 'quantity': 2, 'price': 10}]
        }
        serializer = OrderSerializer(data=serializer_input, context={'request': None})
        serializer.initial_data['consumer'] = self.consumer # Hack? No, usually view passes context. 
        # But wait, create() uses 'consumer' from validated_data.
        # Serializer won't have consumer in validated_data unless it's in fields and writable. 
        # OrderSerializer: consumer is readonly? 
        # read_only_fields = [..., 'consumer']
        # Ah, ViewSet `perform_create` sets consumer.
        # So `validate` method doesn't rely on consumer, but `create` does.
        # `validate` accesses `attrs`, which only contains writable fields.
        # Capacity check only needs `items` (to get farm and qty) and DB access.
        
        valid = serializer.is_valid()
        # assert valid is False because capacity exceeded
        # Total today = 5 + 4 = 9.
        # New = 2. Total = 11 > 10.
        
        if valid:
            print("Validation incorrectly passed!")
            # Manually trigger create to see
            # Check validation errors
        else:
            print(f"Validation failed as expected: {serializer.errors}")
            self.assertIn('non_field_errors', serializer.errors)
            # The error we raised in validate() usually goes to non_field_errors
            
        self.assertFalse(valid)
        self.assertIn("Farm daily capacity exceeded", str(serializer.errors))

    def test_status_transitions_forward_only(self):
        """Test strict forward-only status transitions"""
        order = Order.objects.create(consumer=self.consumer, farm=self.farm, status='pending')
        
        # API Client for ViewSet action
        self.client.force_authenticate(user=self.farmer)
        url = f'/api/orders/{order.id}/status/'
        
        # 1. PENDING -> CONFIRMED (OK)
        response = self.client.post(url, {'status': 'confirmed'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, 'confirmed')
        
        # 2. CONFIRMED -> PENDING (FAIL - Backward)
        response = self.client.post(url, {'status': 'pending'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # 3. CONFIRMED -> DELIVERED (OK)
        response = self.client.post(url, {'status': 'delivered'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 4. DELIVERED -> CANCELLED (FAIL - Terminal)
        # Note: logic says delivered transitions to [] (empty).
        response = self.client.post(url, {'status': 'cancelled'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_status_permissions(self):
        """Test that only appropriate users can change status"""
        order = Order.objects.create(consumer=self.consumer, farm=self.farm, status='pending')
        
        # Consumer tries to confirm (FAIL)
        self.client.force_authenticate(user=self.consumer)
        url = f'/api/orders/{order.id}/status/'
        response = self.client.post(url, {'status': 'confirmed'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Consumer cancels PENDING (OK)
        response = self.client.post(url, {'status': 'cancelled'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
