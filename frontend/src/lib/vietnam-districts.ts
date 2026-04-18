export interface VnProvince {
  name: string;
  districts: string[];
}

/**
 * All 63 provinces / municipalities of Vietnam with their districts.
 * Source: General Statistics Office of Vietnam (GSO), updated 2024.
 * Sorted alphabetically by province name (Vietnamese order).
 */
export const VN_PROVINCES: VnProvince[] = [
  {
    name: "An Giang",
    districts: ["Long Xuyên", "Châu Đốc", "An Phú", "Châu Phú", "Châu Thành", "Chợ Mới", "Phú Tân", "Thoại Sơn", "Tịnh Biên", "Tri Tôn", "Tân Châu"],
  },
  {
    name: "Bà Rịa – Vũng Tàu",
    districts: ["Vũng Tàu", "Bà Rịa", "Phú Mỹ", "Châu Đức", "Côn Đảo", "Đất Đỏ", "Long Điền", "Xuyên Mộc"],
  },
  {
    name: "Bắc Giang",
    districts: ["Bắc Giang", "Hiệp Hòa", "Lạng Giang", "Lục Nam", "Lục Ngạn", "Sơn Động", "Tân Yên", "Việt Yên", "Yên Dũng", "Yên Thế"],
  },
  {
    name: "Bắc Kạn",
    districts: ["Bắc Kạn", "Ba Bể", "Bạch Thông", "Chợ Đồn", "Chợ Mới", "Na Rì", "Ngân Sơn", "Pác Nặm"],
  },
  {
    name: "Bạc Liêu",
    districts: ["Bạc Liêu", "Đông Hải", "Giá Rai", "Hòa Bình", "Hồng Dân", "Phước Long", "Vĩnh Lợi"],
  },
  {
    name: "Bắc Ninh",
    districts: ["Bắc Ninh", "Từ Sơn", "Gia Bình", "Lương Tài", "Quế Võ", "Thuận Thành", "Tiên Du", "Yên Phong"],
  },
  {
    name: "Bến Tre",
    districts: ["Bến Tre", "Ba Tri", "Bình Đại", "Châu Thành", "Chợ Lách", "Giồng Trôm", "Mỏ Cày Bắc", "Mỏ Cày Nam", "Thạnh Phú"],
  },
  {
    name: "Bình Định",
    districts: ["Quy Nhơn", "An Lão", "An Nhơn", "Hoài Ân", "Hoài Nhơn", "Phù Cát", "Phù Mỹ", "Tây Sơn", "Tuy Phước", "Vân Canh", "Vĩnh Thạnh"],
  },
  {
    name: "Bình Dương",
    districts: ["Thủ Dầu Một", "Bến Cát", "Dĩ An", "Tân Uyên", "Thuận An", "Bàu Bàng", "Bắc Tân Uyên", "Dầu Tiếng", "Phú Giáo"],
  },
  {
    name: "Bình Phước",
    districts: ["Đồng Xoài", "Bình Long", "Phước Long", "Bù Đăng", "Bù Đốp", "Bù Gia Mập", "Chơn Thành", "Đồng Phú", "Hớn Quản", "Lộc Ninh", "Phú Riềng"],
  },
  {
    name: "Bình Thuận",
    districts: ["Phan Thiết", "La Gi", "Bắc Bình", "Đức Linh", "Hàm Tân", "Hàm Thuận Bắc", "Hàm Thuận Nam", "Phú Quý", "Tánh Linh", "Tuy Phong"],
  },
  {
    name: "Cà Mau",
    districts: ["Cà Mau", "Cái Nước", "Đầm Dơi", "Năm Căn", "Ngọc Hiển", "Phú Tân", "Thới Bình", "Trần Văn Thời", "U Minh"],
  },
  {
    name: "Cần Thơ",
    districts: ["Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn", "Thốt Nốt", "Cờ Đỏ", "Phong Điền", "Thới Lai", "Vĩnh Thạnh"],
  },
  {
    name: "Cao Bằng",
    districts: ["Cao Bằng", "Bảo Lạc", "Bảo Lâm", "Hạ Lang", "Hà Quảng", "Hòa An", "Nguyên Bình", "Quảng Hòa", "Thạch An", "Trùng Khánh"],
  },
  {
    name: "Đà Nẵng",
    districts: ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ", "Hòa Vang", "Hoàng Sa"],
  },
  {
    name: "Đắk Lắk",
    districts: ["Buôn Ma Thuột", "Buôn Hồ", "Buôn Đôn", "Cư Kuin", "Cư M'gar", "Ea H'Leo", "Ea Kar", "Ea Súp", "Krông Ana", "Krông Bông", "Krông Búk", "Krông Năng", "Krông Pắc", "Lắk", "M'Đrắk"],
  },
  {
    name: "Đắk Nông",
    districts: ["Gia Nghĩa", "Cư Jút", "Đắk Glong", "Đắk Mil", "Đắk R'Lấp", "Đắk Song", "Krông Nô", "Tuy Đức"],
  },
  {
    name: "Điện Biên",
    districts: ["Điện Biên Phủ", "Mường Lay", "Điện Biên", "Điện Biên Đông", "Mường Ảng", "Mường Chà", "Mường Nhé", "Nậm Pồ", "Tủa Chùa", "Tuần Giáo"],
  },
  {
    name: "Đồng Nai",
    districts: ["Biên Hòa", "Long Khánh", "Cẩm Mỹ", "Định Quán", "Long Thành", "Nhơn Trạch", "Tân Phú", "Thống Nhất", "Trảng Bom", "Vĩnh Cửu", "Xuân Lộc"],
  },
  {
    name: "Đồng Tháp",
    districts: ["Cao Lãnh", "Sa Đéc", "Hồng Ngự", "Cao Lãnh (H)", "Châu Thành", "Lai Vung", "Lấp Vò", "Tam Nông", "Tân Hồng", "Thanh Bình", "Tháp Mười"],
  },
  {
    name: "Gia Lai",
    districts: ["Pleiku", "An Khê", "Ayun Pa", "Chư Păh", "Chư Prông", "Chư Pưh", "Chư Sê", "Đắk Đoa", "Đắk Pơ", "Đức Cơ", "Ia Grai", "Ia Pa", "KBang", "Kông Chro", "Krông Pa", "Mang Yang", "Phú Thiện"],
  },
  {
    name: "Hà Giang",
    districts: ["Hà Giang", "Bắc Mê", "Bắc Quang", "Đồng Văn", "Hoàng Su Phì", "Mèo Vạc", "Quản Bạ", "Quang Bình", "Vị Xuyên", "Xín Mần", "Yên Minh"],
  },
  {
    name: "Hà Nam",
    districts: ["Phủ Lý", "Bình Lục", "Duy Tiên", "Kim Bảng", "Lý Nhân", "Thanh Liêm"],
  },
  {
    name: "Hà Nội",
    districts: ["Ba Đình", "Hoàn Kiếm", "Hai Bà Trưng", "Đống Đa", "Tây Hồ", "Cầu Giấy", "Thanh Xuân", "Hoàng Mai", "Long Biên", "Nam Từ Liêm", "Bắc Từ Liêm", "Hà Đông", "Sơn Tây", "Ba Vì", "Chương Mỹ", "Đan Phượng", "Đông Anh", "Gia Lâm", "Hoài Đức", "Mê Linh", "Mỹ Đức", "Phú Xuyên", "Phúc Thọ", "Quốc Oai", "Sóc Sơn", "Thạch Thất", "Thanh Oai", "Thanh Trì", "Thường Tín", "Ứng Hòa"],
  },
  {
    name: "Hà Tĩnh",
    districts: ["Hà Tĩnh", "Hồng Lĩnh", "Kỳ Anh", "Cẩm Xuyên", "Can Lộc", "Đức Thọ", "Hương Khê", "Hương Sơn", "Kỳ Anh (H)", "Lộc Hà", "Nghi Xuân", "Thạch Hà", "Vũ Quang"],
  },
  {
    name: "Hải Dương",
    districts: ["Hải Dương", "Chí Linh", "Bình Giang", "Cẩm Giàng", "Gia Lộc", "Kim Thành", "Kinh Môn", "Nam Sách", "Ninh Giang", "Thanh Hà", "Thanh Miện", "Tứ Kỳ"],
  },
  {
    name: "Hải Phòng",
    districts: ["Hồng Bàng", "Ngô Quyền", "Lê Chân", "Hải An", "Kiến An", "Đồ Sơn", "Dương Kinh", "An Dương", "An Lão", "Bạch Long Vĩ", "Cát Hải", "Kiến Thụy", "Thủy Nguyên", "Tiên Lãng", "Vĩnh Bảo"],
  },
  {
    name: "Hậu Giang",
    districts: ["Vị Thanh", "Ngã Bảy", "Long Mỹ", "Châu Thành", "Châu Thành A", "Phụng Hiệp", "Vị Thủy"],
  },
  {
    name: "Hồ Chí Minh",
    districts: ["Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 10", "Quận 11", "Quận 12", "Bình Tân", "Bình Thạnh", "Gò Vấp", "Phú Nhuận", "Tân Bình", "Tân Phú", "Thủ Đức", "Bình Chánh", "Cần Giờ", "Củ Chi", "Hóc Môn", "Nhà Bè"],
  },
  {
    name: "Hòa Bình",
    districts: ["Hòa Bình", "Cao Phong", "Đà Bắc", "Kim Bôi", "Lạc Sơn", "Lạc Thủy", "Lương Sơn", "Mai Châu", "Tân Lạc", "Yên Thủy"],
  },
  {
    name: "Hưng Yên",
    districts: ["Hưng Yên", "Mỹ Hào", "Ân Thi", "Khoái Châu", "Kim Động", "Phù Cừ", "Tiên Lữ", "Văn Giang", "Văn Lâm", "Yên Mỹ"],
  },
  {
    name: "Khánh Hòa",
    districts: ["Nha Trang", "Cam Ranh", "Ninh Hòa", "Cam Lâm", "Diên Khánh", "Khánh Sơn", "Khánh Vĩnh", "Trường Sa", "Vạn Ninh"],
  },
  {
    name: "Kiên Giang",
    districts: ["Rạch Giá", "Hà Tiên", "Phú Quốc", "An Biên", "An Minh", "Châu Thành", "Giang Thành", "Giồng Riềng", "Gò Quao", "Hòn Đất", "Kiên Hải", "Kiên Lương", "Tân Hiệp", "U Minh Thượng", "Vĩnh Thuận"],
  },
  {
    name: "Kon Tum",
    districts: ["Kon Tum", "Đắk Glei", "Đắk Hà", "Đắk Tô", "Ia H'Drai", "Kon Plông", "Kon Rẫy", "Ngọc Hồi", "Sa Thầy", "Tu Mơ Rông"],
  },
  {
    name: "Lai Châu",
    districts: ["Lai Châu", "Mường Tè", "Nậm Nhùn", "Phong Thổ", "Sìn Hồ", "Tam Đường", "Tân Uyên", "Than Uyên"],
  },
  {
    name: "Lâm Đồng",
    districts: ["Đà Lạt", "Bảo Lộc", "Bảo Lâm", "Cát Tiên", "Đạ Huoai", "Đạ Tẻh", "Đam Rông", "Di Linh", "Đơn Dương", "Đức Trọng", "Lạc Dương", "Lâm Hà"],
  },
  {
    name: "Lạng Sơn",
    districts: ["Lạng Sơn", "Bắc Sơn", "Bình Gia", "Cao Lộc", "Chi Lăng", "Đình Lập", "Hữu Lũng", "Lộc Bình", "Tràng Định", "Văn Lãng", "Văn Quan"],
  },
  {
    name: "Lào Cai",
    districts: ["Lào Cai", "Sa Pa", "Bảo Thắng", "Bảo Yên", "Bắc Hà", "Bát Xát", "Mường Khương", "Si Ma Cai", "Văn Bàn"],
  },
  {
    name: "Long An",
    districts: ["Tân An", "Kiến Tường", "Bến Lức", "Cần Đước", "Cần Giuộc", "Châu Thành", "Đức Hòa", "Đức Huệ", "Mộc Hóa", "Tân Hưng", "Tân Thạnh", "Tân Trụ", "Thạnh Hóa", "Thủ Thừa", "Vĩnh Hưng"],
  },
  {
    name: "Nam Định",
    districts: ["Nam Định", "Giao Thủy", "Hải Hậu", "Mỹ Lộc", "Nam Trực", "Nghĩa Hưng", "Trực Ninh", "Vụ Bản", "Xuân Trường", "Ý Yên"],
  },
  {
    name: "Nghệ An",
    districts: ["Vinh", "Cửa Lò", "Thái Hòa", "Hoàng Mai", "Anh Sơn", "Con Cuông", "Diễn Châu", "Đô Lương", "Hưng Nguyên", "Kỳ Sơn", "Nam Đàn", "Nghi Lộc", "Nghĩa Đàn", "Quế Phong", "Quỳ Châu", "Quỳ Hợp", "Quỳnh Lưu", "Tân Kỳ", "Thanh Chương", "Tương Dương", "Yên Thành"],
  },
  {
    name: "Ninh Bình",
    districts: ["Ninh Bình", "Tam Điệp", "Gia Viễn", "Hoa Lư", "Kim Sơn", "Nho Quan", "Yên Khánh", "Yên Mô"],
  },
  {
    name: "Ninh Thuận",
    districts: ["Phan Rang – Tháp Chàm", "Bác Ái", "Ninh Hải", "Ninh Phước", "Ninh Sơn", "Thuận Bắc", "Thuận Nam"],
  },
  {
    name: "Phú Thọ",
    districts: ["Việt Trì", "Phú Thọ", "Cẩm Khê", "Đoan Hùng", "Hạ Hòa", "Lâm Thao", "Phù Ninh", "Tam Nông", "Tân Sơn", "Thanh Ba", "Thanh Sơn", "Thanh Thủy", "Yên Lập"],
  },
  {
    name: "Phú Yên",
    districts: ["Tuy Hòa", "Sông Cầu", "Đông Hòa", "Đồng Xuân", "Phú Hòa", "Sơn Hòa", "Sông Hinh", "Tây Hòa", "Tuy An"],
  },
  {
    name: "Quảng Bình",
    districts: ["Đồng Hới", "Ba Đồn", "Bố Trạch", "Lệ Thủy", "Minh Hóa", "Quảng Ninh", "Quảng Trạch", "Tuyên Hóa"],
  },
  {
    name: "Quảng Nam",
    districts: ["Tam Kỳ", "Hội An", "Điện Bàn", "Bắc Trà My", "Đại Lộc", "Đông Giang", "Duy Xuyên", "Hiệp Đức", "Nam Giang", "Nam Trà My", "Nông Sơn", "Núi Thành", "Phú Ninh", "Phước Sơn", "Quế Sơn", "Tây Giang", "Thăng Bình", "Tiên Phước"],
  },
  {
    name: "Quảng Ngãi",
    districts: ["Quảng Ngãi", "Đức Phổ", "Ba Tơ", "Bình Sơn", "Lý Sơn", "Minh Long", "Mộ Đức", "Nghĩa Hành", "Sơn Hà", "Sơn Tây", "Sơn Tịnh", "Tây Trà", "Trà Bồng", "Tư Nghĩa"],
  },
  {
    name: "Quảng Ninh",
    districts: ["Hạ Long", "Cẩm Phả", "Uông Bí", "Móng Cái", "Đông Triều", "Quảng Yên", "Ba Chẽ", "Bình Liêu", "Cô Tô", "Đầm Hà", "Hải Hà", "Hoành Bồ", "Tiên Yên", "Vân Đồn"],
  },
  {
    name: "Quảng Trị",
    districts: ["Đông Hà", "Quảng Trị", "Cam Lộ", "Đa Krông", "Gio Linh", "Hải Lăng", "Hướng Hóa", "Triệu Phong", "Vĩnh Linh", "Cồn Cỏ"],
  },
  {
    name: "Sóc Trăng",
    districts: ["Sóc Trăng", "Ngã Năm", "Vĩnh Châu", "Châu Thành", "Cù Lao Dung", "Kế Sách", "Long Phú", "Mỹ Tú", "Mỹ Xuyên", "Thạnh Trị", "Trần Đề"],
  },
  {
    name: "Sơn La",
    districts: ["Sơn La", "Bắc Yên", "Mai Sơn", "Mộc Châu", "Mường La", "Phù Yên", "Quỳnh Nhai", "Sông Mã", "Sốp Cộp", "Thuận Châu", "Vân Hồ", "Yên Châu"],
  },
  {
    name: "Tây Ninh",
    districts: ["Tây Ninh", "Hòa Thành", "Trảng Bàng", "Bến Cầu", "Châu Thành", "Dương Minh Châu", "Gò Dầu", "Tân Biên", "Tân Châu"],
  },
  {
    name: "Thái Bình",
    districts: ["Thái Bình", "Đông Hưng", "Hưng Hà", "Kiến Xương", "Quỳnh Phụ", "Thái Thụy", "Tiền Hải", "Vũ Thư"],
  },
  {
    name: "Thái Nguyên",
    districts: ["Thái Nguyên", "Sông Công", "Phổ Yên", "Đại Từ", "Định Hóa", "Đồng Hỷ", "Phú Bình", "Phú Lương", "Võ Nhai"],
  },
  {
    name: "Thanh Hóa",
    districts: ["Thanh Hóa", "Bỉm Sơn", "Sầm Sơn", "Nghi Sơn", "Bá Thước", "Cẩm Thủy", "Đông Sơn", "Hà Trung", "Hậu Lộc", "Hoằng Hóa", "Lang Chánh", "Mường Lát", "Nga Sơn", "Ngọc Lặc", "Như Thanh", "Như Xuân", "Nông Cống", "Quan Hóa", "Quan Sơn", "Quảng Xương", "Thạch Thành", "Thiệu Hóa", "Thọ Xuân", "Thường Xuân", "Tĩnh Gia", "Triệu Sơn", "Vĩnh Lộc", "Yên Định"],
  },
  {
    name: "Thừa Thiên Huế",
    districts: ["Huế", "Hương Thủy", "Hương Trà", "A Lưới", "Nam Đông", "Phong Điền", "Phú Lộc", "Phú Vang", "Quảng Điền"],
  },
  {
    name: "Tiền Giang",
    districts: ["Mỹ Tho", "Gò Công", "Cai Lậy", "Cái Bè", "Châu Thành", "Chợ Gạo", "Gò Công Đông", "Gò Công Tây", "Tân Phú Đông", "Tân Phước"],
  },
  {
    name: "Trà Vinh",
    districts: ["Trà Vinh", "Duyên Hải", "Càng Long", "Cầu Kè", "Cầu Ngang", "Châu Thành", "Tiểu Cần", "Trà Cú"],
  },
  {
    name: "Tuyên Quang",
    districts: ["Tuyên Quang", "Chiêm Hóa", "Hàm Yên", "Lâm Bình", "Na Hang", "Sơn Dương", "Yên Sơn"],
  },
  {
    name: "Vĩnh Long",
    districts: ["Vĩnh Long", "Bình Minh", "Bình Tân", "Long Hồ", "Mang Thít", "Tam Bình", "Trà Ôn", "Vũng Liêm"],
  },
  {
    name: "Vĩnh Phúc",
    districts: ["Vĩnh Yên", "Phúc Yên", "Bình Xuyên", "Lập Thạch", "Sông Lô", "Tam Đảo", "Tam Dương", "Vĩnh Tường", "Yên Lạc"],
  },
  {
    name: "Yên Bái",
    districts: ["Yên Bái", "Nghĩa Lộ", "Lục Yên", "Mù Cang Chải", "Trạm Tấu", "Trấn Yên", "Văn Chấn", "Văn Yên", "Yên Bình"],
  },
];

export interface FlatDistrict {
  province: string;
  district: string;
  label: string;
}

let _flatCache: FlatDistrict[] | null = null;

export function getAllDistrictsFlat(): FlatDistrict[] {
  if (_flatCache) return _flatCache;
  _flatCache = VN_PROVINCES.flatMap((p) =>
    p.districts.map((d) => ({
      province: p.name,
      district: d,
      label: `${d}, ${p.name}`,
    })),
  );
  return _flatCache;
}
