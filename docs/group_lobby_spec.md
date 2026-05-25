# ĐẶC TẢ CHỨC NĂNG: TASTEMAP GROUP LOBBY (TINDER FOR FOOD)

## 1. Tổng quan tính năng (Overview)

Tính năng Group Lobby (Phòng chờ nhóm) cho phép một người dùng (Host) tạo một phòng ảo và mời bạn bè tham gia. Thay vì cãi nhau xem "Hôm nay ăn gì?", mỗi thành viên sẽ tự lướt (swipe) các thẻ địa điểm ẩm thực trên màn hình cá nhân của mình. Hệ thống AI sẽ âm thầm thu thập sở thích tức thời của cả nhóm, tính toán độ thỏa hiệp, và dần dần hướng nhóm đến những địa điểm mà tất cả đều hài lòng.

## 2. Cơ chế Cốt lõi & Trạng thái (Core Mechanics)

### 2.1. Độc lập Giao diện & Chốt kết quả (Individual UI & Resolution)

- Mọi thành viên trong phòng đều có một màn hình lướt thẻ độc lập hoàn toàn.
- Khi thành viên A quẹt thẻ, màn hình của B và C không bị ảnh hưởng. Điều này tránh hiệu ứng "tâm lý đám đông" (hùa theo người quẹt đầu tiên).
- Chế độ khám phá là Open-ended Exploration: Không giới hạn số lượng thẻ, nhóm cứ lướt đến khi nào cảm thấy đã chọn đủ quán hoặc Host quyết định kết thúc phiên (Chốt danh sách).

- **Kết xuất kết quả chung cuộc (Final Resolution)**: Ngay khi Host bấm chốt, hệ thống sẽ chắt lọc và tính toán để đưa ra Top N gợi ý chung cuộc (ví dụ: 3 quán tốt nhất). Thuật toán chốt hạ vẫn tuân thủ nghiêm ngặt nguyên tắc Minimax bảo vệ người yếu thế, áp dụng lên các Session Vector đã được cập nhật hoàn thiện nhất của cả nhóm:

  $$\min_{L \in \text{Locations}} \left( \max_{u \in \text{Group}} \left| \text{Score}_u(L) - \text{Score}_{ideal} \right| \right)$$

- **Kho lưu trữ nhóm (Group's Vault / Liked List)**: Để đảm bảo tính linh hoạt (không phụ thuộc 100% vào AI), hệ thống cung cấp một nút để mở danh sách "Các địa điểm đã thích". Nơi đây hiển thị toàn bộ những quán mà ít nhất một người trong nhóm đã Quẹt Phải (Thích) hoặc Siêu Thích (Star), làm phương án dự phòng để nhóm tự thảo luận và chốt bằng tay.

### 2.2. Khởi tạo & Cập nhật Vector Tạm thời (Session Vector)

- Khi user bước vào phòng, hệ thống sẽ clone (sao chép) Vector 15 chiều ở Profile gốc của user đó thành một Session Vector (Vector tạm thời của phiên chơi).
- Mọi thao tác Quẹt Trái (Bỏ qua) / Quẹt Phải (Thích) trong phòng này sẽ chỉ làm thay đổi Session Vector, hoàn toàn không tác động đến Vector gốc của user. (Giúp user thoải mái "chiều" theo bạn bè trong buổi đi chơi đó mà không sợ AI sau này gợi ý sai cho cá nhân mình).

## 3. Lõi Toán học: Thuật toán Trọng tài (AI Thought Engine)
5.1. Đồng bộ Dữ liệu & Giao tiếp Mạng (Real-time WebSocket)
Hạ tầng lõi: Tính năng vuốt thẻ nhóm bắt buộc phải có độ trễ cực thấp (Zero-latency) để tạo cảm giác đồng bộ. Do đó, hệ thống sẽ sử dụng hoàn toàn WebSocket, tận dụng lại cơ sở hạ tầng đã được xây dựng cho tính năng Voice Chat (VoiceConnectionManager).  

Cơ chế Event-driven: Thay vì Frontend phải liên tục "hỏi thăm" Server (Polling), Frontend chỉ gửi tín hiệu (Emit) khi user có hành động cụ thể (vd: swipe_right, star_location).

Xử lý Siêu thích (Star): Khi user A bấm Star một quán, Frontend bắn event qua WebSocket. Backend nhận được sẽ lập tức broadcast (phát sóng) event force_insert_card tới 5 người còn lại. Frontend của 5 người này sẽ tự động bắt event và chèn thẻ đó lên đầu mảng Queue cục bộ ngay lập tức.  

Fallback & Sync: HTTP GET request truyền thống chỉ được dùng duy nhất vào lúc user mới bước vào phòng hoặc bị rớt mạng cần kết nối lại (Reconnect) để tải toàn bộ trạng thái phòng (Room State) hiện tại.
Để sinh ra các thẻ món ăn tiếp theo cho nhóm, Backend không random bừa, mà sử dụng thuật toán Minimax để làm "Trọng tài" phân xử sở thích.

### 3.1. Tìm điểm dung hòa tối ưu

Khi cần chọn ra các quán ăn tiềm năng từ Database để đưa vào bộ bài (Deck) cho nhóm lướt, AI sẽ tìm kiếm các địa điểm $L$ sao cho mức độ "thiệt thòi" (bất mãn) của người khó tính nhất trong nhóm là thấp nhất:

$$\min_{L \in \text{Locations}} \left( \max_{u \in \text{Group}} \left| \text{Score}_u(L) - \text{Score}_{ideal} \right| \right)$$

(Trong đó: $\text{Score}_u(L)$ là điểm số tương thích giữa Session Vector của user $u$ và Vector của địa điểm $L$. $\text{Score}_{ideal}$ là điểm tuyệt đối 1.0).

**Kết quả**: Hệ thống sẽ ưu tiên nạp vào bộ bài những quán ăn "vừa lòng người, đẹp lòng ta", né những quán mà có 1 người cực kỳ ghét.

### 3.2. Cơ chế Luân phiên (Alternating Compromise)

Nếu AI phát hiện sở thích của nhóm đang bị "phân cực" quá mức (Ví dụ: Một nửa nhóm có Vector cực chuộng đồ Chay, nửa còn lại cực chuộng Thịt nướng), thuật toán Minimax sẽ chuyển sang chế độ Luân phiên thỏa hiệp:

- Thẻ gợi ý cho bữa trưa sẽ nghiêng hẳn về quán Chay (chiều lòng nhóm A).
- Thuật toán sẽ lưu lại "nợ thỏa hiệp", và nạp ngay các thẻ quán Thịt nướng vào bộ bài cho lịch trình buổi tối (để đền bù cho nhóm B).

## 4. Chi tiết Tương tác Người dùng (User Actions)

| Hành động | Thao tác | Logic Backend (Xử lý dưới ngầm) |
| :--- | :--- | :--- |
| **Bỏ qua (Skip)** | Quẹt Trái | Đẩy thẻ đi. Cập nhật Session Vector (giảm trọng số các đặc trưng của quán này). |
| **Thích (Choose)** | Quẹt Phải | Đẩy thẻ đi. Cập nhật Session Vector (tăng trọng số các đặc trưng của quán này). Ghi nhận 1 phiếu "Vote" ngầm cho quán (đưa vào Group's Vault). |
| **Siêu Thích (Star)** | Bấm nút Ngôi Sao | Tính là 1 Vote cực mạnh. Lập tức bốc thẻ quán này chèn vào đầu bộ bài (Deck) của các thành viên khác để ép họ phải xem và ra quyết định (Vote) sớm. Đồng thời đưa quán vào Group's Vault. |
| **Hoàn tác (Undo)** | Bấm nút Quay Lại | Lấy lại thẻ vừa quẹt. Backend Rollback (đảo ngược) lại phép tính cộng/trừ Vector vừa thực hiện ở thẻ trước đó và rút lại phiếu Vote (nếu có). |

## 5. UI Elements & Giao tiếp Mạng (Networking)

### 5.1. Đồng bộ Dữ liệu & Giao tiếp Mạng (Real-time WebSocket)

- Hạ tầng lõi: Tính năng vuốt thẻ nhóm bắt buộc phải có độ trễ cực thấp (Zero-latency) để tạo cảm giác đồng bộ. Do đó, hệ thống sẽ sử dụng hoàn toàn WebSocket, tận dụng lại cơ sở hạ tầng đã được xây dựng cho tính năng Voice Chat (VoiceConnectionManager).  

- Cơ chế Event-driven: Thay vì Frontend phải liên tục "hỏi thăm" Server (Polling), Frontend chỉ gửi tín hiệu (Emit) khi user có hành động cụ thể (vd: swipe_right, star_location).

- Xử lý Siêu thích (Star): Khi user A bấm Star một quán, Frontend bắn event qua WebSocket. Backend nhận được sẽ lập tức broadcast (phát sóng) event force_insert_card tới 5 người còn lại. Frontend của 5 người này sẽ tự động bắt event và chèn thẻ đó lên đầu mảng Queue cục bộ ngay lập tức.  

Fallback & Sync: HTTP GET request truyền thống chỉ được dùng duy nhất vào lúc user mới bước vào phòng hoặc bị rớt mạng cần kết nối lại (Reconnect) để tải toàn bộ trạng thái phòng (Room State) hiện tại.


### 5.2. Hiển thị Linh động (Dynamic UI)

- **Community Consensus (Đồng thuận cộng đồng)**: Khung trích dẫn (như "Absolutely incredible...") không phải AI sinh ra real-time, mà là Frontend gọi API bốc ngẫu nhiên 1 câu Review có sẵn trong Database của quán đó (ưu tiên các review chứa từ khóa khớp với sở thích đang lên cao của nhóm, vd: "cay", "chill").
- **Tour DNA Profile**: Một thanh tiến trình hiển thị trên Frontend, thay đổi hình dạng dựa trên sự dịch chuyển của Group Vector (Trung bình cộng các Session Vector của các thành viên) mỗi lần Polling.
