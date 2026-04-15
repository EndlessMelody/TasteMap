import React from "react";
import {
  Flame,
  Moon,
  Camera,
  Crown,
  Utensils,
  Coffee,
  MoonStar,
  Croissant,
} from "lucide-react";
import {
  ReelData,
  PostData,
  AIPickData,
  HeroBannerData,
  ProBannerData,
  UserProfile,
} from "@/types/dashboard";

export const MOCK_HERO_BANNER: HeroBannerData = {
  title: "Weekend Street Food Tour",
  description: "Discover hidden gems and earn massive rewards this weekend.",
  image:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop",
  tags: ["100XP / spot", "Light Rain • 1.2km"],
  xpBonus: "100XP / spot",
  ctaText: "Book Now",
  sponsored: true,
};

export const MOCK_PRO_BANNER: ProBannerData = {
  badge: "HOLY SHIET",
  subBadge: "Double ĐK",
  title: "Nói chung là:\nĐừng có mà chê.",
  description:
    "Cái web này trên lí thuyết có khoảng 8 người build trong 5 tháng nhưng thực tế có 2 thằng thôi ehehe~",
  btnText: "Code chung nhóe :>",
  image: "https://pbs.twimg.com/media/FHNENIfaQAIa3SB?format=jpg&name=medium", // Add your image URL here!
};

export const MOCK_REELS: ReelData[] = [
  {
    id: 1,
    title: "Crispy Pork Belly ASMR 🔥",
    user: "@foodie_ramona",
    views: "1.2M",
    userAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=700&fit=crop",
  },
  {
    id: 2,
    title: "Hidden Ramen Spot in District 1",
    user: "@noodle_king",
    views: "890K",
    userAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop",
    img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=700&fit=crop",
  },
  {
    id: 3,
    title: "Vietnamese Coffee Art ☕",
    user: "@cafe_hunter",
    views: "2.1M",
    userAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop",
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=700&fit=crop",
  },
  {
    id: 4,
    title: "Street Bánh Mì at 3AM 🌙",
    user: "@midnight_bites",
    views: "567K",
    userAvatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop",
    img: "https://images.unsplash.com/photo-1600454021915-de1c1cb0e91f?w=400&h=700&fit=crop",
  },
  {
    id: 5,
    title: "Dragon Fruit Smoothie Bowl",
    user: "@healthy_vibes",
    views: "340K",
    userAvatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop",
    img: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=700&fit=crop",
  },
  {
    id: 6,
    title: "Seafood Hot Pot Mukbang 🦐",
    user: "@ocean_eats",
    views: "1.8M",
    userAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop",
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=700&fit=crop",
  },
];

export const MOCK_POSTS: PostData[] = [
  {
    id: 1,
    name: "Minh T.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop",
    time: "2h",
    location: "Dĩ An",
    spotName: "Bún Bò O Trắng",
    rating: 4.8,
    review:
      "Tìm được quán bún bò chân ái mới ở Dĩ An! Nước dùng thanh, siêu nhiều thịt. Mọi người nên thử nhé. 🍜🔥",
    img: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=680&h=480&fit=crop",
    tags: ["Street Food", "Spicy"],
    likes: 42,
    comments: 8,
  },
  {
    id: 2,
    name: "Lê Hương",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop",
    time: "5h",
    location: "Thủ Đức",
    spotName: "Cafe Rooftop Sunset",
    rating: 4.5,
    review:
      "View đẹp, cà phê ổn, giá hơi cao nhưng đáng để trải nghiệm vào chiều cuối tuần. Chỗ ngồi ngoài trời mát lắm! ☕🌅",
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=680&h=480&fit=crop",
    tags: ["Cafe", "Rooftop"],
    likes: 128,
    comments: 24,
  },
  {
    id: 3,
    name: "Phúc Nguyễn",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=128&h=128&fit=crop",
    time: "8h",
    location: "Dĩ An",
    spotName: "Hủ Tiếu Nam Vang Chú Sáu",
    rating: 4.9,
    review:
      "Hủ tiếu khô ở đây xịn nhất vùng, nước lèo thơm béo, hoành thánh giòn tan. Quán đông nhưng phục vụ nhanh. Sẽ quay lại! 🤤",
    img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=680&h=480&fit=crop",
    tags: ["Noodles", "Budget"],
    likes: 89,
    comments: 15,
  },
  {
    id: 4,
    name: "Thanh Vũ",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop",
    time: "12h",
    location: "Bình Dương",
    spotName: "BBQ Garden Night",
    rating: 4.3,
    review:
      "Thịt nướng ướp khói thơm phức, bia đá lạnh. Không gian ngoài trời thoáng mát, nhạc acoustic live nữa. 🍖🍻",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=680&h=480&fit=crop",
    tags: ["BBQ", "Night Life"],
    likes: 67,
    comments: 11,
  },
];

export const AI_PICKS: AIPickData[] = [
  {
    title: "Bún Bò Huế Cô Giào",
    reason: "Because you love Spicy + Street Food",
    match: 97,
    price: "35k",
    img: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300&h=200&fit=crop",
    color: "#E63946",
  },
  {
    title: "The Alley Boba",
    reason: "Popular with your friends",
    match: 92,
    price: "55k",
    img: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=300&h=200&fit=crop",
    color: "#2A9D8F",
  },
  {
    title: "Ramen Shin Tokyo",
    reason: "Trending in your area",
    match: 89,
    price: "95k",
    img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop",
    color: "#FF6B35",
  },
  {
    title: "Rooftop BBQ Night",
    reason: "Matches your Night Owl profile",
    match: 85,
    price: "180k",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop",
    color: "#7B2FF7",
  },
];

export const STATIC_CATEGORIES = [
  {
    id: "all",
    label: "All Items",
    icon: React.createElement(Utensils, { size: 14 }),
  },
  {
    id: "street",
    label: "Street Food",
    icon: React.createElement(Utensils, { size: 14 }),
  },
  {
    id: "cafe",
    label: "Cafes",
    icon: React.createElement(Coffee, { size: 14 }),
  },
  {
    id: "night",
    label: "Late Night",
    icon: React.createElement(MoonStar, { size: 14 }),
  },
  {
    id: "healthy",
    label: "Healthy",
    icon: React.createElement(Flame, { size: 14 }),
  },
  {
    id: "bakery",
    label: "Bakeries",
    icon: React.createElement(Croissant, { size: 14 }),
  },
];

export const STATIC_TAGS = [
  "Spicy",
  "Budget",
  "Trendy",
  "Quiet",
  "Outdoor",
  "Pet Friendly",
  "Live Music",
  "WiFi",
];

export const MOCK_USER: UserProfile = {
  name: "Melody",
  username: "@dkhoa_melody",
  avatar:
    "https://i.pinimg.com/736x/46/83/99/46839974515f6ca59a6023ef5e061d3e.jpg",
  cover:
    "https://i.pinimg.com/originals/08/7a/b7/087ab779ef05bb3d6ea12d52c2cefca1.gif",
  bio: "AI student at HCMUS | ML, LLMs & GenAI | Frontend developer building end-to-end AI products",
  level: 69,
  title: "Teenage Syndrome",
  location: "Ho Chi Minh City",
  joined: "March 2025",
  stats: { reviews: 89, visited: 142, followers: 1240, following: 356 },
  xp: 750,
  nextLevelXp: 1000,
  badges: [
    {
      icon: React.createElement(Flame, { size: 16 }),
      label: "Spice Master",
      color: "#E63946",
    },
    {
      icon: React.createElement(Moon, { size: 16 }),
      label: "Night Owl",
      color: "#7B2FF7",
    },
    {
      icon: React.createElement(Camera, { size: 16 }),
      label: "Photo Pro",
      color: "#2A9D8F",
    },
    {
      icon: React.createElement(Crown, { size: 16 }),
      label: "Top Reviewer",
      color: "#FBBF24",
    },
  ],
  radarData: [
    { subject: "Street Food", A: 100, fullMark: 150 },
    { subject: "Spicy", A: 71, fullMark: 150 },
    { subject: "Sweet", A: 90, fullMark: 150 },
    { subject: "Luxury", A: 56, fullMark: 150 },
    { subject: "Quiet", A: 85, fullMark: 150 },
    { subject: "Group", A: 120, fullMark: 150 },
  ],
  posts: [
    {
      id: 1,
      img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop",
      likes: 124,
      comments: 12,
    },
    {
      id: 2,
      img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop",
      likes: 89,
      comments: 5,
    },
    {
      id: 3,
      img: "https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?w=400&h=400&fit=crop",
      likes: 231,
      comments: 18,
    },
    {
      id: 4,
      img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop",
      likes: 156,
      comments: 22,
    },
    {
      id: 5,
      img: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=400&fit=crop",
      likes: 94,
      comments: 7,
    },
    {
      id: 6,
      img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop",
      likes: 112,
      comments: 14,
    },
  ],
  topSpots: [
    {
      name: "Bún Bò O Trắng",
      img: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=200&h=200&fit=crop",
      rating: 4.9,
      category: "Noodle",
    },
    {
      name: "Matcha Garden",
      img: "https://images.unsplash.com/photo-1582787895088-2ff176b668d2?w=200&h=200&fit=crop",
      rating: 4.7,
      category: "Cafe",
    },
    {
      name: "Neon Ramen House",
      img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop",
      rating: 4.8,
      category: "Ramen",
    },
  ],
};
