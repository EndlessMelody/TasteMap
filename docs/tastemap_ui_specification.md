# TasteMap – Mô Tả Giao Diện Người Dùng (UI Specification)

> Tài liệu này mô tả cấu trúc, bố cục và nội dung hiển thị của từng màn hình trong ứng dụng TasteMap.  
> Mục đích: giúp team frontend dựng lại giao diện mà không cần đọc code gốc.

---

## Tổng Quan Kiến Trúc Giao Diện

Ứng dụng gồm **3 trang chính**:
1. **Dashboard** (trang chủ) — `/`
2. **Profile** (hồ sơ cá nhân) — `/profile`
3. **Tour Builder** (xây dựng lộ trình ăn uống) — `/tour-builder`

Trang Dashboard có bố cục **3 cột** cố định chiều ngang, chiếm toàn màn hình.

---

## TRANG 1: Dashboard (Trang Chủ)

### Bố cục tổng thể

```
┌──────────────────────────────────────────────────────────────┐
│  Left Sidebar  │        Center Panel         │ Right Sidebar  │
│   (280px)      │   (flex, cuộn dọc)          │  (80 / 320px)  │
└──────────────────────────────────────────────────────────────┘
```

---

### 1.1 – Left Sidebar (Cột trái)

**Vị trí:** Cố định bên trái, chiều cao toàn màn hình. Có thể thu gọn/mở rộng bằng nút toggle.

#### Trạng thái mở rộng (rộng 280px):

**Khu vực đầu (Header):**
- Dòng ngang: Logo chữ **"TasteMap."** bên trái + Nút icon toggle (thu gọn sidebar) bên phải

**Nhóm Menu** (có label "MENU" — chữ nhỏ, viết hoa, mờ):
- **"Discover"** — icon la bàn, item đang active (nổi bật viền trái + nền highlight)
- **"Food Tour Builder"** — icon bàn tay → navigate sang `/tour-builder`
- **"Local Hot Routes"** — icon ghim bản đồ

**Nhóm Social** (có label "SOCIAL" — chữ nhỏ, viết hoa, mờ):
- **"Foodies"** — icon nhóm người dùng
- **"Group Rooms"** — icon micro

**Khu vực cuối sidebar – Gamification Card** (chiếm phần còn lại phía dưới):
- Card nền xám nhạt, bo góc
- Hàng trên: Avatar tròn + Tên hiệu "Taste Explorer" + Cấp độ "Level 12 • Vector Map"
- **Biểu đồ Radar chart** — 6 trục sở thích: Street Food, Spicy, Sweet, Luxury, Quiet, Group
- Nút **"Challenge Data"** full-width

#### Trạng thái thu gọn (rộng 80px):
- Chỉ icon của từng menu item, căn giữa ngang
- Cuối sidebar: Avatar tròn thay cho Gamification Card
- Mỗi item khi hover hiện tooltip tên

---

### 1.2 – Center Panel Header (Thanh điều hướng trên cùng, sticky)

**Vị trí:** Dán cố định ở đầu vùng nội dung chính.  
**Hành vi cuộn:** Khi user cuộn xuống, thanh tự thu hẹp chiều rộng và nổi lên như "island" (bo góc, có shadow, bỏ full-width).

**Bố cục ngang:**

**Bên trái – Nhóm điều hướng:**
- **Location Pill** (hình viên thuốc): icon MapPin + chữ "Dĩ An, Bình Dương" + mũi tên ▼ (click để đổi vùng)
- **Search Bar** (~420px, hình oval): placeholder "Search locations, tours, foodies..." — có nhãn phím tắt "Ctrl + K" ở bên trong phần phải ô nhập

**Bên phải – Nhóm tài khoản:**
- **Nút chuông Bell** — có chấm đỏ nhỏ ở góc báo thông báo chưa đọc → click mở Notification Panel
- **Nút chat MessageSquare**
- **Avatar + Tên + Cấp độ:** Avatar tròn + tên "Ramona F." + dòng nhỏ "Level 12" → click mở Profile Menu

---

#### Notification Panel (dropdown khi click chuông):

Panel nổi bên phải, ~420px rộng, có 3 nhóm:

**Nhóm "Social":**
- Avatar nhỏ + nội dung + thời gian + chấm tròn (chưa đọc)
- Ví dụ: *"Ramona checked in at Phở 36 · 2 min ago"*
- Ví dụ: *"Khoa invited you to Coffee Lovers lobby · 15 min ago"*

**Nhóm "Deals":**
- Icon vuông nhỏ (Sparkles) + nội dung + thời gian + chấm tròn
- Ví dụ: *"30% off at Matcha Garden today! · Expires in 3h"*

**Nhóm "System":**
- Icon vuông nhỏ (Compass) + nội dung + chi tiết
- Ví dụ: *"Your Taste Vector updated · +3 Spicy, +2 Street Food"*

---

#### Profile Dropdown Menu (khi click avatar/tên):

Card nổi bo góc, ~280px rộng:
1. **Header card:** Avatar lớn + tên "Ramona F." + label "Level 12 • Taste Explorer"
2. **Divider**
3. **Menu items** (icon + label):
   - icon User → "Hồ sơ cá nhân" → navigate `/profile`
   - icon Settings → "Tùy chỉnh hệ thống" → mở Settings Modal
   - icon Info → "Thông tin & Trợ giúp" → mở Settings Modal tab Support
4. **Divider**
5. **Đăng xuất:** icon LogOut (đỏ) + chữ "Đăng xuất" (đỏ)

---

### 1.3 – Center Panel Content (Nội dung cuộn dọc)

Các section xếp dọc, mỗi section fade-in lần lượt từ trên xuống khi tải trang.

---

#### Section 1: Hero Bento (Bản đồ + Banner quảng cáo)

**Bố cục:** Hàng ngang 2 ô, chiều cao cố định ~320px.

**Ô trái — Map Box (~320px vuông):**
- Nhúng widget bản đồ tương tác (Leaflet / OpenStreetMap)

**Ô phải — Hero Banner (flex, chiếm phần còn lại):**
- Ảnh thực phẩm full-cover làm nền, gradient trắng phủ từ trái sang để đọc nội dung
- **Nội dung (xếp dọc, bên trái):**
  1. Dòng tags: tag "Ad • Sponsored" + tag "100XP / spot" + tag thời tiết "☁️ Light Rain • 1.2km"
  2. Tiêu đề lớn, 2 dòng: **"Weekend Street / Food Tour"**
  3. Hàng avatars chồng nhau: 3 avatar nhỏ (xếp chồng, có viền) + chữ "+5 friends tracking"
  4. Dòng CTA: Nút "**Book Now**" (có hiệu ứng shimmer sáng chạy qua) + nút icon Navigation nhỏ

---

#### Section 2: AI Picks For You

**Header:**
- Trái: icon Sparkles tím + tiêu đề **"AI Picks For You"**
- Phải: chữ "Refresh" (click để làm mới gợi ý)

**Danh sách thẻ (cuộn ngang, không hiện thanh cuộn):**
Mỗi thẻ (~260px rộng) gồm:
- Ảnh trên (~120px cao) với badge "97%" ở góc trên phải
- Thông tin dưới:
  - Tên địa điểm (vd: "Bún Bò Huế Cô Giào")
  - Lý do AI gợi ý — có icon Sparkles nhỏ (vd: "Because you love Spicy + Street Food")
  - Giá ước tính (vd: "~35k VND")

4 thẻ mẫu: Bún Bò Huế Cô Giào (97%) · The Alley Boba (92%) · Ramen Shin Tokyo (89%) · Rooftop BBQ Night (85%)

---

#### Section 3: Trending Reels

**Header:**
- Trái: icon Flame đỏ + tiêu đề **"Trending Reels"**
- Phải: chữ "View all"

**Danh sách thẻ Reel (cuộn ngang):**
Mỗi thẻ dạng portrait (~180×400px) gồm:
- **Phần ảnh (~320px cao):**
  - Badge góc trên phải: icon mắt + số view (vd: "1.2M")
  - Nút Play tròn glassmorphic ở trung tâm ảnh (icon tam giác xanh)
- **Phần text dưới (nền trắng):**
  - Tiêu đề reel (tối đa 2 dòng, vd: "Crispy Pork Belly ASMR 🔥")
  - Avatar nhỏ + tên tài khoản (vd: "@foodie_ramona")

6 thẻ reel mẫu.

---

#### Section 4: Gợi Ý Theo Thời Điểm (Contextual Suggestions)

Nội dung section thay đổi theo giờ trong ngày:
- 5:00–10:59 → "Morning Energy Boost" (icon mặt trời) — tags: Breakfast, Coffee, Juice Bar, Bakery
- 11:00–14:59 → "Lunch Power-Up" (icon dao nĩa) — tags: Rice, Noodles, Quick Bites, Healthy
- 15:00–18:59 → "Afternoon Chill & Snacks" (icon cà phê) — tags: Cafe, Dessert, Boba, Chill Spots
- 19:00–21:59 → "Dinner & Unwind" (icon ly rượu) — tags: BBQ, Hotpot, Fine Dining, Rooftop
- 22:00–4:59 → "Dĩ An Late Night Cravings" (icon mặt trăng) — tags: Street Food, 24h Spots, Ramen, Midnight Snacks

**Header:**
- Trái: icon theo giờ + tiêu đề theo giờ + các tag category nhỏ (click được)
- Phải: icon Sparkles + chữ "AI Picks"

**Danh sách ContextCard (cuộn ngang):**
Mỗi thẻ hiển thị: ảnh + badge % match + tên địa điểm + thông tin trạng thái (vd: "Open until 2AM • 0.8km away")

5 thẻ mẫu: Phở Bò 36 Lý Quốc Sư · Bánh Tráng Trộn Cô Ba · Cơm Tấm Sườn Bì Chả · Kem Bơ Thanh Long · Bún Riêu Cua Đồng

---

#### Section 5: Live Group Lobbies

**Header:**
- Trái: icon Users + tiêu đề **"Live Group Lobbies"**
- Phải: nút **"Create Room +"** → mở Create Room Modal

**Danh sách Lobby Cards (cuộn ngang):**
Mỗi thẻ lobby gồm:
- Tên lobby (vd: "Midnight Snack Hunt")
- Badge **"LIVE"** (có animation nhấp nháy)
- Avatars thành viên xếp chồng nhau
- Số thành viên (vd: "4 members")
- Nút **"Join"**

---

#### Section 6: The Taste Vault

**Header:**
- Trái: icon Bookmark vàng + tiêu đề **"The Taste Vault"**
- Phải: 2 nút điều hướng ← → để cuộn danh sách

**Danh sách VaultCard (cuộn ngang):**
Mỗi thẻ (~260px rộng) gồm:
- **Ảnh trên (~150px cao)** với 2 badge:
  - Góc trên trái: icon Sparkles + điểm XP (vd: "30XP")
  - Góc trên phải: icon ngôi sao + điểm rating (vd: "4.6")
- **Phần text dưới:**
  - Tên địa điểm (vd: "Matcha Room") — đậm
  - Nhãn category (vd: "Japanese • Cafe") — nhỏ, mờ

5 thẻ mẫu: Banh Mi Pho 古 · Neon Diner · Matcha Room · Sky Bar · Phở Sáng

---

#### Section 7: Foodie Feed

**Header:**
- Trái: icon MessageCircle đỏ + tiêu đề **"Foodie Feed"**
- Phải: nút icon bộ lọc (SlidersHorizontal) + nút vùng **"Local: Dĩ An"**

**Danh sách PostCard (cuộn ngang):**
Mỗi thẻ (~340px rộng) gồm:
- **Ảnh trên (~200px cao)** với 2 overlay:
  - Góc trên trái: pill glassmorphic — Avatar nhỏ + Tên người đăng + Thời gian • Khu vực
  - Góc trên phải: badge — icon ngôi sao + điểm rating
- **Phần nội dung dưới:**
  - Icon MapPin + Tên địa điểm (đậm)
  - Nội dung review (mặc định 2 dòng, có link "Xem thêm" để mở đầy đủ)
  - Hàng tags (vd: "Street Food", "Spicy")
  - **Action bar** (có viền phân cách trên):
    - Trái: icon Heart + số lượt thích | icon MessageCircle + số bình luận
    - Phải: icon Bookmark (toggle lưu)

4 bài đăng mẫu: Bún Bò O Trắng · Cafe Rooftop Sunset · Hủ Tiếu Nam Vang Chú Sáu · BBQ Garden Night

---

#### Section 8: TasteMap Pro – Banner Quảng Cáo

- Banner full-width, chiều cao ~280px
- Nền ảnh nhà hàng cao cấp, gradient tối phủ từ trái sang phải
- **Nội dung bên trái (trên overlay tối):**
  1. Tag vàng nhỏ **"PRO FEATURE"** + chữ mờ "Exclusive for Elite Explorers"
  2. Tiêu đề lớn: **"Elevate Your Journey: / Become a TasteMap Pro."**
  3. Mô tả ngắn lợi ích
  4. Nút trắng **"Join the Elite"**

---

### 1.4 – Right Sidebar (Cột phải – Friends Panel)

**Trạng thái bình thường (80px):**
- Hiển thị cột avatar tròn các bạn bè, mỗi avatar có chấm trạng thái nhỏ ở góc dưới phải
- Nút "+" tròn ở trên cùng

**Khi hover vào (tự mở rộng 320px, animation smooth):**
- **Header:** Tiêu đề "Friends" hiện ra + giữ nút "+"
- **Danh sách bạn bè** (cuộn dọc), mỗi item:
  - Avatar tròn (có chấm trạng thái)
  - Tên bạn (đậm)
  - Trạng thái hoạt động (màu khác nhau):
    - 🍜 "On a Spicy Tour" — màu vàng cam
    - 🟢 "Online" — màu xanh ngọc
    - 🎮 "In Group Lobby" — màu tím

5 bạn bè mẫu: Ramona F. · Mai Linh · Thảo Vy · Hùng Đạt · Khôi Nguyên

---

### 1.5 – App Status Bar

Thanh mỏng ở đáy Center Panel hiển thị thông tin trạng thái ứng dụng.

---

## TRANG 2: Profile (Hồ Sơ Cá Nhân)

**Route:** `/profile` — Bố cục đơn cột, cuộn dọc, nền tối đậm, content căn giữa (max-width ~800px)

---

### 2.1 – Cover Photo

- Ảnh bìa full-width, cao 280px, có gradient tối từ trên xuống dưới
- **Nút Back (góc trên trái):** icon mũi tên ← trong nút glassmorphic → về Dashboard

---

### 2.2 – Profile Header

Khu vực nội dung kéo lên, chồng xuống phần ảnh bìa (margin-top âm):

**Hàng Avatar + Action Buttons:**
- Trái: Avatar tròn lớn (~140px), viền bọc tối; **Badge cấp độ nhỏ** màu đỏ ở góc dưới phải của avatar ("LV 12")
- Phải: Nút "**Edit Profile**" (icon bút + chữ) + IconButton Heart

**Thông tin người dùng (xếp dọc):**
1. Tên đầy đủ (lớn, trắng, đậm) — vd: "Ramona F."
2. Username + Danh hiệu (nhỏ, mờ) — vd: "@ramona_eats • Taste Explorer"
3. Bio (2–3 dòng, vd: "Foodie Explorer 🍜 | Discovering hidden gems in Bình Dương & Sài Gòn. Spicy food addict.")
4. Hàng metadata: icon MapPin + địa điểm | icon Calendar + ngày tham gia

---

### 2.3 – Stats Bar

Thanh ngang chia đều 4 ô bởi đường kẻ dọc:
| Reviews | Visited | Followers | Following |
|---------|---------|-----------|-----------|
| 89      | 142     | 1,240     | 356       |

Mỗi ô: số lớn (trắng, bold) + nhãn nhỏ mờ bên dưới.

---

### 2.4 – Badges

- Tiêu đề nhóm: icon Award vàng + "Badges"
- Các badge xếp ngang (wrap), mỗi badge: emoji + nhãn, nền + viền theo màu riêng
  - 🔥 Spice Master | 🌙 Night Owl | 📸 Photo Pro | 👑 Top Reviewer

---

### 2.5 – Top Spots

- Tiêu đề nhóm: icon Utensils xanh ngọc + "Top Spots"
- 3 thẻ địa điểm xếp ngang bằng nhau:
  - Ảnh vuông (~120px cao)
  - Tên địa điểm (trắng, đậm)
  - Hàng rating: icon ngôi sao vàng + điểm số

3 địa điểm mẫu: Bún Bò O Trắng (4.9) · Matcha Garden (4.7) · Neon Ramen House (4.8)

---

### 2.6 – Edit Profile Modal

**Trigger:** nút "Edit Profile"  
**Kích thước:** ~600px rộng, nền tối đậm, overlay blur

**Cấu trúc:**

**Header:** "Edit Profile" + nút X đóng

**Body (cuộn được):**
- Khu ảnh trên: ảnh bìa thumbnail (~130px cao) + avatar nhỏ chồng lên, mỗi cái có **nút Camera** nhỏ ở góc

- Nhóm **"Public Information":**
  - Ô nhập "Display Name"
  - Ô nhập "Username" — có prefix "@" tĩnh bên trái
  - Ô textarea "Bio" (3 dòng)

- Divider

- Nhóm **"Private Account Information"** (có icon khóa):
  - Ô nhập "Email"
  - Ô nhập "Phone"

**Footer:** Nút "Cancel" + Nút "**Save Changes**" (icon Save)

---

## TRANG 3: Tour Builder (Xây Dựng Lộ Trình Ăn)

**Route:** `/tour-builder` — Toàn màn hình, không cuộn, nền tối đậm

---

### 3.1 – Ambient Color Glow (hiệu ứng nền)

Một vùng glow màu lớn, blur mạnh ở trung tâm màn hình. Màu thay đổi smooth theo màu của thẻ đang hiển thị (tạo cảm giác immersive, sống động).

---

### 3.2 – Top Header Bar

**Bên trái:**
- Nút Back ← glassmorphic nhỏ → về Dashboard
- Tiêu đề **"Tour Builder"** + dòng nhỏ icon MapPin + "Dĩ An, Bình Dương"

**Bên phải:**
- Badge: icon Sparkles + **"X cards left"** (số lượng thẻ còn lại)

---

### 3.3 – Center Stage (Vùng Thẻ Vuốt — phần chính)

**Ghost labels (hiển thị rất mờ, chỉ gợi ý):**
- Bên trái màn hình: chữ "**SKIP**" rất to
- Bên phải màn hình: chữ "**SKIP**" rất to
- Bên dưới giữa: chữ "**↓ DROP TO ADD**"

**Card Stack (chồng 2 thẻ, kích thước ~340×480px):**
- **Thẻ sau (phông nền):** mờ, thu nhỏ, lùi ra sau — chỉ thấy một phần
- **Thẻ trước (active, draggable):**
  - Ảnh nền full-cover với overlay gradient tối từ dưới lên
  - **Badge % match** (vd: "98%") — góc trên phải
  - **Overlay nội dung phần dưới:**
    - Hàng tags nhỏ (vd: "Crispy", "Budget", "Iconic")
    - Tên địa điểm (lớn, trắng, đậm)
    - Subtitle: loại hình + khu vực (vd: "Street Food • Dĩ An")
  - **Thanh thông tin đáy thẻ:**
    - Góc trái: icon clock/distance + khoảng cách (vd: "0.8km")
    - Góc phải: icon DollarSign + giá (vd: "25k")

**Thao tác vuốt:**
- Vuốt trái HOẶC phải → bỏ qua thẻ (discard)
- Kéo xuống → thêm địa điểm vào Timeline

**Khi hết thẻ:**
- Hiển thị icon Sparkles lớn + "No More Cards" + "X/4 stops selected"

6 thẻ địa điểm mẫu: Bánh Mì Cô Thúy · Neon Ramen House · Matcha Garden · Sky Lounge · Phở Sáng Sớm · BBQ Midnight

---

### 3.4 – Undo Pill (xuất hiện tạm sau khi bỏ qua thẻ)

- Viên nổi ở giữa màn hình, phía dưới
- Nội dung: icon Undo vàng + `Undo "[tên thẻ]"`
- **Thanh tiến trình đếm ngược** ở đáy viên (5 giây, sau đó tự biến mất)
- Click để hoàn tác

---

### 3.5 – Live Mini-Map (khi đã có ít nhất 1 stop)

Panel nhỏ cố định góc dưới trái (~200×150px):
- Widget bản đồ nhúng
- **Overlay phía trên:**
  - Góc trên trái: icon bản đồ + chữ nhỏ "Live Map"
  - Hàng dot tròn ở đáy: mỗi dot = 1 slot timeline (đã fill = màu của địa điểm đó, chưa fill = viền nét đứt mờ)

---

### 3.6 – Tour Timeline Panel (phía dưới màn hình)

Tiêu đề: icon Route + **"Your Tour"** + đếm "X / 4 stops"

**Timeline nodes xếp ngang, nối nhau:**
- **Node đã fill:** ảnh tròn nhỏ + tên địa điểm ngắn — nối với node kế bằng đường + thẻ "~Xm" (ước tính)
- **Node chưa fill:** ô tròn trống, dấu "+" ở giữa, viền nét đứt — nhãn "Stop X" phía dưới

---

### 3.7 – Tour Complete View (sau khi fill đủ 4 stops)

Màn hình chuyển hoàn toàn sang giao diện mới:

**Nền:** Widget bản đồ full-screen + overlay gradient tối

**Panel glassmorphic nổi phía dưới (căn giữa, ~680px rộng):**
1. Tiêu đề **"Your Tour is Ready! 🎉"** + phụ đề "4 stops curated by your Taste Vector" + nút Back ←
2. **Hàng ảnh route:** 4 ảnh tròn nối nhau bằng đường gradient xanh ngọc
3. **Hàng Stat Pills:**
   - icon Route + "~6.1km total"
   - icon DollarSign + "~360k VND"
   - icon Clock + "~3.5 hours"
4. Nút **"Start Navigation"** — full-width, có hiệu ứng shimmer chạy qua

---

## CÁC MODAL TOÀN CỤC

### Modal: Cài đặt (Settings)

**Trigger:** Avatar dropdown → "Tùy chỉnh hệ thống"  
**Kích thước:** ~900×600px, overlay mờ + blur

**Bố cục 2 cột ngang:**

**Cột trái (240px) — Danh sách tab:**
- Header: tiêu đề "Cài đặt" + nút X
- **Nhóm 1:** Giao diện (icon Palette) · Ngôn ngữ (icon Globe) · Thông báo (icon Bell)
- Divider
- **Nhóm 2:** Trợ giúp (icon LifeBuoy) · Thông tin (icon Info)
- Cuối cùng: chữ nhỏ version "TasteMap v1.0.0-beta"

**Cột phải — Nội dung từng tab:**

**Tab "Giao diện":**
- Tiêu đề + mô tả ngắn
- 3 nút chọn theme xếp ngang đều (mỗi nút có icon + nhãn): **Sáng** (☀️) · **Tối** (🌙) · **Hệ thống** (🖥️) — item active được highlight
- Phần "Màu nhấn": 6 chấm tròn màu để chọn (đỏ, xanh ngọc, tím, vàng, xanh dương, cam)

**Tab "Ngôn ngữ":**
- Danh sách 4 dòng (cờ + tên + chấm tròn nếu active):
  - 🇻🇳 Tiếng Việt (active) · 🇺🇸 English · 🇯🇵 日本語 · 🇰🇷 한국어

**Tab "Thông báo":**
- 4 dòng row, mỗi row: tên thông báo + mô tả + toggle switch bật/tắt
  - Bạn bè check-in gần đây (bật)
  - Khuyến mãi lân cận (bật)
  - Taste Vector cập nhật (tắt)
  - Lời mời Lobby (bật)

**Tab "Trợ giúp":**
- **Card "Cần hỗ trợ?":** tiêu đề + email support + nút "Start Live Chat"
- **FAQ** (3 cặp hỏi–đáp):
  - "Làm sao để sửa Taste Vector?"
  - "Tôi có thể tạo bao nhiêu Tour?"
  - "Dữ liệu có được bảo mật không?"

**Tab "Thông tin":**
- Card logo: chữ "TasteMap." + "Food Tour Builder • Super App" + số version
- Danh sách 4 liên kết (icon + label + mũi tên phải >): Github Repository · Privacy Policy · Terms of Service · Open Source Licenses
- Footer: "Made with ❤️ by TasteMap Team • © 2026"

---

### Modal: Tạo Phòng Nhóm (Create Group Room)

**Trigger:** nút "Create Room +" trong phần Live Group Lobbies  
**Kích thước:** ~420px rộng, overlay blur

**Nội dung:**
- Header: "Start Group Room" + nút X
- Ô nhập "Room Name" — placeholder "e.g. Saturday Midnight Snacks"
- Nhóm "Invite Foodies": danh sách avatar + tên bạn bè, bấm để chọn/bỏ chọn
- Nút CTA: **"Initialize Minimax Engine"** full-width

---

### Modal: Xem Reel

**Trigger:** click vào thẻ Reel bất kỳ  
**Nội dung:** Ảnh/video reel lớn + tiêu đề + tên tài khoản + số lượt xem + nút X đóng

---

### Modal: Chi Tiết Bài Đăng (Post Detail)

**Trigger:** click vào thẻ PostCard  
**Nội dung:**
- Ảnh địa điểm lớn hơn
- Đầy đủ thông tin: avatar người đăng, tên, khu vực, rating, nội dung review không cắt ngắn, tags
- Khu vực hiển thị bình luận
- Action bar đầy đủ: Like (toggle) + số | Comment + số | Bookmark (toggle)

---

## Thành Phần Chung (Shared UI Elements)

### Skeleton Loading
Khi đang tải dữ liệu, thẻ hiển thị dạng skeleton (ô xám nhạt, animation shimmer). Có 5 loại skeleton tương ứng: GroupCard · ReelCard · VaultCard · FeedCard · ThumbnailCard.

### Toast Notifications
Thông báo nổi ngắn ở góc màn hình khi thực hiện hành động:
- "Will be updated in the next version 🚀" — cho tính năng chưa có
- "Đã đăng xuất! 👋" — sau đăng xuất
- "Profile updated successfully! ✨" — sau lưu hồ sơ

---

## Luồng Điều Hướng Tổng Thể

```
Dashboard (/)
├── Click avatar dropdown
│   ├── "Hồ sơ cá nhân" ──────────────────────→ /profile
│   └── "Tùy chỉnh hệ thống" ──────────────→ Settings Modal
├── Sidebar: "Food Tour Builder" ──────────→ /tour-builder
├── Hero Banner: "Book Now" ───────────────→ /tour-builder
├── AI Picks card ─────────────────────────→ /tour-builder
├── Click thẻ Reel ────────────────────────→ Reel Modal
├── Click thẻ Post ────────────────────────→ Post Modal
└── "Create Room +" ──────────────────────→ Create Room Modal

Profile (/profile)
├── "Edit Profile" ────────────────────────→ Edit Profile Modal
└── Nút Back ← ───────────────────────────→ Dashboard (/)

Tour Builder (/tour-builder)
├── Vuốt trái/phải ────────────→ Bỏ qua thẻ (Undo khả dụng 5 giây)
├── Kéo xuống ─────────────────→ Thêm vào Timeline
├── Fill đủ 4 stops ───────────→ Tour Complete View
│   └── "Start Navigation" ───→ (action tiếp theo)
└── Nút Back ← ───────────────→ Dashboard (/)
```
