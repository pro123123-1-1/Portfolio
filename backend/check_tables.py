import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dairy_direct.settings")
django.setup()

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"Tables found: {tables}")
        
        if 'farms' in tables:
            print("Table 'farms' exists.")
        else:
            print("Table 'farms' does NOT exist.")
except Exception as e:
    print(f"Error checking tables: {e}")
