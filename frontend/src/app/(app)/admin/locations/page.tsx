"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Column,
  Row,
  Heading,
  Text,
  Button,
  IconButton,
} from "@/components/OnceUI";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
  MapPin,
  Save,
  RotateCcw,
  LogOut,
  Plus,
  ChevronDown,
  ChevronUp,
  Info,
  UploadCloud,
  Download,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════
//  15-DIM VECTOR DEFINITIONS — Mô tả chi tiết từng chiều
// ═══════════════════════════════════════════════════════════════════════
const PLACE_VECTOR_DIMENSIONS = [
  {
    index: 0,
    name: "Thiên nhiên ↔ Đô thị",
    key: "nature_vs_urban",
    description:
      "Phân tách rõ ràng nhu cầu đi trốn khỏi nhu cầu giải trí đô thị.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Đô thị",
        example: "Trong nhà, trung tâm thương mại, kiến trúc nhân tạo",
      },
      {
        value: "0.3–0.4",
        label: "Nửa đô thị",
        example: "Công viên nội đô, không gian hiện đại",
      },
      {
        value: "0.5–0.6",
        label: "Cân bằng",
        example: "Khu du lịch trải nghiệm hỗn hợp",
      },
      {
        value: "0.7–0.8",
        label: "Thiên nhiên",
        example: "Khu ngoại ô, rừng núi hoặc biển gần",
      },
      {
        value: "0.9–1.0",
        label: "Hoang sơ",
        example: "Rừng nguyên sinh, bãi biển hoang sơ, núi non",
      },
    ],
  },
  {
    index: 1,
    name: "Văn hóa & Lịch sử",
    key: "culture_history",
    description:
      "Bắt đúng tệp người dùng thích khám phá chiều sâu văn hóa thay vì chỉ vui chơi.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Giải trí thuần túy",
        example: "Hoàn toàn giải trí hiện đại (Theme park, club)",
      },
      {
        value: "0.3–0.4",
        label: "Hiện đại phần lớn",
        example: "Khu vui chơi hoặc không gian nghệ thuật đương đại",
      },
      {
        value: "0.5–0.6",
        label: "Cân bằng",
        example: "Có chút yếu tố dân gian, lễ hội địa phương",
      },
      {
        value: "0.7–0.8",
        label: "Văn hóa địa phương",
        example: "Các đền đài, chùa chiền thông thường",
      },
      {
        value: "0.9–1.0",
        label: "Lịch sử chuyên sâu",
        example: "Di tích cổ, bảo tàng, làng nghề truyền thống",
      },
    ],
  },
  {
    index: 2,
    name: "Độ tiêu hao thể lực",
    key: "physical_activity",
    description:
      "Rất quan trọng để filter. Người già hoặc người lười vận động sẽ bị loại khỏi các hoạt động 1.0.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Tuyệt đối thư giãn",
        example: "Thư giãn hoàn toàn (Spa, ngồi cafe ngắm cảnh)",
      },
      {
        value: "0.3–0.4",
        label: "Vận động nhẹ",
        example: "Dạo chơi công viên phẳng, mua sắm",
      },
      {
        value: "0.5–0.6",
        label: "Mức vừa phải",
        example: "Đạp xe dạo, bơi nhẹ, đi bộ tham quan thời gian dài",
      },
      {
        value: "0.7–0.8",
        label: "Hoạt động thể thao",
        example: "Bơi lặn sâu, đi bộ đường dài",
      },
      {
        value: "0.9–1.0",
        label: "Vận động tự lực mạnh",
        example: "Đòi hỏi vận động mạnh (Trekking, leo núi, chèo SUP)",
      },
    ],
  },
  {
    index: 3,
    name: "Mạo hiểm (Thrill)",
    key: "thrill",
    description:
      "Tách biệt với Thể lực. Ngồi yên trên tàu lượn mạo hiểm vẫn là 1.0.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Yên bình tuyệt đối",
        example: "Yên bình, an toàn tuyệt đối",
      },
      {
        value: "0.3–0.4",
        label: "Rất an toàn",
        example: "Các trò chơi công viên ấu nhi, đu quay nhẹ",
      },
      {
        value: "0.5–0.6",
        label: "Có chút thử thách",
        example: "Nhà ma, cáp treo cao",
      },
      {
        value: "0.7–0.8",
        label: "Khá mạo hiểm",
        example: "Xe trượt núi, đua xe go-kart, trượt nước",
      },
      {
        value: "0.9–1.0",
        label: "Rất mạo hiểm",
        example: "Kích thích mạnh (Zipline, lướt sóng, tàu lượn siêu tốc)",
      },
    ],
  },
  {
    index: 4,
    name: "Tính bản địa (Local Vibe)",
    key: "local_vibe",
    description:
      "Định hình phong cách du lịch: đi theo tour chuẩn hóa hay khám phá góc khuất.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Thương mại hóa cao",
        example: "Thương mại hóa cao (Tourist trap), chuẩn hóa quốc tế",
      },
      {
        value: "0.3–0.4",
        label: "Phục vụ du lịch",
        example: "Các điểm du lịch công nghiệp",
      },
      {
        value: "0.5–0.6",
        label: "Pha trộn",
        example: "Cả dân du lịch lẫn người bản địa lui tới",
      },
      {
        value: "0.7–0.8",
        label: "Bình dân/Địa phương",
        example: "Học hỏi văn hóa trực tiếp từ dân bản địa",
      },
      {
        value: "0.9–1.0",
        label: "Nguyên sơ bản địa",
        example: "Đậm chất địa phương, hoang sơ, ít người biết (Hidden gem)",
      },
    ],
  },
  {
    index: 5,
    name: "Độ phụ thuộc thời tiết",
    key: "weather_dependent",
    description:
      "Tích hợp logic thời tiết thực tế (Real-time weather) vào hệ thống.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Không bị ảnh hưởng",
        example: "Hoạt động trong nhà, không bị ảnh hưởng bởi mưa nắng",
      },
      {
        value: "0.3–0.4",
        label: "Ít ảnh hưởng",
        example: "Hoạt động có mái che kiên cố",
      },
      {
        value: "0.5–0.6",
        label: "Ảnh hưởng nửa chừng",
        example: "Tham quan ngoài trời kết hợp khu trưng bày trong nhà",
      },
      {
        value: "0.7–0.8",
        label: "Nên cân nhắc",
        example: "Có thể mang ô/dù vẫn chơi được nhưng trải nghiệm giảm",
      },
      {
        value: "0.9–1.0",
        label: "Hoàn toàn bị hủy bỏ",
        example: "Cảnh quan ngoài trời, hủy bỏ hoàn toàn nếu thời tiết xấu",
      },
    ],
  },
  {
    index: 6,
    name: "Thời lượng lưu trú",
    key: "stay_duration",
    description: "Hỗ trợ thuật toán sắp xếp lịch trình (Scheduling algorithm).",
    levels: [
      {
        value: "0.0–0.2",
        label: "Chớp nhoáng",
        example: "Dừng chân chớp nhoáng (< 1 tiếng, check-in rồi đi)",
      },
      {
        value: "0.3–0.4",
        label: "Vài tiếng",
        example: "Nghỉ mát ngắn, tham quan vài di tích",
      },
      {
        value: "0.5–0.6",
        label: "Nửa buổi",
        example: "Trải nghiệm đầy đủ hoạt động ở quy mô vừa",
      },
      {
        value: "0.7–0.8",
        label: "Lưu trú dài",
        example: "Một cụm các hoạt động cần 5-6 tiếng",
      },
      {
        value: "0.9–1.0",
        label: "Trải nghiệm trọn ngày",
        example: "Cần dành nửa ngày đến trọn ngày để trải nghiệm hết",
      },
    ],
  },
  {
    index: 7,
    name: "Mức chi phí (Cost)",
    key: "cost",
    description: "Phân loại trực tiếp theo túi tiền của người dùng.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Miễn phí",
        example: "Miễn phí hoặc cực kỳ bình dân",
      },
      {
        value: "0.3–0.4",
        label: "Rẻ",
        example: "Phí thăm quan nhà nước trợ giá",
      },
      {
        value: "0.5–0.6",
        label: "Trung bình",
        example: "Phí vui chơi/tour ở mức phổ thông",
      },
      {
        value: "0.7–0.8",
        label: "Khá cao",
        example: "Dịch vụ giải trí đắt tiền, dịch vụ private",
      },
      {
        value: "0.9–1.0",
        label: "Đắt đỏ / Luxury",
        example: "Đắt đỏ, luxury (Resort 5 sao, Fine dining)",
      },
    ],
  },
  {
    index: 8,
    name: "Cơ sở hạ tầng & Tiếp cận",
    key: "infrastructure_access",
    description: "Đánh giá tính khả thi vật lý của chuyến đi.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Rất hoang vu",
        example: "Đường đất, khó đi, yêu cầu xe chuyên dụng / đi bộ xa",
      },
      {
        value: "0.3–0.4",
        label: "Ít hạ tầng",
        example: "Thiếu thốn tiện nghi cơ bản, đi lại hẹp",
      },
      {
        value: "0.5–0.6",
        label: "Tiêu chuẩn cơ bản",
        example: "Đường nhựa, nhưng quy mô dịch vụ ở mức đủ xài",
      },
      {
        value: "0.7–0.8",
        label: "Khá thuận tiện",
        example: "Hỗ trợ phương tiện công cộng, Taxi vào tận nơi",
      },
      {
        value: "0.9–1.0",
        label: "Tiện nghi toàn diện",
        example:
          "Đường rải nhựa, có bãi đậu xe lớn, xe lăn/nôi trẻ em vào được",
      },
    ],
  },
  {
    index: 9,
    name: "Phù hợp trẻ em & Người cao tuổi",
    key: "family_friendly",
    description:
      "Trọng số lọc cốt lõi cho Family-oriented vs. Đối tượng thanh niên.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Chỉ dành cho người lớn",
        example: "Chỉ dành cho người lớn (Khó đi, ồn ào, nguy hiểm)",
      },
      {
        value: "0.3–0.4",
        label: "Rất hạn chế",
        example: "Thể lực cao hoặc môi trường không thân thiện cho bé",
      },
      {
        value: "0.5–0.6",
        label: "Chấp nhận được",
        example: "Phải theo dõi giám sát trẻ kỹ càng",
      },
      {
        value: "0.7–0.8",
        label: "Rất ổn",
        example: "Đường dễ đi, có chỗ trú mát/ghế nghỉ",
      },
      {
        value: "0.9–1.0",
        label: "Hoàn toàn lý tưởng",
        example: "Môi trường an toàn, có khu vui chơi/nghỉ ngơi cho gia đình",
      },
    ],
  },
  {
    index: 10,
    name: "Quy mô nhóm (Solo vs. Crowd)",
    key: "group_size",
    description: "Giải quyết bài toán không gian vật lý của địa điểm.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Chỉ cho cá nhân/cặp đôi",
        example: "Không gian hẹp, thân mật, ưu tiên đi 1-2 người",
      },
      {
        value: "0.3–0.4",
        label: "Nhóm nhỏ",
        example: "Góc hẹp yên tĩnh tầm 3-5 bạn bè thân",
      },
      {
        value: "0.5–0.6",
        label: "Gia đình/Nhóm vừa",
        example: "Khá thoải mái cho một tập thể nhỏ tầm 6-10",
      },
      {
        value: "0.7–0.8",
        label: "Nhóm khách đông",
        example: "Đoàn tham quan 15-20 người vẫn thoải mái",
      },
      {
        value: "0.9–1.0",
        label: "Quy mô sự kiện",
        example: "Rộng rãi, lý tưởng cho Team building, đoàn đông 10-50 người",
      },
    ],
  },
  {
    index: 11,
    name: "Không gian Sống ảo (Photogenic)",
    key: "photogenic",
    description: "Phản ánh hành vi check-in của tệp người dùng trẻ hiện đại.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Ít góc chụp",
        example: "Ít góc chụp, thiên về trải nghiệm thực tế",
      },
      {
        value: "0.3–0.4",
        label: "Dưới trung bình",
        example: "Nhạt nhoà trên hình ảnh",
      },
      {
        value: "0.5–0.6",
        label: "Bình thường",
        example: "Có không gian mở nhưng không xuất chúng",
      },
      {
        value: "0.7–0.8",
        label: "Khá bắt mắt",
        example: "Các khu trang trí theo mùa, kiến trúc đẹp",
      },
      {
        value: "0.9–1.0",
        label: "Perfect Check-in",
        example: "Decor bắt mắt, ánh sáng tốt, mọi góc đều có thể check-in",
      },
    ],
  },
  {
    index: 12,
    name: "Đông đúc ↔ Yên tĩnh",
    key: "quietness",
    description:
      "Đặc trưng tâm lý. Hai bãi biển có hình ảnh giống nhưng khác nhau về độ ồn ào.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Náo nhiệt",
        example: "Xô bồ, náo nhiệt (Chợ đêm, phố đi bộ)",
      },
      {
        value: "0.3–0.4",
        label: "Tấp nập",
        example: "Người qua lại đông đúc, náo nhiệt",
      },
      {
        value: "0.5–0.6",
        label: "Vừa phải",
        example: "Đủ không gian để thở, âm lượng trung bình",
      },
      {
        value: "0.7–0.8",
        label: "Thanh bình",
        example: "Khách lác đác, âm thanh yên lặng",
      },
      {
        value: "0.9–1.0",
        label: "Riêng tư",
        example: "Vắng vẻ, riêng tư, yên tĩnh",
      },
    ],
  },
  {
    index: 13,
    name: "Hoạt động về đêm (Nightlife)",
    key: "nightlife",
    description:
      "Phục vụ cho các truy vấn theo thời gian thực hoặc gợi ý lịch trình buổi tối.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Ban ngày",
        example: "Đóng cửa sớm trước 17h (Bảo tàng, công viên)",
      },
      {
        value: "0.3–0.4",
        label: "Chiều tối sớm",
        example: "Đóng cửa dọn dẹp lúc 19-20h",
      },
      {
        value: "0.5–0.6",
        label: "Mở khuya",
        example: "Phục vụ khách đến 22-23h",
      },
      {
        value: "0.7–0.8",
        label: "Hoạt động về đêm",
        example: "Sôi động mạnh vào nửa đêm đến rạng sáng",
      },
      {
        value: "0.9–1.0",
        label: "Xuyên đêm",
        example: "Phục vụ xuyên đêm (Bar, phố ẩm thực đêm, cắm trại đêm)",
      },
    ],
  },
  {
    index: 14,
    name: "Dịch vụ F&B đi kèm",
    key: "fb_services",
    description:
      "Thu gọn 15 chiều F&B cũ thành 1 chiều thể hiện tiện ích phụ trợ của địa điểm.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Không đồ ăn",
        example: "Không có đồ ăn/thức uống, hoặc cấm mang theo",
      },
      {
        value: "0.3–0.4",
        label: "Kém đa dạng",
        example: "Chỉ có máy bán nước tự động, xe bán đồ ăn vặt lẻ tẻ",
      },
      {
        value: "0.5–0.6",
        label: "Có căng tin nhỏ",
        example: "Quầy đồ ăn nhẹ/fast food nội bộ",
      },
      {
        value: "0.7–0.8",
        label: "Có nhà hàng",
        example: "Hệ thống nhà hàng phục vụ đạt chuẩn",
      },
      {
        value: "0.9–1.0",
        label: "Phức hợp ẩm thực",
        example: "Khu phức hợp ẩm thực, nhà hàng đa dạng bên trong",
      },
    ],
  },
];

const FOOD_VECTOR_DIMENSIONS = [
  {
    index: 0,
    name: "Độ cay",
    key: "spicy",
    description: "Mức độ cay chung của món ăn/menu.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Hoàn toàn không cay",
        example: "Bánh mì ngọt, chè",
      },
      { value: "0.3–0.4", label: "Ít cay", example: "Phở, cơm tấm (tùy nêm)" },
      { value: "0.5–0.6", label: "Cay vừa", example: "Bún bò Huế, mì Quảng" },
      {
        value: "0.7–0.8",
        label: "Cay nhiều",
        example: "Lẩu Thái, lẩu Tứ Xuyên",
      },
      {
        value: "0.9–1.0",
        label: "Rất cay",
        example: "Mì cay cấp 7, ẩm thực Nam Bộ cay nồng",
      },
    ],
  },
  {
    index: 1,
    name: "Độ ngọt",
    key: "sweet",
    description: "Mức độ ngọt của món ăn/đồ uống.",
    levels: [
      { value: "0.0–0.2", label: "Không ngọt", example: "Đồ nướng, hải sản" },
      { value: "0.3–0.4", label: "Ngọt thanh", example: "Soup, món canh" },
      {
        value: "0.5–0.6",
        label: "Vị ngọt phổ thông",
        example: "Trà đào, nước ép nguyên chất",
      },
      { value: "0.7–0.8", label: "Ngọt đậm", example: "Chè, trà sữa, kem" },
      {
        value: "0.9–1.0",
        label: "Rất ngọt",
        example: "Bánh ngọt kiểu Pháp, kẹo",
      },
    ],
  },
  {
    index: 2,
    name: "Độ mặn",
    key: "salty",
    description: "Mức độ đậm đà, mặn của món ăn.",
    levels: [
      { value: "0.0–0.2", label: "Nhạt", example: "Đồ luộc, thức ăn kiêng" },
      { value: "0.3–0.4", label: "Hơi nhạt", example: "Các món gỏi, cuốn" },
      { value: "0.5–0.6", label: "Vừa miệng", example: "Cơm gia đình, phở" },
      {
        value: "0.7–0.8",
        label: "Đậm đà",
        example: "Đồ nướng muối ớt, kho quẹt",
      },
      {
        value: "0.9–1.0",
        label: "Rất mặn",
        example: "Mắm nêm, mắm tôm nguyên bản",
      },
    ],
  },
  {
    index: 3,
    name: "Ẩm thực đường phố",
    key: "street_food",
    description: "Trải nghiệm ăn uống dạng đường phố, dân dã.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Nhà hàng kín",
        example: "Nhà hàng máy lạnh, không gian kín",
      },
      {
        value: "0.3–0.4",
        label: "Quán ăn bình dân",
        example: "Quán gia đình, có bàn ghế đàng hoàng",
      },
      {
        value: "0.5–0.6",
        label: "Quán vỉa hè",
        example: "Quán phở, hủ tiếu gõ có mái che",
      },
      {
        value: "0.7–0.8",
        label: "Xe đẩy vỉa hè",
        example: "Bánh mì, bánh tráng nướng",
      },
      {
        value: "0.9–1.0",
        label: "Thuần đường phố",
        example: "Khu chợ đêm, ẩm thực chợ",
      },
    ],
  },
  {
    index: 4,
    name: "Sang trọng",
    key: "luxury",
    description: "Mức độ cao cấp của không gian và chất lượng phục vụ.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Bình dân/Vỉa hè",
        example: "Quán cóc, ghế nhựa",
      },
      {
        value: "0.3–0.4",
        label: "Phổ thông",
        example: "Quán ăn sạch sẽ, bình thường",
      },
      {
        value: "0.5–0.6",
        label: "Trung cấp",
        example: "Nhà hàng chuỗi, buffet phổ thông",
      },
      {
        value: "0.7–0.8",
        label: "Cao cấp",
        example: "Nhà hàng có không gian riêng biệt",
      },
      {
        value: "0.9–1.0",
        label: "Fine Dining",
        example: "Sang trọng bậc nhất, Michelin",
      },
    ],
  },
  {
    index: 5,
    name: "Chill Vibe",
    key: "chill_vibe",
    description: "Không khí thư giãn, nhẹ nhàng.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Hối hả",
        example: "Fast food, quán đông đúc ăn rồi đi liền",
      },
      { value: "0.3–0.4", label: "Bình thường", example: "Quán ăn sinh viên" },
      {
        value: "0.5–0.6",
        label: "Khá thoải mái",
        example: "Cafe mở, có thể ngồi chơi lâu",
      },
      {
        value: "0.7–0.8",
        label: "Rất chill",
        example: "Acoustic, nhạc nhẹ, không gian mở",
      },
      {
        value: "0.9–1.0",
        label: "Cực kỳ thư giãn",
        example: "Rooftop yên bình, hidden bar",
      },
    ],
  },
  {
    index: 6,
    name: "Độ đông đúc",
    key: "crowded",
    description: "Mật độ khách hàng thường xuyên.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Rất vắng",
        example: "Ít khách, không gian riêng tư cao",
      },
      { value: "0.3–0.4", label: "Vắng", example: "Quán nhỏ, khách lai rai" },
      { value: "0.5–0.6", label: "Vừa phải", example: "Khách ra vào ổn định" },
      {
        value: "0.7–0.8",
        label: "Đông đúc",
        example: "Kín bàn vào giờ cao điểm",
      },
      {
        value: "0.9–1.0",
        label: "Rất đông đúc",
        example: "Phải xếp hàng chờ bàn",
      },
    ],
  },
  {
    index: 7,
    name: "Lãng mạn",
    key: "romantic",
    description: "Mức độ phù hợp để hẹn hò.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Không phù hợp",
        example: "Quán nhậu ồn ào, xe đẩy",
      },
      {
        value: "0.3–0.4",
        label: "Ít phù hợp",
        example: "Chỗ ngồi chật hẹp, quán phở",
      },
      {
        value: "0.5–0.6",
        label: "Tạm ổn",
        example: "Cafe có góc riêng tư nhẹ",
      },
      {
        value: "0.7–0.8",
        label: "Rất lãng mạn",
        example: "Nhà hàng có đèn vàng, nhạc jazz",
      },
      {
        value: "0.9–1.0",
        label: "Hẹn hò lý tưởng",
        example: "Rooftop riêng tư, view xịn",
      },
    ],
  },
  {
    index: 8,
    name: "Phù hợp gia đình",
    key: "family_friendly",
    description: "Thân thiện với gia đình có trẻ nhỏ/người lớn tuổi.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Không phù hợp",
        example: "Bar, club, độ ồn cao",
      },
      { value: "0.3–0.4", label: "Ít phù hợp", example: "Quán nhậu nam giới" },
      { value: "0.5–0.6", label: "Bình thường", example: "Quán ăn bình dân" },
      {
        value: "0.7–0.8",
        label: "Rất thân thiện",
        example: "Nhà hàng sạch sẽ, có ghế trẻ em",
      },
      {
        value: "0.9–1.0",
        label: "Tuyệt vời cho gia đình",
        example: "Có khu vui chơi, menu riêng cho bé",
      },
    ],
  },
  {
    index: 9,
    name: "Hoạt động đêm",
    key: "late_night",
    description: "Độ sẵn sàng phục vụ vào ban đêm.",
    levels: [
      { value: "0.0–0.2", label: "Chỉ sáng", example: "Bán đồ sáng, đóng sớm" },
      { value: "0.3–0.4", label: "Chiều tối", example: "Đóng cửa lúc 21h-22h" },
      { value: "0.5–0.6", label: "Tối muộn", example: "Đóng lúc 23h-24h" },
      { value: "0.7–0.8", label: "Khuya", example: "Mở đến 2h sáng" },
      { value: "0.9–1.0", label: "Xuyên đêm", example: "Hoạt động 24/7" },
    ],
  },
  {
    index: 10,
    name: "Ăn nhanh/Gọn",
    key: "quick_bite",
    description: "Bài trí để ăn nhanh và đi, ít tốn thời gian.",
    levels: [
      { value: "0.0–0.2", label: "Ăn lâu", example: "Buffet, lẩu, đồ nướng" },
      {
        value: "0.3–0.4",
        label: "Bình thường",
        example: "Cơm phần, có thói quen nhâm nhi",
      },
      {
        value: "0.5–0.6",
        label: "Phục vụ nhanh",
        example: "Bún, phở, dọn món sẵn",
      },
      { value: "0.7–0.8", label: "Fast food", example: "Gà rán, burger" },
      {
        value: "0.9–1.0",
        label: "Takeaway nhanh",
        example: "Bánh mì mang đi, cafe bột",
      },
    ],
  },
  {
    index: 11,
    name: "Lành mạnh",
    key: "healthy",
    description: "Mức độ eat-clean, ít dầu mỡ.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Không lành mạnh",
        example: "Đồ chiên nhiều dầu, fast food",
      },
      {
        value: "0.3–0.4",
        label: "Ít lành mạnh",
        example: "Món xào, nhiều đạm mỡ",
      },
      { value: "0.5–0.6", label: "Cân bằng", example: "Món nước, phở bò" },
      {
        value: "0.7–0.8",
        label: "Rất lành mạnh",
        example: "Gỏi cuốn, cháo yến mạch",
      },
      {
        value: "0.9–1.0",
        label: "Eat Clean",
        example: "Salad, nguyên liệu tự nhiên",
      },
    ],
  },
  {
    index: 12,
    name: "Chụp ảnh đẹp (Photogenic)",
    key: "photogenic",
    description: "Mức độ bày trí bắt mắt của món ăn và không gian.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Cơ bản",
        example: "Trình bày sơ sài, cốt để no",
      },
      {
        value: "0.3–0.4",
        label: "Tuyệt đối sạch",
        example: "Gọn gàng sạch sẽ nhưng không đặc sắc",
      },
      {
        value: "0.5–0.6",
        label: "Bắt mắt",
        example: "Màu sắc món ăn đẹp, không gian ổn",
      },
      {
        value: "0.7–0.8",
        label: "Rất đẹp",
        example: "Trang trí nghệ thuật, check-in lý tưởng",
      },
      {
        value: "0.9–1.0",
        label: "Nghệ thuật/Iconic",
        example: "Trang trí đẳng cấp, vô cùng bắt mắt",
      },
    ],
  },
  {
    index: 13,
    name: "Nhạc to/Ồn ào",
    key: "loud_music",
    description: "Cường độ âm thanh của địa điểm.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Rất yên tĩnh",
        example: "Không bật nhạc hoặc nhạc thiền",
      },
      {
        value: "0.3–0.4",
        label: "Nhẹ nhàng",
        example: "Nhạc nền acoustic, âm lượng nhỏ",
      },
      {
        value: "0.5–0.6",
        label: "Vừa phải",
        example: "Sôi động đủ nghe, dễ trò chuyện",
      },
      {
        value: "0.7–0.8",
        label: "Khá ồn",
        example: "Pub, beer club, nhạc sập sình",
      },
      {
        value: "0.9–1.0",
        label: "Cực kỳ ồn",
        example: "Bar, club âm lượng tối đa",
      },
    ],
  },
  {
    index: 14,
    name: "Local Favorite",
    key: "local_favorite",
    description: "Độ nhận diện và yêu thích với tệp khách địa phương.",
    levels: [
      {
        value: "0.0–0.2",
        label: "Chỉ khách du lịch",
        example: "Quán chuyên phục vụ tour du lịch",
      },
      {
        value: "0.3–0.4",
        label: "Ít người biết",
        example: "Quán mới mở hoặc vắng khách",
      },
      {
        value: "0.5–0.6",
        label: "Quen thuộc",
        example: "Có lượng khách quen ổn định",
      },
      {
        value: "0.7–0.8",
        label: "Quán đặc sản",
        example: "Người địa phương hay giới thiệu",
      },
      {
        value: "0.9–1.0",
        label: "Quán ruột/Landmark",
        example: "Gắn liền với văn hóa địa phương",
      },
    ],
  },
];

const DEFAULT_VECTOR = Array(15).fill(0.5);

// ═══════════════════════════════════════════════════════════════════════
//  COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function AdminLocationsPage() {
  const router = useRouter();

  // ─── Form state ──────────────────────────────────────────────
  const [name, setName] = useState("");
  const [category, setCategory] = useState("food");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Ho Chi Minh");
  const [priceRange, setPriceRange] = useState("");
  const [openHours, setOpenHours] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rating, setRating] = useState("");
  const [characteristics, setCharacteristics] = useState("");
  const [vector, setVector] = useState<number[]>([...DEFAULT_VECTOR]);

  // ─── UI state ────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [expandedDim, setExpandedDim] = useState<number | null>(null);
  const [recentLocations, setRecentLocations] = useState<
    Array<{ id: number; name: string }>
  >([]);

  // Bulk Import state
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({
    total: 0,
    current: 0,
    success: 0,
    error: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Handlers ────────────────────────────────────────────────
  const updateVector = (index: number, value: number) => {
    setVector((prev) => {
      const next = [...prev];
      next[index] = Math.round(value * 100) / 100; // 2 decimal
      return next;
    });
  };

  const resetForm = () => {
    setName("");
    setLat("");
    setLng("");
    setAddress("");
    setPriceRange("");
    setOpenHours("");
    setImageUrl("");
    setRating("");
    setCharacteristics("");
    setVector([...DEFAULT_VECTOR]);
  };

  const handleLogout = () => {
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/admin/login");
  };

  const handleSave = async () => {
    // Validate
    if (!name.trim()) return toast.error("Vui lòng nhập tên địa điểm");
    if (!lat || !lng) return toast.error("Vui lòng nhập tọa độ (Lat/Lng)");
    if (isNaN(Number(lat)) || isNaN(Number(lng)))
      return toast.error("Lat/Lng phải là số");

    setSaving(true);
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        category,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        vector,
      };
      if (address.trim()) body.address = address.trim();
      if (city.trim()) body.city = city.trim();
      if (priceRange.trim()) body.price_range = priceRange.trim();
      if (openHours.trim()) body.open_hours = openHours.trim();
      if (imageUrl.trim()) body.image_url = imageUrl.trim();

      if (rating.trim()) {
        const floatRating = parseFloat(rating.trim());
        if (!isNaN(floatRating)) body.rating = floatRating;
      }
      if (characteristics.trim()) {
        try {
          body.characteristics = JSON.parse(characteristics.trim());
        } catch (e) {
          toast.error("Format JSON của Đặc tính mở rộng không hợp lệ!");
          setSaving(false);
          return;
        }
      }

      const res = await fetch(`${API}/api/v1/locations/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Lỗi ${res.status}`);
      }

      const data = await res.json();
      toast.success(`✅ Đã lưu "${data.name}" (ID: ${data.id})`);
      setRecentLocations((prev) =>
        [{ id: data.id, name: data.name }, ...prev].slice(0, 8),
      );
      resetForm();
    } catch (err: unknown) {
      toast.error(
        `❌ ${err instanceof Error ? err.message : "Lỗi không xác định"}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      const wsTemplate = XLSX.utils.json_to_sheet([
        {
          name: "Quán Ăn Mẫu",
          category: "food",
          lat: 10.7769,
          lng: 106.7009,
          city: "Ho Chi Minh",
          address: "123 Mẫu, Q1",
          price_range: "50k",
          open_hours: "7:00-22:00",
          image_url: "",
          rating: 4.5,
          characteristics: '{"vibe": "chill"}',
          v0: 0.5,
          v1: 0.5,
          v2: 0.5,
          v3: 0.5,
          v4: 0.5,
          v5: 0.5,
          v6: 0.5,
          v7: 0.5,
          v8: 0.5,
          v9: 0.5,
          v10: 0.5,
          v11: 0.5,
          v12: 0.5,
          v13: 0.5,
          v14: 0.5,
        },
        {
          name: "Khu Vui Chơi Mẫu",
          category: "place",
          lat: 10.775,
          lng: 106.702,
          city: "Ho Chi Minh",
          address: "456 Mẫu, Q1",
          price_range: "100k",
          open_hours: "8:00-20:00",
          image_url: "",
          rating: 4.0,
          characteristics: "{}",
          v0: 0.8,
          v1: 0.2,
          v2: 0.9,
          v3: 0.1,
          v4: 0.5,
          v5: 0.5,
          v6: 0.5,
          v7: 0.6,
          v8: 0.8,
          v9: 0.9,
          v10: 0.5,
          v11: 0.5,
          v12: 0.7,
          v13: 0.2,
          v14: 0.3,
        },
      ]);

      const formatLevel = (levels: any[], index: number) => {
        if (!levels || !levels[index]) return "N/A";
        return levels[index].label + " - " + levels[index].example;
      };

      const foodInfo = FOOD_VECTOR_DIMENSIONS.map((d) => ({
        "Cột Vector": `v${d.index}`,
        "Tên Thuộc Tính": d.name,
        "Đại diện 0.0 (Thấp)": formatLevel(d.levels, 0),
        "Đại diện 1.0 (Cao)": formatLevel(d.levels, d.levels.length - 1),
        "Giải thích": d.description,
      }));

      const placeInfo = PLACE_VECTOR_DIMENSIONS.map((d) => ({
        "Cột Vector": `v${d.index}`,
        "Tên Thuộc Tính": d.name,
        "Đại diện 0.0 (Thấp)": formatLevel(d.levels, 0),
        "Đại diện 1.0 (Cao)": formatLevel(d.levels, d.levels.length - 1),
        "Giải thích": d.description,
      }));

      const wsFood = XLSX.utils.json_to_sheet(foodInfo);
      const wsPlace = XLSX.utils.json_to_sheet(placeInfo);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsTemplate, "Template");
      // EXCEL SHEET NAMES CANNOT CONTAIN: [ ] * / \ ? :
      XLSX.utils.book_append_sheet(wb, wsFood, "HuongDan_Food_Vector");
      XLSX.utils.book_append_sheet(wb, wsPlace, "HuongDan_Place_Vector");
      XLSX.writeFile(wb, "TasteMap_Locations_Template.xlsx");
    } catch (error) {
      console.error("Lỗi tạo file excel:", error);
      toast.error("Không thể tạo file Mẫu");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(ws);

      if (rows.length === 0) {
        toast.error("File trống hoặc không có dòng dữ liệu nào");
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setImportProgress({
        total: rows.length,
        current: 0,
        success: 0,
        error: 0,
      });

      let successCount = 0;
      let errorCount = 0;
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          // Check vector cols
          const vectorArray = [];
          for (let v = 0; v < 15; v++) {
            const val = row[`v${v}`];
            if (val === undefined || isNaN(Number(val))) {
              throw new Error(`Thiếu hoặc sai định dạng value ở cột v${v}`);
            }
            vectorArray.push(Number(val));
          }

          if (
            !row.name ||
            row.lat === undefined ||
            row.lng === undefined ||
            !row.category
          ) {
            throw new Error(`Thiếu field bắt buộc (name/category/lat/lng)`);
          }

          const body: Record<string, unknown> = {
            name: String(row.name).trim(),
            category: String(row.category).trim() === "food" ? "food" : "place",
            lat: Number(row.lat),
            lng: Number(row.lng),
            vector: vectorArray,
          };

          if (row.address) body.address = String(row.address).trim();
          if (row.city) body.city = String(row.city).trim();
          if (row.price_range)
            body.price_range = String(row.price_range).trim();
          if (row.open_hours) body.open_hours = String(row.open_hours).trim();
          if (row.image_url) body.image_url = String(row.image_url).trim();
          if (row.rating) body.rating = Number(row.rating);
          if (row.characteristics) {
            try {
              body.characteristics = JSON.parse(String(row.characteristics));
            } catch {
              // Ignore if invalid
            }
          }

          const res = await fetch(`${API}/api/v1/locations/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!res.ok) throw new Error("API error");

          successCount++;
        } catch (err: any) {
          console.error(`Lỗi dòng ${i + 2}:`, err);
          errorCount++;
        }

        setImportProgress({
          total: rows.length,
          current: i + 1,
          success: successCount,
          error: errorCount,
        });
        // Nhỏ xíu delay để UI không freeze
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      toast.success(
        `Nạp xong! Thành công: ${successCount}, Thất bại: ${errorCount}`,
      );
    } catch (err) {
      toast.error("Lỗi khi đọc file Excel");
      console.error(err);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ═══════════════════════════════════════════════════════════════
  //  STYLES
  // ═══════════════════════════════════════════════════════════════
  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: 32,
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)",
    padding: "32px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px 20px",
    fontSize: "0.875rem",
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.1)",
    background: "#F9F9FB",
    outline: "none",
    fontFamily: "inherit",
    color: "#1C1C1E",
    fontWeight: 500,
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#8E8E93",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  };

  // ═══════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div
      className="no-scrollbar"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#F2F2F7",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* ── HERO HEADER (Giao diện Chỉ huy) ── */}
      <div
          className="w-full shrink-0"
          style={{
              background: "linear-gradient(135deg, #1C1C1E 0%, #000000 100%)",
              padding: "48px 48px 40px",
              position: "relative",
              overflow: "hidden",
          }}
      >
        {/* Đèn báo động cam cho ngầu */}
        <div
            style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 300,
                height: 300,
                borderRadius: "50%",
                background: "rgba(255,149,0,0.15)",
                filter: "blur(80px)",
            }}
        />

        <div className="relative max-w-[960px] mx-auto w-full flex flex-col">
            <div className="flex items-start justify-between mb-8 w-full">
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <div
                            className="w-12 h-12 rounded-[18px] flex items-center justify-center shadow-xl cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ background: "linear-gradient(135deg, #FF9500, #FFCC00)" }}
                            onClick={() => router.push("/admin")}
                        >
                            <MapPin size={24} className="text-white" />
                        </div>
                        <h1 className="text-[32px] font-black text-white tracking-tight">
                            Location Manager
                        </h1>
                    </div>
                    <p className="text-[15px] text-[rgba(255,255,255,0.6)] font-medium max-w-md">
                        Review, manage, search, and update places of interest globally.
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* ─── Content ───────────────────────────────────── */}
      <Column
        fillWidth
        align="center"
        style={{ padding: "40px 16px 20px", maxWidth: 960, margin: "0 auto", gap: "24px" }}
      >
        {/* Bulk Import Card */}
        <Column fillWidth gap={16} style={{ ...cardStyle, padding: 24 }}>
          <Row
            horizontal="between"
            vertical="center"
            fillWidth
            style={{ flexWrap: "wrap", gap: 16 }}
          >
            <Row gap={12} vertical="center">
              <Row
                vertical="center"
                horizontal="center"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--surface-overlay)",
                }}
              >
                <UploadCloud size={18} color="var(--brand-solid-strong)" />
              </Row>
              <Column gap={2}>
                <Heading variant="heading-strong-s">
                  Bulk Import từ Excel
                </Heading>
                <Text
                  variant="body-default-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Nạp hàng loạt địa điểm từ file biểu mẫu. Yêu cầu có đủ 15 cột
                  vector (v0 - v14).
                </Text>
              </Column>
            </Row>

            <Row gap={12} style={{ flexWrap: "wrap" }}>
              <Button
                size="s"
                variant="tertiary"
                onClick={handleDownloadTemplate}
                disabled={importing}
              >
                <Download size={14} style={{ marginRight: 6 }} />
                Tải File Mẫu
              </Button>

              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <Button
                size="s"
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
              >
                <UploadCloud size={14} style={{ marginRight: 6 }} />
                Chọn File Tải Lên
              </Button>
            </Row>
          </Row>

          {importing && (
            <Column
              fillWidth
              gap={8}
              style={{
                background: "var(--surface-overlay)",
                padding: 16,
                borderRadius: 12,
              }}
            >
              <Row horizontal="between" vertical="center" fillWidth>
                <Text variant="body-strong-s">Tiến trình nạp dữ liệu...</Text>
                <Text variant="body-strong-s">
                  {importProgress.current} / {importProgress.total}
                </Text>
              </Row>
              <div
                style={{
                  width: "100%",
                  height: 6,
                  background: "var(--border-medium)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(importProgress.current / (importProgress.total || 1)) * 100}%`,
                    background: "var(--brand-solid-strong)",
                    transition: "width 0.2s",
                  }}
                />
              </div>
              <Row gap={16} fillWidth>
                <Text
                  variant="body-default-xs"
                  style={{ color: "var(--success-on-solid)" }}
                >
                  Đã thêm: {importProgress.success}
                </Text>
                <Text
                  variant="body-default-xs"
                  style={{ color: "var(--danger-on-solid)" }}
                >
                  Lỗi dòng: {importProgress.error}
                </Text>
              </Row>
            </Column>
          )}
        </Column>
      </Column>

      <Column
        fillWidth
        align="center"
        style={{ padding: "24px 16px 80px", maxWidth: 960, margin: "0 auto" }}
      >
        {/* ══ Card 1: Thông tin cơ bản ══ */}
        <Column fillWidth gap={20} style={{ ...cardStyle, padding: 24 }}>
          <Row gap={8} vertical="center">
            <Text
              variant="body-default-xs"
              style={{
                background: "#FFF0E6",
                color: "#ff6b35",
                padding: "4px 10px",
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              1
            </Text>
            <Heading variant="heading-strong-s">Thông tin cơ bản</Heading>
          </Row>

          {/* Name + Category */}
          <Row fillWidth gap={16} style={{ flexWrap: "wrap" }}>
            <Column style={{ flex: 2, minWidth: 200 }}>
              <label style={labelStyle}>Tên địa điểm *</label>
              <input
                style={inputStyle}
                placeholder="VD: Quán Cơm Nhà Làm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Column>
            <Column style={{ flex: 1, minWidth: 150 }}>
              <label style={labelStyle}>Danh mục *</label>
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="food">🍜 Đồ ăn (food)</option>
                <option value="place">📍 Địa điểm (place)</option>
              </select>
            </Column>
          </Row>

          {/* Lat / Lng */}
          <Row fillWidth gap={16} style={{ flexWrap: "wrap" }}>
            <Column style={{ flex: 1, minWidth: 150 }}>
              <label style={labelStyle}>Vĩ độ (Latitude) *</label>
              <input
                style={inputStyle}
                placeholder="VD: 10.7769"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </Column>
            <Column style={{ flex: 1, minWidth: 150 }}>
              <label style={labelStyle}>Kinh độ (Longitude) *</label>
              <input
                style={inputStyle}
                placeholder="VD: 106.7009"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
            </Column>
            <Column style={{ flex: 1, minWidth: 150 }}>
              <label style={labelStyle}>Thành phố</label>
              <input
                style={inputStyle}
                placeholder="VD: Ho Chi Minh"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </Column>
          </Row>

          {/* Address */}
          <Column fillWidth>
            <label style={labelStyle}>Địa chỉ</label>
            <input
              style={inputStyle}
              placeholder="VD: 123 Nguyễn Trãi, Quận 1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Column>

          {/* Price / Hours / Image */}
          <Row fillWidth gap={16} style={{ flexWrap: "wrap" }}>
            <Column style={{ flex: 1, minWidth: 150 }}>
              <label style={labelStyle}>Mức giá</label>
              <input
                style={inputStyle}
                placeholder="VD: 25k–50k"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              />
            </Column>
            <Column style={{ flex: 1, minWidth: 150 }}>
              <label style={labelStyle}>Giờ mở cửa</label>
              <input
                style={inputStyle}
                placeholder="VD: 7:00–22:00"
                value={openHours}
                onChange={(e) => setOpenHours(e.target.value)}
              />
            </Column>
            <Column style={{ flex: 1, minWidth: 200 }}>
              <label style={labelStyle}>Image URL</label>
              <input
                style={inputStyle}
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </Column>
          </Row>

          {/* Rating / Characteristics */}
          <Row fillWidth gap={16} style={{ flexWrap: "wrap", marginTop: 4 }}>
            <Column style={{ flex: 1, minWidth: 100 }}>
              <label style={labelStyle}>Đánh giá (Rating)</label>
              <input
                style={inputStyle}
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="0.0 - 5.0"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </Column>
            <Column style={{ flex: 3, minWidth: 200 }}>
              <label style={labelStyle}>Đặc tính mở rộng (JSON)</label>
              <input
                style={inputStyle}
                placeholder='{"vibe": "chill", "style": "vintage"}'
                value={characteristics}
                onChange={(e) => setCharacteristics(e.target.value)}
              />
            </Column>
          </Row>
        </Column>

        {/* ══ Card 2: Feature Vector 15 Chiều ══ */}
        <Column
          fillWidth
          gap={16}
          style={{ ...cardStyle, padding: 24, marginTop: 20 }}
        >
          <Row fillWidth horizontal="between" vertical="center">
            <Row gap={8} vertical="center">
              <Text
                variant="body-default-xs"
                style={{
                  background: "#F0EAFF",
                  color: "#5856D6",
                  padding: "4px 10px",
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                2
              </Text>
              <Heading variant="heading-strong-s">
                Feature Vector (15 chiều)
              </Heading>
            </Row>
            <Button
              size="s"
              variant="tertiary"
              onClick={() => setVector([...DEFAULT_VECTOR])}
            >
              <RotateCcw size={14} style={{ marginRight: 4 }} />
              Reset tất cả
            </Button>
          </Row>

          <Text
            variant="body-default-xs"
            style={{ color: "var(--text-tertiary)", lineHeight: 1.6 }}
          >
            Mỗi chiều đại diện cho một đặc trưng của địa điểm, giá trị từ{" "}
            <b>0.0</b> (thấp nhất) đến <b>1.0</b> (cao nhất). Kéo thanh slider
            hoặc nhập số trực tiếp. Bấm vào tên chiều để xem mô tả chi tiết.
          </Text>

          {/* Vector Dimensions Table */}
          <Column fillWidth gap={0}>
            {(category === "food"
              ? FOOD_VECTOR_DIMENSIONS
              : PLACE_VECTOR_DIMENSIONS
            ).map((dim) => {
              const isExpanded = expandedDim === dim.index;
              const val = vector[dim.index];

              return (
                <Column
                  key={dim.index}
                  fillWidth
                  style={{
                    borderBottom: "1px solid var(--border-weak)",
                    padding: "14px 0",
                  }}
                >
                  {/* Dimension Row */}
                  <Row
                    fillWidth
                    horizontal="between"
                    vertical="center"
                    gap={12}
                  >
                    {/* Left: index + name + toggle */}
                    <Row
                      vertical="center"
                      gap={10}
                      style={{ cursor: "pointer", flex: "0 0 220px" }}
                      onClick={() =>
                        setExpandedDim(isExpanded ? null : dim.index)
                      }
                    >
                      <Text
                        variant="body-default-xs"
                        style={{
                          width: 28,
                          height: 28,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 8,
                          background: isExpanded ? "#ff6b35" : "#F2F2F7",
                          color: isExpanded ? "#fff" : "var(--text-secondary)",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          flexShrink: 0,
                          transition: "all 0.2s",
                        }}
                      >
                        {dim.index}
                      </Text>
                      <Column gap={1}>
                        <Text
                          variant="body-default-s"
                          style={{
                            fontWeight: 600,
                            color: "var(--text-primary)",
                          }}
                        >
                          {dim.name}
                        </Text>
                        <Text
                          variant="body-default-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {dim.description.slice(0, 40)}...
                        </Text>
                      </Column>
                      {isExpanded ? (
                        <ChevronUp size={14} color="var(--text-tertiary)" />
                      ) : (
                        <ChevronDown size={14} color="var(--text-tertiary)" />
                      )}
                    </Row>

                    {/* Center: Slider */}
                    <Row
                      vertical="center"
                      gap={12}
                      style={{ flex: 1, minWidth: 200 }}
                    >
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={val}
                        onChange={(e) =>
                          updateVector(dim.index, parseFloat(e.target.value))
                        }
                        style={{
                          flex: 1,
                          appearance: "none",
                          height: 6,
                          borderRadius: 3,
                          background: `linear-gradient(to right, #ff6b35 ${val * 100}%, #E5E5EA ${val * 100}%)`,
                          outline: "none",
                          cursor: "pointer",
                        }}
                      />
                    </Row>

                    {/* Right: value */}
                    <input
                      type="number"
                      min={0}
                      max={1}
                      step={0.05}
                      value={val}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v) && v >= 0 && v <= 1)
                          updateVector(dim.index, v);
                      }}
                      style={{
                        width: 64,
                        padding: "8px 8px",
                        textAlign: "center",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        borderRadius: 10,
                        border: "1px solid var(--border-medium)",
                        background:
                          val > 0.7
                            ? "#E8F5E9"
                            : val < 0.3
                              ? "#FFF3E0"
                              : "#F9F9FB",
                        color:
                          val > 0.7
                            ? "#2E7D32"
                            : val < 0.3
                              ? "#E65100"
                              : "var(--text-primary)",
                        outline: "none",
                        fontFamily: "inherit",
                        flexShrink: 0,
                      }}
                    />
                  </Row>

                  {/* Expanded: Level descriptions */}
                  {isExpanded && (
                    <Column
                      fillWidth
                      gap={0}
                      style={{
                        marginTop: 12,
                        marginLeft: 38,
                        borderRadius: 14,
                        overflow: "hidden",
                        border: "1px solid var(--border-weak)",
                      }}
                    >
                      <Row
                        fillWidth
                        style={{
                          padding: "8px 14px",
                          background: "#F8F8FA",
                          borderBottom: "1px solid var(--border-weak)",
                        }}
                      >
                        <Info
                          size={13}
                          color="var(--text-tertiary)"
                          style={{
                            marginRight: 6,
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        />
                        <Text
                          variant="body-default-xs"
                          style={{
                            color: "var(--text-secondary)",
                            lineHeight: 1.5,
                          }}
                        >
                          {dim.description}
                        </Text>
                      </Row>
                      {dim.levels.map((level, li) => (
                        <Row
                          key={li}
                          fillWidth
                          horizontal="between"
                          vertical="center"
                          gap={8}
                          style={{
                            padding: "10px 14px",
                            borderBottom:
                              li < dim.levels.length - 1
                                ? "1px solid var(--border-weak)"
                                : "none",
                            background: "#fff",
                            cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                          onClick={() => {
                            // Parse middle of range for auto-set
                            const parts = level.value.split("–");
                            const mid =
                              parts.length === 2
                                ? (parseFloat(parts[0]) +
                                    parseFloat(parts[1])) /
                                  2
                                : parseFloat(parts[0]);
                            updateVector(
                              dim.index,
                              Math.round(mid * 100) / 100,
                            );
                          }}
                          onMouseEnter={(
                            e: React.MouseEvent<HTMLDivElement>,
                          ) => {
                            (
                              e.currentTarget as HTMLDivElement
                            ).style.background = "#F5F7FF";
                          }}
                          onMouseLeave={(
                            e: React.MouseEvent<HTMLDivElement>,
                          ) => {
                            (
                              e.currentTarget as HTMLDivElement
                            ).style.background = "#fff";
                          }}
                        >
                          <Row gap={10} vertical="center" style={{ flex: 1 }}>
                            <Text
                              variant="body-default-xs"
                              style={{
                                padding: "2px 8px",
                                borderRadius: 6,
                                background: "#F2F2F7",
                                fontWeight: 700,
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                                flexShrink: 0,
                                minWidth: 56,
                                textAlign: "center",
                              }}
                            >
                              {level.value}
                            </Text>
                            <Column gap={1}>
                              <Text
                                variant="body-default-s"
                                style={{ fontWeight: 600 }}
                              >
                                {level.label}
                              </Text>
                              <Text
                                variant="body-default-xs"
                                style={{ color: "var(--text-tertiary)" }}
                              >
                                {level.example}
                              </Text>
                            </Column>
                          </Row>
                        </Row>
                      ))}
                    </Column>
                  )}
                </Column>
              );
            })}
          </Column>
        </Column>

        {/* ══ Save Button ══ */}
        <Row fillWidth gap={12} style={{ marginTop: 20 }}>
          <Button
            size="l"
            variant="tertiary"
            onClick={resetForm}
            style={{ flex: 1 }}
          >
            <RotateCcw size={16} style={{ marginRight: 6 }} />
            Xóa form
          </Button>
          <Button
            size="l"
            onClick={handleSave}
            disabled={saving}
            style={{ flex: 2 }}
          >
            {saving ? (
              "Đang lưu..."
            ) : (
              <>
                <Save size={16} style={{ marginRight: 6 }} />
                Lưu Địa Điểm
              </>
            )}
          </Button>
        </Row>

        {/* ══ Card 3: Recently Added ══ */}
        {recentLocations.length > 0 && (
          <Column
            fillWidth
            gap={12}
            style={{ ...cardStyle, padding: 20, marginTop: 20 }}
          >
            <Row gap={8} vertical="center">
              <Text
                variant="body-default-xs"
                style={{
                  background: "#E8F5E9",
                  color: "#2E7D32",
                  padding: "4px 10px",
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                ✓
              </Text>
              <Heading variant="heading-strong-xs">Vừa thêm gần đây</Heading>
            </Row>
            <Column gap={6}>
              {recentLocations.map((loc) => (
                <Row
                  key={loc.id}
                  fillWidth
                  horizontal="between"
                  vertical="center"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "#F9FBF9",
                    border: "1px solid #E8F5E9",
                  }}
                >
                  <Text variant="body-default-s" style={{ fontWeight: 500 }}>
                    {loc.name}
                  </Text>
                  <Text
                    variant="body-default-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    ID: {loc.id}
                  </Text>
                </Row>
              ))}
            </Column>
          </Column>
        )}
      </Column>
    </div>
  );
}

