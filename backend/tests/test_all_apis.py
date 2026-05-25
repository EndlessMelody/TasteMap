import httpx
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_endpoint(name, method, path, payload=None, params=None):
    import sys
    # Đảm bảo in được tiếng Việt trên console Windows
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8') 
    
    print(f"{method} {path}")
    if payload:
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    elif params:
        print(json.dumps(params, indent=2, ensure_ascii=False))
    else:
        print("{}")
        
    url = f"{BASE_URL}{path}"
    try:
        with httpx.Client() as client:
            if method == "GET":
                response = client.get(url, params=params)
            else:
                response = client.post(url, json=payload)
        
        print(f"Status Code: {response.status_code}")
        try:
            # Dùng ensure_ascii=False để hiện tiếng Việt
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        except:
            print(response.text)
        print("-" * 40)
        return response
    except Exception as e:
        print(f"Error testing {name}: {e}")
        return None

def run_all_tests():
    # 1. Health
    with httpx.Client() as client:
        client.get("http://127.0.0.1:8000/health") 

    # 2. Sessions Init → giờ trả về Integer ID
    unique_device = f"test-device-{int(time.time())}"
    init_res = test_endpoint("Session Init", "POST", "/users/init", payload={
        "device_id": unique_device,
        "domain": "place"
    })
    
    user_id = None
    if init_res and init_res.status_code == 200:
        user_id = init_res.json().get("user_id")
        print(f"[CHECK] user_id type: {type(user_id).__name__}, value: {user_id}")
        print("-" * 40)

    # 3. GET /users/{user_id} → kiểm tra vector KHÔNG null (Bug 1 fix)
    if user_id:
        test_endpoint("Get User Profile", "GET", f"/users/{user_id}")

    # 4. Feed Cards
    test_endpoint("Feed Cards", "GET", "/feed/cards", params={"type": "place", "limit": 5})

    # 5. Recommendations
    test_endpoint("Recommendations", "POST", "/recommendations/", payload={
        "user_vector": [0.5] * 15,
        "top_n": 3,
        "domain": "place"
    })

    # 6. Interactions (Swipe Batch) — timestamp bằng Giây (Python style)
    if user_id:
        now_s = time.time()
        test_endpoint("Swipe Batch (seconds)", "POST", "/interactions/swipe-batch", payload={
            "user_id": user_id,
            "domain": "place",
            "actions": [
                {"place_id": 1, "direction": "RIGHT", "client_timestamp": now_s},
                {"place_id": 2, "direction": "LEFT", "client_timestamp": now_s + 0.3}
            ]
        })

    # 7. Swipe Batch với timestamp Mili-giây (JavaScript style) — Bug 3 fix
    if user_id:
        now_ms = time.time() * 1000
        test_endpoint("Swipe Batch (milliseconds)", "POST", "/interactions/swipe-batch", payload={
            "user_id": user_id,
            "domain": "place",
            "actions": [
                {"place_id": 3, "direction": "RIGHT", "client_timestamp": now_ms},
                {"place_id": 4, "direction": "RIGHT", "client_timestamp": now_ms + 200}
            ]
        })

    # 8. User Creation
    test_endpoint("Register User", "POST", "/users/", payload={
        "username": f"testuser_{int(time.time())}",
        "email": f"test_{int(time.time())}@example.com"
    })

    # 9. Verify newly created user has vectors (NOT null)
    reg_res = test_endpoint("Register User 2", "POST", "/users/", payload={
        "username": f"testuser2_{int(time.time())}",
        "email": f"test2_{int(time.time())}@example.com"
    })
    if reg_res and reg_res.status_code == 200:
        new_id = reg_res.json().get("id")
        test_endpoint("Verify New User Vectors", "GET", f"/users/{new_id}")

if __name__ == "__main__":
    run_all_tests()
