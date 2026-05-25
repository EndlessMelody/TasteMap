# Hệ Thống Vector Ngữ Nghĩa (Semantic Vector Dictionary)

Hệ thống TasteMap sử dụng vector Không gian 15 chiều (15-Dimensional Vector Space) để biểu diễn các đặc điểm của địa điểm cũng như sở thích của người dùng. Để tối ưu hóa việc phân loại và tránh gây nhiễu loạn thuật toán gợi ý (Recommend Algorithm), hệ thống phân định hai nhóm Không gian Vector độc lập với bộ chiều ngữ nghĩa hoàn toàn khác biệt:

1. **Food Vector (Đồ ăn, Thức uống)**: Áp dụng cho đối tượng quán ăn, nhà hàng, cafe. Tập trung vào hương vị, khẩu vị cá nhân.
2. **Place Vector (Địa điểm, Khu vui chơi)**: Áp dụng cho các điểm tham quan, du lịch, giải trí. Tập trung vào điều kiện thể lực, tiện ích và các trải nghiệm vật lý.

> [!WARNING]
> Mặc dù cả 2 loại vector này lưu chung trong cột `vector(15)` tại Database (`Location` model, sử dụng extension `pgvector` trên PostgreSQL), chúng ta **không được map chéo** 2 loại vector này bằng hàm tính toán khoảng cách `Cosine Similarity`. 
> Việc tính toán giữa một Vector User (đang tìm đồ ăn) lên một Vector Location (thể loại địa điểm vui chơi) sẽ dẫn đến lỗi AI định chuẩn sai sở thích (Ví dụ: Một người thích chơi mạo hiểm `thrill=1.0` sẽ bị phân rã nhầm thành thích đồ ăn cực ngọt `sweet=1.0`).

---

## 1. Food Vector (Mảng Ẩm Thực)
Biểu diễn các thuộc tính thuộc tính trực tiếp tới bữa ăn, hương vị, phong cách phục vụ F&B.

| Chiều | Mã Đặc Trưng (Key) | Tên Chiều | Cực 0.0 (Thấp nhất) | Cực 1.0 (Cao nhất) | Giải thích / Tại sao cần thiết? |
|:---:|---|---|---|---|---|
| **0** | `spicy` | Độ cay | Không cay, thanh đạm | Rất cay, cấp độ cao thách thức | Bộ lọc cốt lõi cho khẩu vị cá nhân đầu tiên. |
| **1** | `sweet` | Độ ngọt | Không có vị ngọt | Rất ngọt (Trà sữa, chè, bánh) | Dùng để phân tách sở thích món ngọt và cân nhắc calo. |
| **2** | `salty` | Độ mặn, đậm đà | Nhạt, luộc, hấp | Rất mặn mòi, mắm nêm nguyên bản | Xác định cường độ gia vị dùng bữa chung. |
| **3** | `street_food` | Ẩm thực đường phố | Nhà hàng máy lạnh, kín | Thuần đường phố, vỉa hè, xe đẩy | Khắc họa mong muốn trải nghiệm dân dã của thực khách. |
| **4** | `luxury` | Độ sang trọng | Bình dân, ngồi ghế nhựa | Sang trọng bậc nhất (Fine dining) | Phản ánh mức độ sẵn sàng chi trả cho chất lượng dịch vụ. |
| **5** | `chill_vibe` | Không gian Chill | Quán đông nghẹt, ăn nhanh rồi đi | Thư giãn tối đa (Rooftop, hidden bar) | Tính chất thư giãn kéo dài ở không gian quán nước. |
| **6** | `crowded` | Độ đông đúc | Rất vắng vẻ, không gian private | Rất đông, thường xuyên chờ bàn | Yếu tố tâm lý cá biệt (có người ghét xếp hàng). |
| **7** | `romantic` | Mức độ lãng mạn | Không phù hợp (Quán nhậu, ồn) | Lý tưởng hẹn hò (Có nến, nhạc nhẹ)| Tách biệt nhóm đi cá nhân bình thường vs nhóm Couples. |
| **8** | `family_friendly` | Phù hợp gia đình | Không phù hợp (Bar, club người lớn) | Tuyệt vời (Có khu vui chơi trẻ em) | Dành riêng cho nhóm khách có mang theo trẻ em độ tuổi nhỏ. |
| **9** | `late_night` | Hoạt động ban đêm | Chỉ bán sáng / trưa, đóng sớm | Xuyên đêm (Quán ăn khuya 24/7) | Rất hữu ích khi truy vấn quán ăn vào nửa đêm. |
| **10** | `quick_bite` | Ăn nhanh / Gọn | Ăn kiểu lẩu nướng lai rai kéo dài | Take-away, Fast food chớp nhoáng | Định hướng người dùng có ít thời gian trống. |
| **11** | `healthy` | Eat-clean / Lành mạnh| Dầu mỡ nhiều, đồ chiên rán | Hoàn toàn organic, salad, ăn kiêng| Phục vụ nhóm Gymer hoặc tệp khách hàng chú ý sức khỏe. |
| **12** | `photogenic` | Chụp hình bắt mắt | Không gian cơ bản, cốt để ăn no | Chăm chút nghệ thuật, rất nổi bật | Yếu tố quyết định của giới trẻ đam mê check-in MXH. |
| **13** | `loud_music` | Cường độ âm thanh | Yên tĩnh tuyệt đối (Nhà hàng chay) | Club/Bar nhạc DJ điện tử cực to | Lọc nhanh các không gian Party xả stress. |
| **14** | `local_favorite`| Phản hồi địa phương | Quán thiết kế tour công nghiệp | Quán "ruột" của người bản địa | Trọng số ẩn tìm Hidden gems (điểm tới chưa bị biến chất). |

---

## 2. Place Vector (Mảng Tham Quan & Vui Chơi)
Biểu diễn các thuộc tính cho địa danh, không chứa đặc trưng thực phẩm. Thiết kế định hướng hành vi du lịch.

| Chiều | Mã Đặc Trưng (Key) | Tên Chiều | Cực 0.0 (Thấp nhất) | Cực 1.0 (Cao nhất) | Bản chất / Vì sao cần thiết? |
|:---:|---|---|---|---|---|
| **0** | `nature_vs_urban` | Thiên nhiên ↔ Đô thị| Đô thị (Trung tâm thương mại, Tòa nhà) | Rừng nguyên sinh, bãi biển hoang sơ | Phân tách rõ ràng nhu cầu "đi trốn" khỏi nhu cầu giải trí đô thị. |
| **1** | `culture_history` | Văn hóa & Lịch sử | Hoàn toàn giải trí hiện đại (Theme park) | Di tích cổ, bảo tàng, làng truyền thống | Bắt đúng tệp người dùng thích khám phá chiều sâu văn hóa. |
| **2** | `physical_activity` | Độ tiêu hao thể lực | Thư giãn hoàn toàn (Spa, ngồi cafe) | Đòi hỏi vận động tự lực (Leo núi, Trek) | Yếu tố filter then chốt: Trẻ nhỏ/người già/lười vận động sẽ bị trừ điểm cực gắt. |
| **3** | `thrill` | Mạo hiểm (Thrill) | Yên bình, an toàn tuyệt đối | Kích thích cực đại (Zipline, lướt sóng)| Tách biệt với "Thể lực". Bạn ngồi tàu lượn thì thể lực 0.0 nhưng mạo hiểm vẫn là 1.0. |
| **4** | `local_vibe` | Tính bản địa (Vibe) | Thương mại hóa cao (Tourist trap) | Hoang sơ, ít người biết (Hidden gem) | Định hình kiểu du lịch: Lịch trình làm sẵn hay dấn thân khám phá. |
| **5** | `weather_dependent` | Phụ thuộc thời tiết | Trong nhà, vô nhiễm với mưa nắng | Cảnh quan thiên nhiên ngoài trời 100%| Thuộc tính "vàng" tích hợp API Weather Real-time để hủy/đổi lịch. |
| **6** | `stay_duration` | Thời lượng lưu trú | Chớp nhoáng (< 1h, check-in rồi rút) | Cần dành nửa buổi cho đến trọn ngày | Thông số bắt buộc để hệ thống Scheduling đóng gói các lịch trình. |
| **7** | `cost` | Mức chi phí (Cost) | Miễn phí hoặc cực kỳ bình dân hằng ngày | Đắt đỏ, luxury (Resort VIP, Yacht) | Điều tiết khả năng chi trả. |
| **8** | `infrastructure_access`| Cơ sở hạ tầng xe cộ| Đường hẻm, ngoằn ngoèo, đường đất | Xe nôi trẻ em kéo dễ dàng, bãi đỗ lớn | Tính khả thi vật lý của việc di chuyển tới nơi. |
| **9** | `family_friendly` | Đối tượng Gia Đình | Chỉ dành cho người lớn (Say xỉn, nguy hiểm) | Môi trường bảo vệ cực tốt cho trẻ con | Phân tách khu vực thanh thiếu niên tụ tập với mảng Family-Care. |
| **10** | `group_size` | Quy mô đoàn người | Không gian bé, thân mật 1-2 người ngồi | Rộng rãi, đoàn Team-building 50+ người | Quyết định năng lực không gian vật chứa. |
| **11** | `photogenic` | Không gian Sống ảo | Thiên về giá trị trải nghiệm hiện hữu | Background chuẩn chỉ để quay Tiktok | Đo lường độ hút tệp khách trẻ (Gen-Z). |
| **12** | `quietness` | Trạng thái Yên tĩnh | Chợ đêm, xô bồ náo nhiệt đông đảo | Vắng vẻ, cách ly, nghe được tiếng chim | Khác "đông khách" ở F&B. Hai bãi biển nổi tiếng y hệt nhau sẽ phân hóa qua thanh này. |
| **13** | `nightlife` | Hoạt động Nightlife| Đóng cửa trước 17h chiều (Bảo tàng) | Khuất lấp xuyên màn đêm tới tờ mờ sáng | Lập trình chuyến đi kết thúc muộn. |
| **14** | `fb_services` | Dịch vụ F&B đi kèm | Rỗng tuếch, có thể bị cấm mang đồ vào | Cụm nhà hàng phức hợp nội khu khổng lồ | Thay thế toàn bộ mảng Food, rút gọn độ tiện lợi lưu trú mà một vị trí cung cấp. |
