import httpx
import json
import time
import sys
import codecs

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

sys.stdout = Logger("test_results_3.log")

BASE_URL = "http://127.0.0.1:8000/api/v1"

def log_step(title, message=""):
    print("\n" + "="*60)
    print(f"📌 BƯỚC: {title}")
    if message:
        print(f"📝 {message}")
    print("="*60)

def test_endpoint(name, method, path, payload=None, params=None):
    print(f"\n[➡] {method} {path}")
    if payload:
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    elif params:
        print(json.dumps(params, indent=2, ensure_ascii=False))
        
    url = f"{BASE_URL}{path}"
    try:
        with httpx.Client() as client:
            if method == "GET":
                response = client.get(url, params=params)
            else:
                response = client.post(url, json=payload)
        
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
    print("🚀 BẮT ĐẦU SIMULATE USER JOURNEY")

    # =====================================================================
    # PHẦN 1: NGƯỜI DÙNG VÃN LAI (GUEST USER)
    # =====================================================================
    log_step("PHẦN 1: NGƯỜI DÙNG VÃN LAI (GUEST USER)", "Không đăng ký, chỉ sử dụng trực tiếp qua UUID thiết bị")
    
    unique_device = f"guest-device-{int(time.time())}"
    
    # 1. Init Session (Khởi tạo phiên)
    log_step("1.1. Guest vào app (Khởi tạo phiên)")
    init_res = test_endpoint("Guest Init", "POST", "/users/init", payload={
        "device_id": unique_device,
        "domain": "place" # Lấy domain place
    })
    
    guest_id = None
    guest_vector = [0.5] * 15
    if init_res and init_res.status_code == 200:
        data = init_res.json()
        guest_id = data.get("user_id")
        guest_vector = data.get("current_vector")
        
    # 2. Lấy Card
    log_step("1.2. Guest lấy danh sách địa điểm (Cards)")
    feed_res = test_endpoint("Guest Lấy Card", "GET", "/feed/cards", params={"type": "place", "limit": 4})
    
    place_ids = []
    if feed_res and feed_res.status_code == 200:
        cards = feed_res.json().get("cards", [])
        place_ids = [c.get("place_id", c.get("id")) for c in cards]
        
    if not place_ids:
        place_ids = [1, 2, 3, 4]
        
    # 3. Vuốt Card
    log_step("1.3. Guest tiến hành vuốt Card")
    now = time.time()
    actions = []
    for i, pid in enumerate(place_ids):
        # Trộn LEFT/RIGHT để thấy vector thay đổi
        direction = "RIGHT" if i % 2 == 0 else "LEFT"
        actions.append({
            "place_id": pid,
            "direction": direction,
            "client_timestamp": now + i * 1.5
        })
        
    if guest_id:
        swipe_res = test_endpoint("Guest Vuốt Card", "POST", "/interactions/swipe-batch", payload={
            "user_id": guest_id,
            "domain": "place",
            "actions": actions
        })
        
        if swipe_res and swipe_res.status_code == 200:
            guest_vector = swipe_res.json().get("updated_vector")
        
    # 4. Lấy Recommendation
    log_step("1.4. Lấy Recommendation dựa trên vector vừa vuốt", f"Vector dùng để gợi ý: {guest_vector[:3]}...")
    test_endpoint("Guest Recommend", "POST", "/recommendations/", payload={
        "user_vector": guest_vector,
        "top_n": 3,
        "domain": "place"
    })
    
    # =====================================================================
    # PHẦN 2: NGƯỜI DÙNG GHI DANH (REGISTERED USER)
    # =====================================================================
    log_step("PHẦN 2: NGƯỜI DÙNG GHI DANH (REGISTERED USER)", "Người dùng đăng ký tài khoản, lưu dữ liệu lâu dài")
    
    timestamp = int(time.time())
    
    # 1. Ghi danh
    log_step("2.1. Tiến hành ghi danh (Register)")
    reg_res = test_endpoint("User Ghi Danh", "POST", "/users/", payload={
        "username": f"real_user_{timestamp}",
        "email": f"user_{timestamp}@example.com",
        "password": "strongpassword123", # Nên kẹp thêm password cho chắc ăn đúng schema
        "device_id": unique_device       # <--- CHÌA KHÓA CHUYỂN SINH NẰM Ở ĐÂY
    })
    
    user_id = None
    if reg_res and reg_res.status_code == 200:
        user_id = reg_res.json().get("id")
        
    # 2. Lấy dữ liệu bản thân lần 1
    log_step("2.2. Lấy dữ liệu bản thân (Lần 1) ngay sau khi đăng ký")
    user_vector = [0.5] * 15
    if user_id:
        profile_res = test_endpoint("Lấy Data Bản Thân 1", "GET", f"/users/{user_id}")
        if profile_res and profile_res.status_code == 200:
            user_vector = profile_res.json().get("place_vector", [0.5] * 15)
    else:
        print("Bỏ qua vì không có user_id hợp lệ")
        
    # 3. Lấy Card
    log_step("2.3. User lấy danh sách địa điểm (Cards)")
    feed_res2 = test_endpoint("User Lấy Card", "GET", "/feed/cards", params={"type": "place", "limit": 4})
    
    place_ids2 = []
    if feed_res2 and feed_res2.status_code == 200:
        cards = feed_res2.json().get("cards", [])
        place_ids2 = [c.get("place_id", c.get("id")) for c in cards]
    if not place_ids2:
        place_ids2 = [5, 6, 7, 8]
        
    # 4. Vuốt Card
    log_step("2.4. User tiến hành vuốt Card", "Sẽ THÍCH (RIGHT) tất cả để vector thay đổi mạnh")
    now_ms = time.time() * 1000 # Test luôn tính năng fix timestamp
    actions2 = []
    for i, pid in enumerate(place_ids2):
        actions2.append({
            "place_id": pid,
            "direction": "RIGHT", 
            "client_timestamp": now_ms + i * 2000
        })
        
    if user_id:
        swipe_res2 = test_endpoint("User Vuốt Card", "POST", "/interactions/swipe-batch", payload={
            "user_id": user_id,
            "domain": "place",
            "actions": actions2
        })
        
        if swipe_res2 and swipe_res2.status_code == 200:
            user_vector = swipe_res2.json().get("updated_vector")
        
    # 5. Recommendation
    log_step("2.5. Lấy Recommendation dựa trên vector mới", f"Vector sau khi vuốt: {user_vector[:3]}...")
    test_endpoint("User Recommend", "POST", "/recommendations/", payload={
        "user_vector": user_vector,
        "top_n": 3,
        "domain": "place"
    })
    
    # 6. Lấy dữ liệu bản thân lần 2
    if user_id:
        log_step("2.6. Lấy dữ liệu bản thân (Lần 2) để chứng minh Database đã được update realtime!")
        test_endpoint("Lấy Data Bản Thân 2", "GET", f"/users/{user_id}")
    
    print("\n✅ HOÀN TẤT SIMULATE USER JOURNEY!")

if __name__ == "__main__":
    main()
