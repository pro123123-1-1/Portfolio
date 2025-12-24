import os
import django
from django.db import connections
from django.db.utils import OperationalError

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dairy_direct.settings")
django.setup()

db_conn = connections['default']
try:
    c = db_conn.cursor()
    print("Connection successful!")
except OperationalError as e:
    print(f"Connection failed: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
