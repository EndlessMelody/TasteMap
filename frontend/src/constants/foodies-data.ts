import { Friend } from "@/components/features/foodies/FriendRow";

export const MOCK_FRIENDS: Friend[] = [
  {
    id: 1,
    name: "Ramona Flowers",
    status: "🍣 Eating Sushi at Neo-Tokyo",
    note: "Japanese Palate",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop",
    cover:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
    match: 94,
    isOnline: true,
  },
  {
    id: 2,
    name: "Mai Linh",
    status: "🍜 On a Spicy Bún Bò Tour",
    note: "Vietnamese street food",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop",
    cover:
      "https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&q=80",
    match: 81,
    isOnline: true,
  },
  {
    id: 3,
    name: "Thảo Vy",
    status: "☕ Cafe Hopping in District 1",
    note: "Coffee connoisseur",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop",
    cover:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
    match: 76,
    isOnline: false,
  },
  {
    id: 4,
    name: "Hùng Đạt",
    status: "🍔 Burger hunting",
    note: "American style diners",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop",
    cover:
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&q=80",
    match: 62,
    isOnline: false,
  },
  {
    id: 5,
    name: "Khôi Nguyên",
    status: "🌶️ Exploring spicy spots",
    note: "Spicy food lovers",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop",
    cover:
      "https://images.unsplash.com/photo-1551218808-94e220e031a5?w=800&q=80",
    match: 88,
    isOnline: true,
  },
];

export interface Message {
  id: number;
  text: string;
  sender: "me" | "them";
  time: string;
}

export const MOCK_CHATS: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      text: "Hey Ramona, down for some sushi tonight?",
      sender: "me",
      time: "09:41 AM",
    },
    {
      id: 2,
      text: "Absolutely! I heard the Neo-Tokyo spot has a fresh batch of uni.",
      sender: "them",
      time: "09:42 AM",
    },
    {
      id: 3,
      text: "Uni? count me in! See you at 7.",
      sender: "me",
      time: "09:45 AM",
    },
  ],
  2: [
    {
      id: 1,
      text: "Chào Linh, Bún Bò Dĩ An sao rồi?",
      sender: "me",
      time: "10:15 AM",
    },
    {
      id: 2,
      text: "Ngon xỉu ông ơi! Đang ăn ở O Trắng nè.",
      sender: "them",
      time: "10:20 AM",
    },
  ],
  3: [
    {
      id: 1,
      text: "Vy ơi District 1 có cafe nào mới không?",
      sender: "me",
      time: "11:00 AM",
    },
    {
      id: 2,
      text: "Có quán 'Underground Coffee' mới mở á, view bao chill.",
      sender: "them",
      time: "11:05 AM",
    },
  ],
  4: [
    { id: 1, text: "Burger tonight?", sender: "me", time: "05:00 PM" },
    {
      id: 2,
      text: "Ready when you are! Check out @burger_hunt for the spot.",
      sender: "them",
      time: "05:10 PM",
    },
  ],
  5: [
    {
      id: 1,
      text: "Yo, join the Group Room?",
      sender: "me",
      time: "Yesterday",
    },
    { id: 2, text: "Coming in 5!", sender: "them", time: "Yesterday" },
  ],
};
