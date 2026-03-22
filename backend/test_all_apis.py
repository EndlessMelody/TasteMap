import httpx
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_endpoint(name, method, path, payload=None, params=None):
    print(f"--- Testing {name} ({method} {path}) ---")
    url = f"{BASE_URL}{path}"
    try:
        with httpx.Client() as client:
            if method == "GET":
                response = client.get(url, params=params)
            else:
                response = client.post(url, json=payload)
        
        print(f"Status Code: {response.status_code}")
        try:
            print("Response:", json.dumps(response.json(), indent=2, ensure_ascii=False))
        except:
            print("Response text:", response.text)
        return response
    except Exception as e:
        print(f"Error testing {name}: {e}")
        return None

def run_all_tests():
    # 1. Health
    with httpx.Client() as client:
        client.get("http://127.0.0.1:8000/health") 

    # 2. Sessions Init
    init_res = test_endpoint("Session Init", "POST", "/users/init", payload={
        "device_id": "test-device-123",
        "domain": "place"
    })
    
    user_id = None
    if init_res and init_res.status_code == 200:
        user_id = init_res.json().get("user_id")

    # 3. Feed Cards
    test_endpoint("Feed Cards", "GET", "/feed/cards", params={"type": "place", "limit": 5})

    # 4. Recommendations
    test_endpoint("Recommendations", "POST", "/recommendations/", payload={
        "user_vector": [0.5] * 15,
        "top_n": 3,
        "domain": "place"
    })

    # 5. Interactions (Swipe Batch)
    if user_id:
        test_endpoint("Swipe Batch", "POST", "/interactions/swipe-batch", payload={
            "user_id": user_id,
            "domain": "place",
            "actions": [
                {"place_id": 1, "direction": "RIGHT", "client_timestamp": time.time()}
            ]
        })

    # 6. User Creation
    test_endpoint("Register User", "POST", "/users/", payload={
        "username": f"testuser_{int(time.time())}",
        "email": f"test_{int(time.time())}@example.com"
    })

if __name__ == "__main__":
    run_all_tests()
