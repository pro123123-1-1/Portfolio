import os
import sys
import time
import psycopg2
from dotenv import load_dotenv

# Force load .env
base_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(base_dir, '.env')
load_dotenv(env_path)

DB_NAME = os.getenv('DATABASE_NAME')
DB_USER = os.getenv('DATABASE_USER')
DB_PASS = os.getenv('DATABASE_PASSWORD')
DB_HOST = os.getenv('DATABASE_HOST')
DB_PORT = os.getenv('DATABASE_PORT')

print("-" * 50)
print(f"Checking environment at: {env_path}")
print(f"DATABASE_NAME: {DB_NAME}")
print(f"DATABASE_USER: {DB_USER}")
# Mask password
masked_pass = f"{DB_PASS[:2]}****{DB_PASS[-2:]}" if DB_PASS and len(DB_PASS) > 4 else "****"
print(f"DATABASE_PASSWORD: {masked_pass}")
print(f"DATABASE_HOST: {DB_HOST}")
print(f"DATABASE_PORT: {DB_PORT}")
print("-" * 50)

if not all([DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT]):
    print("ERROR: Missing one or more environment variables!")
    sys.exit(1)

print("Attempting connection to PostgreSQL...")
start_time = time.time()

try:
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST,
        port=DB_PORT,
        connect_timeout=5
    )
    conn.close()
    end_time = time.time()
    print(f"\nSUCCESS: Connected! (Time taken: {end_time - start_time:.2f}s)")
    
except psycopg2.OperationalError as e:
    print(f"\nCONNECTION FAILED: {e}")
    print("\nTroubleshooting Tips:")
    if "timeout" in str(e).lower():
        print("1. Check Firewall rules (Port 5432).")
        print(f"2. Ensure PostgreSQL is listening on {DB_HOST}.")
    if "authentication" in str(e).lower():
        print("1. Check username/password.")
    if "does not exist" in str(e).lower():
        print(f"1. Database '{DB_NAME}' might not exist. Check pgAdmin.")

except Exception as e:
    print(f"\nAN ERROR OCCURRED: {e}")

print("-" * 50)
