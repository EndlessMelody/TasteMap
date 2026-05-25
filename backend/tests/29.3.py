import httpx
import json
import time
import sys

# Override sys.stdout to output to both console and file in utf-8
class Logger(object):
    def __init__(self, filename):
        self.terminal = sys.stdout
        self.log = open(filename, "w", encoding="utf-8")
        if hasattr(self.terminal, 'reconfigure'):
            self.terminal.reconfigure(encoding='utf-8')

    def write(self, message):
        self.terminal.write(message)
        self.log.write(message)

    def flush(self):
        self.terminal.flush()
        self.log.flush()

sys.stdout = Logger("test_super_journey.log")

BASE_URL = "http://127.0.0.1:8000/api/v1"

def log_step(title, message=""):
    print("\n" + "="*70)
    print(f"📌 BƯỚC: {title}")
    if message:
        print(f"📝 {message}")
    print("="*70)

# NÂNG CẤP: Thêm tham số headers để truyền JWT Token
def test_endpoint(name, method, path, payload=None, params=None, headers=None):
    print(f"\n[➡] {method} {path}")
    if headers:
        print(f"[Headers] Authorization: {headers.get('Authorization', 'None')[:20]}...")
    if payload:
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    elif params:
        print(json.dumps(params, indent=2, ensure_ascii=False))
        
    url = f"{BASE_URL}{path}"
    try:
        with httpx.Client() as client:
            if method == "GET":
                response = client.get(url, params=params, headers=headers)
            elif method == "POST":
                response = client.post(url, json=payload, headers=headers)
            elif method == "PATCH":
                response = client.patch(url, json=payload, headers=headers)
            elif method == "DELETE":
                response = client.delete(url, headers=headers)
        
        print(f"\n[⬅] Status Code: {response.status_code}")
        try:
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        except:
            print(response.text)
        print("-" * 60)
        return response
    except Exception as e:
        print(f"Error testing {name}: {e}")
        return None

def main():
    print("🚀 BẮT ĐẦU SUPER USER JOURNEY (TEST FULL MODULES LÕI)")
    timestamp = int(time.time())
    
    # Biến toàn cục lưu trữ trạng thái hành trình
    auth_headers = {}
    user_id = None
    location_id = None
    group_id = None
    tour_id = None

    # =====================================================================
    # 1. AUTH & PROFILE (Module 1 & 2)
    # =====================================================================
    log_step("PHẦN 1: AUTH & PROFILE", "Đăng ký, Đăng nhập lấy Token và Update Profile")
    
    # 1.1 Ghi danh
    test_endpoint("Register", "POST", "/users/", payload={
        "username": f"foodie_{timestamp}",
        "email": f"foodie_{timestamp}@example.com",
        "password": "strongpassword123"
    })
    
    # 1.2 Đăng nhập lấy JWT Token (MỚI)
    login_res = test_endpoint("Login", "POST", "/auth/login", payload={
        "email": f"foodie_{timestamp}@example.com",
        "password": "strongpassword123"
    })
    
    if login_res and login_res.status_code == 200:
        data = login_res.json()
        user_id = data.get("user_id")
        # Gán LUÔN 2 kiểu cho chắc ăn (vừa X-User-ID, vừa Authorization)
        auth_headers = {
            "X-User-ID": str(user_id),
            "Authorization": f"Bearer {data.get('access_token', '')}"
        }
    
    # 1.3 Cập nhật Profile (MỚI - PATCH)
    test_endpoint("Update Profile", "PATCH", "/users/me", headers=auth_headers, payload={
        "display_name": "Foodie Chúa Tể",
        "bio": "Không cay không về!",
        "location": "Làng Đại Học, Thủ Đức"
    })

    # =====================================================================
    # 2. LOCATIONS & FEED (Module 3 & 4)
    # =====================================================================
    log_step("PHẦN 2: LOCATIONS & FEED", "Tạo địa điểm mới và quét thẻ xung quanh")
    
    # 2.1 Tạo địa điểm (Admin/User quyền cao)
    loc_res = test_endpoint("Create Location", "POST", "/locations/", headers=auth_headers, payload={
        "name": "Bún Bò Làng Đại Học",
        "lat": 10.8700,
        "lng": 106.8000,
        "category": "food",
        "price_range": "35k",
        "characteristics": {"spicy": 0.9, "street_food": 0.8}
    })
    
    if loc_res and loc_res.status_code == 200: # Hoặc 201 tùy Backend code
        location_id = loc_res.json().get("id", 1) # Fallback = 1 nếu lỗi

    # 2.2 Lấy Feed thẻ (Test lật thẻ với lat/lng mới)
    test_endpoint("Get Swipe Cards", "GET", "/feed/cards", params={
        "type": "food",
        "lat": 10.8700,
        "lng": 106.8000,
        "limit": 5
    })

    # =====================================================================
    # 3. NHÓM & MINIMAX AI (Module 7)
    # =====================================================================
    log_step("PHẦN 3: LOBBY & AI MINIMAX", "Tạo phòng, vào phòng và chạy AI trọng tài")
    
    # 3.1 Tạo phòng nhóm
    group_res = test_endpoint("Create Group", "POST", "/groups/", headers=auth_headers, payload={
        "name": "Team Ăn Khuya Chạy Đồ Án",
        "max_spots": 4
    })
    if group_res and group_res.status_code == 200:
        group_id = group_res.json().get("id")

    if group_id:
        # 3.2 Bấm Ready
        test_endpoint("Ready Up", "PATCH", f"/groups/{group_id}/ready", headers=auth_headers, payload={
            "is_ready": True
        })
        
        # 3.3 Chạy AI Minimax Recommend
        test_endpoint("Minimax Recommend", "POST", f"/groups/{group_id}/recommend", headers=auth_headers, payload={
            "domain": "food",
            "lat": 10.8700,
            "lng": 106.8000,
            "meal_slot": "midnight"
        })

    # =====================================================================
    # 4. TOUR BUILDER (Module 8)
    # =====================================================================
    log_step("PHẦN 4: TOUR BUILDER", "Tạo lịch trình Tour đi ăn")
    
    # 4.1 Tạo Tour
    tour_res = test_endpoint("Create Tour", "POST", "/tours/", headers=auth_headers)
    if tour_res and tour_res.status_code == 200:
        tour_id = tour_res.json().get("id")

    if tour_id and location_id:
        # 4.2 Thêm Stop vào Tour
        test_endpoint("Add Tour Stop", "POST", f"/tours/{tour_id}/stops", headers=auth_headers, payload={
            "location_id": location_id,
            "stop_order": 1
        })
        
        # 4.3 Tối ưu hóa Route (Optimize)
        test_endpoint("Optimize Tour", "POST", f"/tours/{tour_id}/optimize", headers=auth_headers, payload={
            "start_lat": 10.8700,
            "start_lng": 106.8000
        })

    # =====================================================================
    # 5. MẠNG XÃ HỘI (Module 9 & 11)
    # =====================================================================
    log_step("PHẦN 5: SOCIAL & GAMIFICATION", "Đăng bài review và lưu Taste Vault")
    
    if location_id:
        # 5.1 Bookmark địa điểm (Taste Vault)
        test_endpoint("Bookmark Place", "POST", "/bookmarks", headers=auth_headers, payload={
            "location_id": location_id
        })
        
        # 5.2 Đăng bài Post Review
        post_res = test_endpoint("Create Post", "POST", "/posts", headers=auth_headers, payload={
            "location_id": location_id,
            "review": "Nước lèo quá xá đỉnh, 10 điểm không có nhưng!",
            "rating": 5.0,
            "tags": ["Street Food", "Spicy"]
        })
        
        # 5.3 Like bài viết vừa tạo
        if post_res and post_res.status_code == 200:
            post_id = post_res.json().get("id")
            test_endpoint("Like Post", "POST", f"/posts/{post_id}/like", headers=auth_headers)

    print("\n✅ HOÀN TẤT SUPER USER JOURNEY!")

if __name__ == "__main__":
    main()