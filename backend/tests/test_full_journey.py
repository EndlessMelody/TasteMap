"""
test_full_journey.py
=====================
Kịch bản: Chuyến hành trình đầy đủ từ Guest → User → Group → Tour → Social
Bao phủ TOÀN BỘ các API đang có trong hệ thống TasteMap.

Chạy lệnh:
    python tests/test_full_journey.py
(Server phải đang chạy ở http://127.0.0.1:8000)

Luồng kịch bản:
  PHẦN 0  : Health Check
  PHẦN 1  : Guest User — Init Session → Feed → Swipe → Recommend
  PHẦN 2  : Auth — Register (User A, User B) → Login → Me → Profile
  PHẦN 3  : Locations — List → Detail → Create (Admin)
  PHẦN 4  : Interactions — Swipe Batch → History
  PHẦN 5  : Recommendations — Vector-only → Contextual → Rescue Me
  PHẦN 6  : Bookmarks — Add → List → Delete
  PHẦN 7  : Posts (Reviews) — Create → List → Detail → Like → Comment → Delete comment
  PHẦN 8  : Reels — Create → List → Detail → Like → Comment
  PHẦN 9  : Social (Bạn bè) — Send Request → Pending → Accept → List → Delete
  PHẦN 10 : Groups (Lobby nhóm) — Create → List → Join → Ready → Recommend → Leave
  PHẦN 11 : Tours (Food Tour Builder) — Create → Add Stops → Optimize → Status → Delete Stop
  PHẦN 12 : Deals — Create → List → Detail
  PHẦN 13 : Gamification (Badges) — List all → My badges → User badges
  PHẦN 14 : Notifications — List → Mark read → Mark all read
  PHẦN 15 : Settings — Get → Patch
  PHẦN 16 : Media — Upload avatar (multipart)
  PHẦN 17 : Users extras — Top Spots → Update Me
"""

import httpx
import json
import time
import sys
import os

# ─── Logger: ghi ra cả console lẫn file ──────────────────────────────────────
class Logger:
    def __init__(self, filename: str):
        self.terminal = sys.stdout
        self.log = open(filename, "w", encoding="utf-8")
        if hasattr(self.terminal, "reconfigure"):
            self.terminal.reconfigure(encoding="utf-8")

    def write(self, message):
        self.terminal.write(message)
        self.log.write(message)

    def flush(self):
        self.terminal.flush()
        self.log.flush()


LOG_FILE = os.path.join(os.path.dirname(__file__), "test_full_journey.log")
sys.stdout = Logger(LOG_FILE)

BASE_URL = "http://127.0.0.1:8000/api/v1"

# ─── Màu sắc terminal ─────────────────────────────────────────────────────────
GREEN  = ""
RED    = ""
YELLOW = ""
CYAN   = ""
RESET  = ""

# ─── Counters ─────────────────────────────────────────────────────────────────
_pass = 0
_fail = 0
_skip = 0


def _mark(ok: bool):
    global _pass, _fail
    if ok:
        _pass += 1
    else:
        _fail += 1


# ─── In tiêu đề bước ─────────────────────────────────────────────────────────
def log_step(title: str, note: str = ""):
    print(f"\n{'='*70}")
    print(f"📌  {CYAN}{title}{RESET}")
    if note:
        print(f"    {YELLOW}ℹ  {note}{RESET}")
    print("="*70)


# ─── Hàm gọi API cốt lõi ─────────────────────────────────────────────────────
def call(
    name: str,
    method: str,
    path: str,
    *,
    payload: dict = None,
    params: dict = None,
    headers: dict = None,
    files: dict = None,
    data: dict = None,
    expected_status: int = None,
) -> httpx.Response | None:
    """
    Thực hiện HTTP request, in kết quả, cập nhật counter pass/fail.
    - expected_status: nếu None thì chỉ cần 2xx là pass.
    """
    url = f"{BASE_URL}{path}"
    print(f"\n  {CYAN}[➡ {method}]{RESET}  {path}")
    if payload:
        print("  Body:", json.dumps(payload, indent=4, ensure_ascii=False)[:400])
    if params:
        print("  Params:", params)

    try:
        with httpx.Client(timeout=15.0) as client:
            kwargs = dict(params=params, headers=headers or {})
            if method == "GET":
                resp = client.get(url, **kwargs)
            elif method == "POST":
                if files:
                    resp = client.post(url, files=files, data=data, **kwargs)
                else:
                    resp = client.post(url, json=payload, **kwargs)
            elif method == "PATCH":
                resp = client.patch(url, json=payload, **kwargs)
            elif method == "DELETE":
                resp = client.delete(url, **kwargs)
            else:
                resp = client.request(method, url, json=payload, **kwargs)

        # Kiểm tra status
        ok_status = expected_status if expected_status else None
        is_ok = (resp.status_code == ok_status) if ok_status else (resp.status_code < 400)

        status_color = GREEN if is_ok else RED
        print(f"  {status_color}[⬅ {resp.status_code}]{RESET}  {name}")

        try:
            body = resp.json()
            print("  " + json.dumps(body, indent=4, ensure_ascii=False)[:600])
        except Exception:
            print("  ", resp.text[:300])

        print("  " + "-"*66)
        _mark(is_ok)
        return resp

    except Exception as exc:
        print(f"  {RED}[ERROR]{RESET} {name}: {exc}")
        _fail_inc()
        return None


def _fail_inc():
    global _fail
    _fail += 1


def _skip_inc(reason: str = ""):
    global _skip
    _skip += 1
    print(f"  {YELLOW}[SKIP]{RESET} {reason}")


# ═══════════════════════════════════════════════════════════════════════════════
#   MAIN JOURNEY
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    print(f"\n{'🚀 BẮT ĐẦU TEST FULL API JOURNEY':^70}")
    print(f"{'='*70}")

    ts = int(time.time())

    # ─── Shared state ────────────────────────────────────────────────────────
    # User A (nhân vật chính)
    user_a_id: int | None = None
    user_a_token: str | None = None          # Stub: dùng X-User-ID header
    user_a_vector: list = [0.5] * 15

    # User B (bạn bè / thành viên nhóm)
    user_b_id: int | None = None

    # IDs được tạo trong quá trình test
    location_id: int | None = None
    post_id: int | None = None
    comment_id: int | None = None
    reel_id: int | None = None
    reel_comment_id: int | None = None
    bookmark_id: int | None = None
    friendship_id: int | None = None
    group_id: int | None = None
    tour_id: int | None = None
    stop_id: int | None = None
    deal_id: int | None = None
    notif_id: int | None = None

    # ═══ PHẦN 0: HEALTH CHECK ═══════════════════════════════════════════════
    log_step("PHẦN 0: HEALTH CHECK", "Kiểm tra server có đang chạy không")
    call("Health check", "GET", "/health")

    # ═══ PHẦN 1: GUEST USER (Init Session → Feed → Swipe → Recommend) ═══════
    log_step("PHẦN 1: GUEST USER", "Không cần tài khoản, dùng device_id")

    device_id = f"guest-device-{ts}"

    # 1.1 Init session
    guest_res = call("Init Session (Guest)", "POST", "/users/init", payload={
        "device_id": device_id,
        "domain": "place"
    })
    guest_id = None
    if guest_res and guest_res.status_code == 200:
        guest_id = guest_res.json().get("user_id")
        user_a_vector = guest_res.json().get("current_vector", [0.5] * 15)

    # 1.2 Lấy Feed Cards
    feed_res = call("Feed Cards (place)", "GET", "/feed/cards", params={
        "category": "place", "limit": 5,
        "lat": 10.7769, "lng": 106.7009
    })
    place_ids = []
    if feed_res and feed_res.status_code == 200:
        place_ids = [c.get("place_id") or c.get("id") for c in feed_res.json().get("cards", [])]
    if not place_ids:
        place_ids = [1, 2, 3, 4, 5]

    # 1.3 Feed Cards food
    call("Feed Cards (food)", "GET", "/feed/cards", params={
        "category": "food", "limit": 3
    })

    # 1.4 Swipe Batch (Guest)
    now = time.time()
    actions = [
        {"place_id": pid, "direction": "RIGHT" if i % 2 == 0 else "LEFT",
         "client_timestamp": now + i * 1.5}
        for i, pid in enumerate(place_ids[:4])
    ]
    if guest_id:
        swipe_res = call("Swipe Batch (Guest)", "POST", "/interactions/swipe-batch", payload={
            "user_id": guest_id,
            "category": "place",
            "actions": actions
        })
        if swipe_res and swipe_res.status_code == 200:
            user_a_vector = swipe_res.json().get("updated_vector", user_a_vector)

    # 1.5 Recommend (vector-only, Guest)
    call("Recommend vector-only (Guest)", "POST", "/recommendations/", payload={
        "user_vector": user_a_vector,
        "top_n": 3,
        "category": "place"
    })

    # ═══ PHẦN 2: AUTH + USER MANAGEMENT ════════════════════════════════════
    log_step("PHẦN 2: AUTH + USER MANAGEMENT",
             "Đăng ký User A và User B, đăng nhập, xem profile")

    # 2.1 Đăng ký User A (kèm device_id để migrate vector)
    reg_a = call("Register User A", "POST", "/users/", payload={
        "username": f"alice_{ts}",
        "email": f"alice_{ts}@example.com",
        "password": "Password@123",
        "device_id": device_id
    })
    if reg_a and reg_a.status_code == 200:
        user_a_id = reg_a.json().get("id")

    # 2.2 Đăng ký User B
    reg_b = call("Register User B", "POST", "/users/", payload={
        "username": f"bob_{ts}",
        "email": f"bob_{ts}@example.com",
        "password": "Password@123",
    })
    if reg_b and reg_b.status_code == 200:
        user_b_id = reg_b.json().get("id")

    # 2.3 Đăng nhập
    login_res = call("Login (User A)", "POST", "/auth/login", payload={
        "email": f"alice_{ts}@example.com",
        "password": "Password@123"
    })

    # 2.4 Logout
    call("Logout", "POST", "/auth/logout")

    # 2.5 Lấy thông tin /users/me
    if user_a_id:
        me_res = call("GET /users/me", "GET", "/users/me",
                      headers={"X-User-ID": str(user_a_id)})
        if me_res and me_res.status_code == 200:
            user_a_vector = me_res.json().get("place_vector", user_a_vector)

    # 2.6 Xem public profile User A
    if user_a_id:
        call("GET /users/{id}", "GET", f"/users/{user_a_id}")

    # 2.7 Top spots của User A
    if user_a_id:
        call("GET /users/{id}/top-spots", "GET", f"/users/{user_a_id}/top-spots")

    # 2.8 PATCH /users/me (cập nhật profile)
    if user_a_id:
        call("PATCH /users/me", "PATCH", "/users/me", payload={
            "bio": "Mình là Alice, mê ẩm thực Sài Gòn!",
            "city": "Ho Chi Minh"
        }, headers={"X-User-ID": str(user_a_id)})

    # ═══ PHẦN 3: LOCATIONS ══════════════════════════════════════════════════
    log_step("PHẦN 3: LOCATIONS", "Tạo địa điểm, list, lấy chi tiết")

    # 3.1 Create location
    loc_res = call("Create Location (Admin)", "POST", "/locations/", payload={
        "name": f"Quán Cơm Nhà Làm {ts}",
        "category": "food",
        "city": "Ho Chi Minh",
        "address": "123 Nguyễn Trãi, Q.1",
        "lat": 10.7769,
        "lng": 106.7009,
        "price_range": "25k-50k",
        "vector": [0.8, 0.2, 0.6, 0.4, 0.5, 0.7, 0.3, 0.6, 0.5, 0.4,
                   0.7, 0.3, 0.8, 0.5, 0.6]
    }, expected_status=201)
    if loc_res and loc_res.status_code == 201:
        location_id = loc_res.json().get("id")

    # 3.2 List locations
    call("List Locations", "GET", "/locations/", params={
        "category": "food", "city": "Ho Chi Minh", "limit": 5
    })

    # 3.3 List locations với search
    call("List Locations (search)", "GET", "/locations/", params={
        "search": "cơm", "min_rating": 3.0, "limit": 5
    })

    # 3.4 Detail location
    if location_id:
        call("GET Location Detail", "GET", f"/locations/{location_id}")

    # ═══ PHẦN 4: INTERACTIONS ══════════════════════════════════════════════
    log_step("PHẦN 4: INTERACTIONS", "Swipe batch + lịch sử swipe")

    # 4.1 Swipe batch (User A — authenticated)
    if user_a_id:
        place_ids2 = place_ids[:4] if place_ids else [1, 2, 3, 4]
        now2 = time.time()
        actions2 = [
            {"place_id": pid, "direction": "RIGHT",
             "client_timestamp": now2 + i * 2.0}
            for i, pid in enumerate(place_ids2)
        ]
        swipe_res2 = call("Swipe Batch (User A)", "POST", "/interactions/swipe-batch", payload={
            "user_id": user_a_id,
            "category": "place",
            "actions": actions2
        })
        if swipe_res2 and swipe_res2.status_code == 200:
            user_a_vector = swipe_res2.json().get("updated_vector", user_a_vector)

    # 4.2 Lịch sử swipe
    if user_a_id:
        call("Interaction History", "GET", "/interactions/history", params={
            "user_id": user_a_id, "limit": 10
        })

    # 4.3 Lịch sử swipe — filter action RIGHT
    if user_a_id:
        call("Interaction History (RIGHT only)", "GET", "/interactions/history", params={
            "user_id": user_a_id, "action": "RIGHT", "limit": 5
        })

    # ═══ PHẦN 5: RECOMMENDATIONS ════════════════════════════════════════════
    log_step("PHẦN 5: RECOMMENDATIONS", "Vector-only, Contextual (thời tiết + khoảng cách), Rescue Me")

    # 5.1 Recommend vector-only
    call("Recommend vector-only", "POST", "/recommendations/", payload={
        "user_vector": user_a_vector,
        "top_n": 5,
        "category": "place"
    })

    # 5.2 Contextual recommendation
    if user_a_id:
        call("Recommend Contextual", "POST", "/recommendations/contextual", payload={
            "user_id": user_a_id,
            "lat": 10.7769,
            "lng": 106.7009,
            "category": "food",
            "radius_km": 3.0,
            "top_n": 5,
            "time_context": "lunch"
        })

    # 5.3 Rescue Me
    if user_a_id:
        call("Rescue Me", "POST", "/recommendations/rescue-me", payload={
            "user_id": user_a_id,
            "lat": 10.7769,
            "lng": 106.7009,
            "category": "food"
        })

    # ═══ PHẦN 6: BOOKMARKS ══════════════════════════════════════════════════
    log_step("PHẦN 6: BOOKMARKS", "Bookmark / bỏ bookmark địa điểm")

    if user_a_id and location_id:
        # 6.1 Thêm bookmark
        bm_res = call("Add Bookmark", "POST", "/bookmarks/", payload={
            "location_id": location_id
        }, headers={"X-User-ID": str(user_a_id)}, expected_status=201)
        if bm_res and bm_res.status_code == 201:
            bookmark_id = bm_res.json().get("id")

        # 6.2 Danh sách bookmarks
        call("List Bookmarks", "GET", "/bookmarks/",
             headers={"X-User-ID": str(user_a_id)})

        # 6.3 Xóa bookmark
        if bookmark_id:
            call("Delete Bookmark", "DELETE", f"/bookmarks/{bookmark_id}",
                 headers={"X-User-ID": str(user_a_id)})
    else:
        _skip_inc("Cần user_a_id và location_id")

    # ═══ PHẦN 7: POSTS (REVIEWS) ════════════════════════════════════════════
    log_step("PHẦN 7: POSTS (REVIEWS)", "Tạo, list, like, comment, xóa")

    if user_a_id and location_id:
        # 7.1 Tạo bài viết
        post_res = call("Create Post", "POST", "/posts/", payload={
            "location_id": location_id,
            "review": "Quán ngon, phục vụ nhiệt tình! Mình recommend mọi người thử nha 🍜",
            "rating": 4.5,
            "media_urls": []
        }, headers={"X-User-ID": str(user_a_id)}, expected_status=201)
        if post_res and post_res.status_code == 201:
            post_id = post_res.json().get("id")

        # 7.2 List posts (all)
        call("List Posts", "GET", "/posts/", params={"limit": 10})

        # 7.3 List posts của location
        call("List Posts by Location", "GET", "/posts/", params={
            "location_id": location_id, "limit": 5
        })

        # 7.4 Chi tiết post
        if post_id:
            call("GET Post Detail", "GET", f"/posts/{post_id}")

        # 7.5 Like bài viết
        if post_id:
            call("Like Post", "POST", f"/posts/{post_id}/like",
                 headers={"X-User-ID": str(user_a_id)})

        # 7.6 Thêm comment
        if post_id:
            comment_res = call("Add Comment", "POST", f"/posts/{post_id}/comments",
                               payload={"content": "Đồng ý! Tui cũng hay ghé đây 😄"},
                               headers={"X-User-ID": str(user_a_id)})
            if comment_res and comment_res.status_code == 200:
                comment_id = comment_res.json().get("id")

        # 7.7 List comments
        if post_id:
            call("List Comments", "GET", f"/posts/{post_id}/comments")

        # 7.8 Xóa comment
        if comment_id:
            call("Delete Comment", "DELETE", f"/comments/{comment_id}",
                 headers={"X-User-ID": str(user_a_id)})

        # 7.9 Xóa post
        if post_id:
            call("Delete Post", "DELETE", f"/posts/{post_id}",
                 headers={"X-User-ID": str(user_a_id)})
    else:
        _skip_inc("Cần user_a_id và location_id")

    # ═══ PHẦN 8: REELS ══════════════════════════════════════════════════════
    log_step("PHẦN 8: REELS", "Tạo reel, list, like, comment")

    # 8.1 List reels (public)
    call("List Reels (trending)", "GET", "/reels/", params={"sort": "trending", "limit": 5})

    if user_a_id:
        # 8.2 Tạo reel mới
        reel_res = call("Create Reel", "POST", "/reels/", payload={
            "location_id": location_id,
            "video_url": "https://cdn.tastemap.vn/reels/sample.mp4",
            "thumbnail_url": "https://cdn.tastemap.vn/reels/thumb.jpg",
            "title": "Bữa trưa tuyệt vời! #TasteMap #HCMC"
        }, headers={"X-User-ID": str(user_a_id)}, expected_status=201)
        if reel_res and reel_res.status_code == 201:
            reel_id = reel_res.json().get("id")

        # 8.3 Chi tiết reel (tự tăng views)
        if reel_id:
            call("GET Reel Detail", "GET", f"/reels/{reel_id}")

        # 8.4 Like reel
        if reel_id:
            call("Like Reel", "POST", f"/reels/{reel_id}/like",
                 headers={"X-User-ID": str(user_a_id)})

        # 8.5 Comment reel
        if reel_id:
            rc_res = call("Add Reel Comment", "POST", f"/reels/{reel_id}/comments",
                          payload={"content": "Video đẹp quá trời! 🎬"},
                          headers={"X-User-ID": str(user_a_id)})
            if rc_res and rc_res.status_code == 200:
                reel_comment_id = rc_res.json().get("id")

        # 8.6 List reel comments
        if reel_id:
            call("List Reel Comments", "GET", f"/reels/{reel_id}/comments")
    else:
        _skip_inc("Cần user_a_id")

    # ═══ PHẦN 9: SOCIAL (BẠN BÈ) ════════════════════════════════════════════
    log_step("PHẦN 9: SOCIAL – BẠN BÈ", "Gửi lời mời → chờ duyệt → chấp nhận → list → xóa")

    if user_a_id and user_b_id:
        # 9.1 User A gửi lời mời kết bạn cho User B
        req_res = call("Send Friend Request (A→B)", "POST", "/friends/request",
                       payload={"friend_id": user_b_id},
                       headers={"X-User-ID": str(user_a_id)})
        if req_res and req_res.status_code == 200:
            friendship_id = req_res.json().get("id")

        # 9.2 User B xem lời mời đang chờ
        call("Pending Requests (B)", "GET", "/friends/requests",
             headers={"X-User-ID": str(user_b_id)})

        # 9.3 User B chấp nhận
        if friendship_id:
            call("Accept Friend Request", "PATCH", f"/friends/{friendship_id}/accept",
                 headers={"X-User-ID": str(user_b_id)})

        # 9.4 Danh sách bạn bè của A
        call("List Friends (A)", "GET", "/friends/",
             headers={"X-User-ID": str(user_a_id)})

        # 9.5 Hủy kết bạn
        if friendship_id:
            call("Delete Friendship", "DELETE", f"/friends/{friendship_id}",
                 headers={"X-User-ID": str(user_a_id)})
    else:
        _skip_inc("Cần cả user_a_id và user_b_id")

    # ═══ PHẦN 10: GROUPS (LOBBY NHÓM) ══════════════════════════════════════
    log_step("PHẦN 10: GROUPS – LOBBY NHÓM", "Tạo → list → join → ready → Minimax recommend → leave")

    if user_a_id:
        # 10.1 Tạo group
        grp_res = call("Create Group", "POST", "/groups/", payload={
            "name": f"Nhóm ẩm thực {ts}",
            "description": "Nhóm tìm quán ăn sau giờ học",
            "category": "food",
            "max_members": 5
        }, headers={"X-User-ID": str(user_a_id)}, expected_status=201)
        if grp_res and grp_res.status_code == 201:
            group_id = grp_res.json().get("id")

        # 10.2 List groups
        call("List Groups", "GET", "/groups/", params={"status": "active"})

        # 10.3 Chi tiết group
        if group_id:
            call("GET Group Detail", "GET", f"/groups/{group_id}")

        # 10.4 User B tham gia
        if group_id and user_b_id:
            call("Join Group (B)", "POST", f"/groups/{group_id}/join",
                 headers={"X-User-ID": str(user_b_id)})

        # 10.5 A ready
        if group_id:
            call("Set Ready (A)", "PATCH", f"/groups/{group_id}/ready",
                 payload={"is_ready": True},
                 headers={"X-User-ID": str(user_a_id)})

        # 10.6 B ready
        if group_id and user_b_id:
            call("Set Ready (B)", "PATCH", f"/groups/{group_id}/ready",
                 payload={"is_ready": True},
                 headers={"X-User-ID": str(user_b_id)})

        # 10.7 Minimax Recommend cho group
        if group_id:
            recommend_payload = {
                "category": "food",
                "lat": 10.7769,
                "lng": 106.7009,
                "top_n": 3
            }
            call("Group Recommend (Minimax)", "POST", f"/groups/{group_id}/recommend",
                 payload=recommend_payload)

        # 10.8 A rời group
        if group_id:
            call("Leave Group (A)", "POST", f"/groups/{group_id}/leave",
                 headers={"X-User-ID": str(user_a_id)})
    else:
        _skip_inc("Cần user_a_id")

    # ═══ PHẦN 11: TOURS (FOOD TOUR BUILDER) ════════════════════════════════
    log_step("PHẦN 11: TOURS – FOOD TOUR BUILDER", "Tạo tour → thêm stops → tối ưu lộ trình → cập nhật status → xóa stop")

    if user_a_id:
        # 11.1 Tạo tour mới
        tour_res = call("Create Tour", "POST", "/tours/",
                        headers={"X-User-ID": str(user_a_id)},
                        expected_status=201)
        if tour_res and tour_res.status_code == 201:
            tour_id = tour_res.json().get("id")

        # 11.2 List tours của user
        call("List Tours", "GET", "/tours/",
             headers={"X-User-ID": str(user_a_id)})

        # 11.3 Thêm stop 1
        if tour_id and location_id:
            stop_res = call("Add Stop 1", "POST", f"/tours/{tour_id}/stops",
                            payload={
                                "location_id": location_id,
                                "order": 1,
                                "duration_min": 45,
                                "note": "Ăn trưa ở đây"
                            },
                            headers={"X-User-ID": str(user_a_id)})
            if stop_res and stop_res.status_code == 200:
                stop_id = stop_res.json().get("id")

        # 11.4 Thêm stop 2 (nếu có location khác)
        second_loc = (place_ids[0] if place_ids and place_ids[0] != location_id
                      else (location_id + 1 if location_id else 2))
        if tour_id:
            call("Add Stop 2", "POST", f"/tours/{tour_id}/stops",
                 payload={
                     "location_id": second_loc,
                     "order": 2,
                     "duration_min": 30,
                     "note": "Uống cà phê tráng miệng"
                 },
                 headers={"X-User-ID": str(user_a_id)})

        # 11.5 Chi tiết tour + stops
        if tour_id:
            call("GET Tour Detail", "GET", f"/tours/{tour_id}",
                 headers={"X-User-ID": str(user_a_id)})

        # 11.6 Tối ưu lộ trình (A*)
        if tour_id:
            call("Optimize Tour", "POST", f"/tours/{tour_id}/optimize",
                 payload={
                     "start_lat": 10.7769,
                     "start_lng": 106.7009,
                     "optimize_by": "distance"
                 },
                 headers={"X-User-ID": str(user_a_id)})

        # 11.7 Cập nhật status → active
        if tour_id:
            call("Update Tour Status (active)", "PATCH", f"/tours/{tour_id}/status",
                 payload={"status": "active"},
                 headers={"X-User-ID": str(user_a_id)})

        # 11.8 Xóa stop 1
        if tour_id and stop_id:
            call("Delete Stop", "DELETE", f"/tours/{tour_id}/stops/{stop_id}",
                 headers={"X-User-ID": str(user_a_id)})
    else:
        _skip_inc("Cần user_a_id")

    # ═══ PHẦN 12: DEALS ══════════════════════════════════════════════════════
    log_step("PHẦN 12: DEALS", "Tạo deal, list, chi tiết")

    # 12.1 Tạo deal (Admin)
    deal_res = call("Create Deal", "POST", "/deals/", payload={
        "location_id": location_id or 1,
        "title": "Giảm 20% mọi món",
        "description": "Áp dụng từ 11h-14h các ngày trong tuần",
        "discount_type": "percent",
        "discount_value": 20.0,
        "start_date": "2026-04-01",
        "end_date": "2026-04-30",
        "is_sponsored": False
    }, expected_status=201)
    if deal_res and deal_res.status_code == 201:
        deal_id = deal_res.json().get("id")

    # 12.2 List deals (all active)
    call("List Deals", "GET", "/deals/", params={"limit": 10})

    # 12.3 List deals theo location
    if location_id:
        call("List Deals by Location", "GET", "/deals/", params={
            "location_id": location_id
        })

    # 12.4 Chi tiết deal
    if deal_id:
        call("GET Deal Detail", "GET", f"/deals/{deal_id}")

    # ═══ PHẦN 13: GAMIFICATION (BADGES) ════════════════════════════════════
    log_step("PHẦN 13: GAMIFICATION – BADGES", "List badges, badges của tôi, badges user bất kỳ")

    # 13.1 Tất cả badges trong hệ thống
    call("List All Badges", "GET", "/badges/")

    # 13.2 Badges của User A (me) — yêu cầu auth header
    if user_a_id:
        call("My Badges", "GET", "/badges/me",
             headers={"X-User-ID": str(user_a_id)})

    # 13.3 Badges của User B (public)
    if user_b_id:
        call("User B Badges", "GET", f"/badges/{user_b_id}")

    # ═══ PHẦN 14: NOTIFICATIONS ═════════════════════════════════════════════
    log_step("PHẦN 14: NOTIFICATIONS", "List thông báo → mark read → mark all read")

    if user_a_id:
        # 14.1 Danh sách thông báo
        notif_res = call("List Notifications", "GET", "/notifications/",
                         params={"limit": 10},
                         headers={"X-User-ID": str(user_a_id)})
        if notif_res and notif_res.status_code == 200:
            items = notif_res.json().get("items") or notif_res.json().get("notifications", [])
            if items:
                notif_id = items[0].get("id")

        # 14.2 List unread only
        call("List Unread Notifications", "GET", "/notifications/",
             params={"unread_only": True},
             headers={"X-User-ID": str(user_a_id)})

        # 14.3 Mark một thông báo đã đọc
        if notif_id:
            call("Mark Notification Read", "PATCH", f"/notifications/{notif_id}/read",
                 headers={"X-User-ID": str(user_a_id)})

        # 14.4 Mark tất cả đã đọc
        call("Mark All Notifications Read", "PATCH", "/notifications/read-all",
             headers={"X-User-ID": str(user_a_id)})
    else:
        _skip_inc("Cần user_a_id")

    # ═══ PHẦN 15: SETTINGS ══════════════════════════════════════════════════
    log_step("PHẦN 15: SETTINGS", "Lấy cài đặt và cập nhật")

    if user_a_id:
        # 15.1 Lấy settings
        call("GET Settings", "GET", "/settings/",
             headers={"X-User-ID": str(user_a_id)})

        # 15.2 Cập nhật settings (JSONB deep merge)
        call("PATCH Settings", "PATCH", "/settings/",
             payload={
                 "theme": "dark",
                 "language": "vi",
                 "notifications_enabled": True
             },
             headers={"X-User-ID": str(user_a_id)})

        # 15.3 Đọc lại để verify merge
        call("GET Settings (after patch)", "GET", "/settings/",
             headers={"X-User-ID": str(user_a_id)})
    else:
        _skip_inc("Cần user_a_id")

    # ═══ PHẦN 16: MEDIA UPLOAD ══════════════════════════════════════════════
    log_step("PHẦN 16: MEDIA – UPLOAD", "Upload file ảnh (multipart/form-data)")

    # Tạo file ảnh giả nhỏ để test
    dummy_image = b"GIF89a\x01\x00\x01\x00\x00\xff\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x00;"
    files = {"file": ("avatar_test.gif", dummy_image, "image/gif")}
    data = {}

    url_media = f"{BASE_URL}/media/upload?type=avatar"
    print(f"\n  {CYAN}[➡ POST]{RESET}  /media/upload?type=avatar  (multipart)")
    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(url_media, files=files, data=data)
        is_ok = resp.status_code < 400
        color = GREEN if is_ok else RED
        print(f"  {color}[⬅ {resp.status_code}]{RESET}  Upload Media")
        try:
            print("  " + json.dumps(resp.json(), indent=4, ensure_ascii=False)[:400])
        except Exception:
            print("  ", resp.text[:300])
        _mark(is_ok)
    except Exception as exc:
        print(f"  {RED}[ERROR]{RESET} Upload Media: {exc}")
        _fail_inc()

    # ═══ KẾT QUẢ TỔNG HỢP ══════════════════════════════════════════════════
    total = _pass + _fail
    print(f"\n{'='*70}")
    print(f"✅  TỔNG KẾT")
    print(f"    Tổng số API calls : {total}")
    print(f"    {GREEN}Thành công{RESET}         : {_pass}")
    print(f"    {RED}Thất bại{RESET}           : {_fail}")
    print(f"    {YELLOW}Skip{RESET}               : {_skip}")
    if total:
        print(f"    Tỷ lệ thành công   : {_pass/total*100:.1f}%")
    print(f"{'='*70}")
    print(f"\n📄  Log được lưu tại: {LOG_FILE}")
    print("\n🏁  HOÀN TẤT TEST FULL JOURNEY!")


if __name__ == "__main__":
    main()
