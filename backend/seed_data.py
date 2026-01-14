import os
import django
from django.core.files.uploadedfile import SimpleUploadedFile

# Setup Django if run standalone (though we'll likely pipe it)
import sys

from django.contrib.auth import get_user_model
from core.models import Farm, Product

User = get_user_model()

def seed():
    print("Seeding data...")
    
    # 1. Create Farmer
    farmer_email = "farmer@example.com"
    if not User.objects.filter(email=farmer_email).exists():
        farmer = User.objects.create_user(
            username="farmer1",
            email=farmer_email,
            password="password123",
            is_farmer=True
        )
        print(f"Created Farmer: {farmer.email}")
    else:
        farmer = User.objects.get(email=farmer_email)
        # Ensure is_farmer is true
        if not farmer.is_farmer:
            farmer.is_farmer = True
            farmer.save()
        print(f"Found Farmer: {farmer.email}")

    # 2. Create Farm
    farm_name = "Al-Qassim Dates"
    if not Farm.objects.filter(name=farm_name).exists():
        farm = Farm.objects.create(
            owner=farmer,
            name=farm_name,
            description="Best organic dates in KSA",
            location="https://maps.google.com/?q=26.33,43.95",
            type="تمور",
            daily_capacity=50 # Set capacity
        )
        print(f"Created Farm: {farm.name}")
    else:
        farm = Farm.objects.get(name=farm_name)
        if farm.daily_capacity == 0:
            farm.daily_capacity = 50
            farm.save()
        print(f"Found Farm: {farm.name}")

    # 3. Create Products
    products = [
        {
            "name": "Sukkari Dates",
            "price": 45.00,
            "unit": "kg",
            "description": "Premium Sukkari dates",
            "image_url": "https://images.unsplash.com/photo-1594736797933-d0d69e1e5d3f"
        },
        {
            "name": "Fresh Laban",
            "price": 12.00,
            "unit": "liter",
            "description": "Fresh dairy milk",
            "image_url": "https://images.unsplash.com/photo-1563636619-e9143da7973b"
        },
         {
            "name": "Organic Tomatoes",
            "price": 10.00,
            "unit": "kg",
            "description": "Red juicy tomatoes",
            "image_url": "https://images.unsplash.com/photo-1546470427-e212b7d310a2"
        }
    ]

    for p_data in products:
        if not Product.objects.filter(farm=farm, name=p_data["name"]).exists():
            Product.objects.create(
                farm=farm,
                name=p_data["name"],
                price=p_data["price"],
                unit=p_data["unit"],
                description=p_data["description"],
                image_url=p_data["image_url"],
                stock_quantity=100
            )
            print(f"Created Product: {p_data['name']}")
        else:
            print(f"Product exists: {p_data['name']}")

    # 4. Create Consumer
    consumer_email = "consumer@example.com"
    if not User.objects.filter(email=consumer_email).exists():
        User.objects.create_user(
            username="consumer1",
            email=consumer_email,
            password="password123",
            is_consumer=True
        )
        print(f"Created Consumer: {consumer_email}")
    else:
        print(f"Found Consumer: {consumer_email}")

if __name__ == "__main__":
    seed()
