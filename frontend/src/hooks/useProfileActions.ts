// src/hooks/useProfileActions.ts
import { useState } from "react";
import { toast } from "sonner";

export function useProfileActions(user: any) {
    const [showQR, setShowQR] = useState(false);

    // Lấy ra đường link đầy đủ dẫn tới Profile của user (sử dụng ID)
    const profileUrl = typeof window !== "undefined" && user?.id
        ? `${window.location.origin}/foodies/${user.id}`
        : "";

    const handleShareProfile = async () => {
        if (!profileUrl) return;

        // Kiểm tra xem trình duyệt (đặc biệt là Mobile) có hỗ trợ Web Share API không
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `TasteMap Profile`,
                    text: "Khám phá gu ẩm thực cực đỉnh của mình trên TasteMap nhé!",
                    url: profileUrl,
                });
                // Không hiện toast ở đây vì bảng share native đã tự xử lý UX
            } catch (error) {
                // Lỗi 'AbortError' là do người dùng tự bấm nút Tắt/Hủy bảng share, nên mình bỏ qua
                if ((error as Error).name !== "AbortError") {
                    toast.error("Không thể chia sẻ profile lúc này.");
                }
            }
        } else {
            // Nếu là trên PC hoặc trình duyệt cũ không có nút Share Native,
            // tự động chuyển qua tính năng Copy Link
            handleCopyLink();
            toast.info("Đã copy link do trình duyệt không hỗ trợ chia sẻ trực tiếp.");
        }
    };

    const handleCopyLink = async () => {
        if (!profileUrl) return;

        try {
            await navigator.clipboard.writeText(profileUrl);
            toast.success("Đã copy link profile! 📎");
        } catch (error) {
            toast.error("Không thể copy link. Lỗi trình duyệt!");
        }
    };

    const handleOpenQR = () => setShowQR(true);
    const handleCloseQR = () => setShowQR(false);

    return {
        showQR,
        profileUrl,
        handleShareProfile,
        handleCopyLink,
        handleOpenQR,
        handleCloseQR,
    };
}