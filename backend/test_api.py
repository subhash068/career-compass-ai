"""Quick API test for critical endpoints"""
import requests

BASE_URL = "http://localhost:5000"

print("=== Critical Path Testing ===\n")

# Test 1: Health Check
print("1. Testing /status (Health Check)...")
r = requests.get(f"{BASE_URL}/status")
print(f"   Status: {r.status_code}")
print(f"   Response: {r.json()}")
print(f"   [PASS]\n" if r.status_code == 200 else f"   [FAIL]\n")

# Test 2: Get All Skills
print("2. Testing /skills/ (Get All Skills)...")
r = requests.get(f"{BASE_URL}/skills/")
print(f"   Status: {r.status_code}")
if r.status_code == 200:
    skills = r.json()
    print(f"   Skills Count: {len(skills)}")
    print(f"   [PASS]\n" if len(skills) > 0 else f"   [FAIL] (No skills)\n")
else:
    print(f"   Response: {r.text}")
    print(f"   [FAIL]\n")

# Test 3: Get Career Roles
print("3. Testing /career/roles (Get Career Roles)...")
r = requests.get(f"{BASE_URL}/career/roles")
print(f"   Status: {r.status_code}")
if r.status_code == 200:
    roles = r.json()
    print(f"   Roles Count: {len(roles)}")
    print(f"   [PASS]\n" if len(roles) > 0 else f"   [FAIL] (No roles)\n")
else:
    print(f"   Response: {r.text}")
    print(f"   [FAIL]\n")

# Test 4: Get Career Trending
print("4. Testing /career/trending (Get Trending Careers)...")
r = requests.get(f"{BASE_URL}/career/trending")
print(f"   Status: {r.status_code}")
if r.status_code == 200:
    trending = r.json()
    print(f"   Trending Count: {len(trending)}")
    print(f"   [PASS]\n" if len(trending) > 0 else f"   [FAIL] (No trending)\n")
else:
    print(f"   Response: {r.text}")
    print(f"   [FAIL]\n")

print("=== Critical Path Testing Complete ===")
