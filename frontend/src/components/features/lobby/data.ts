import type { LobbyData } from "./types";

/**
 * Mock lobby sessions used for development and demo purposes.
 * In production, this would be replaced by a real-time API call.
 */
export const MOCK_LOBBIES: LobbyData[] = [
  {
    id: 1,
    name: "Spicy Noodle Challenge",
    route: "District 1 Mapping",
    time: "Tonight at 8 PM",
    spots: 4,
    bg: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&h=320&fit=crop",
    accent: "#ED1B24",
    category: "Food Challenge",
    description:
      "Tackle the spiciest noodle spots across District 1. Bring your courage!",
    tags: ["Spicy", "Noodles", "Challenge"],
    status: "waiting",
    is_public: true,
    host: {
      name: "Ramona",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop",
    },
    members: [
      {
        name: "Ramona",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Khoa",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Linh",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop",
        ready: false,
      },
    ],
  },
  {
    id: 2,
    name: "Coffee Lovers",
    route: "Hidden cafes tour",
    time: "Tomorrow at 9 AM",
    spots: 6,
    bg: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&h=320&fit=crop",
    accent: "#F59E0B",
    category: "Coffee Tour",
    is_public: true,
    description:
      "Discover 5 hidden specialty coffee shops in the heart of the city.",
    tags: ["Coffee", "Specialty", "Chill"],
    status: "waiting",
    host: {
      name: "Tran",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop",
    },
    members: [
      {
        name: "Tran",
        avatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Vy",
        avatar:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Minh",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop",
        ready: false,
      },
      {
        name: "Bao",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop",
        ready: false,
      },
      {
        name: "Duc",
        avatar:
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=64&h=64&fit=crop",
        ready: false,
      },
    ],
  },
  {
    id: 3,
    name: "Night Market Run",
    route: "Bến Thành → Phạm Ngũ Lão",
    time: "Tonight at 9:30 PM",
    spots: 5,
    bg: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=320&fit=crop",
    accent: "#8B5CF6",
    category: "Night Market",
    is_public: true,
    description:
      "Hit the best street stalls before midnight. From bánh mì to chè.",
    tags: ["Night Market", "Street Food", "Late Night"],
    status: "in-progress",
    host: {
      name: "Hana",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop",
    },
    members: [
      {
        name: "Hana",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Duy",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Lan",
        avatar:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Phong",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Thu",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop",
        ready: true,
      },
    ],
  },
  {
    id: 4,
    name: "Hidden Gem Hunt",
    route: "Bình Thạnh backstreets",
    time: "Saturday at 10 AM",
    spots: 4,
    bg: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&h=320&fit=crop",
    accent: "#10B981",
    category: "Hidden Gems",
    is_public: true,
    description: "Find the most underrated restaurants locals actually eat at.",
    tags: ["Hidden Gems", "Local", "Authentic"],
    status: "waiting",
    host: {
      name: "Nam",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop",
    },
    members: [
      {
        name: "Nam",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Thao",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop",
        ready: false,
      },
    ],
  },
  {
    id: 5,
    name: "Ramen Masters",
    route: "Japanese Quarter, Q1",
    time: "Sunday at 7 PM",
    spots: 6,
    bg: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=320&fit=crop",
    accent: "#F97316",
    category: "Ramen Hunt",
    is_public: true,
    description:
      "Rate and compare the top 4 ramen bowls in the city. Slurp loud.",
    tags: ["Ramen", "Japanese", "Rating"],
    status: "waiting",
    host: {
      name: "Kenji",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop",
    },
    members: [
      {
        name: "Kenji",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Mai",
        avatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Tùng",
        avatar:
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=64&h=64&fit=crop",
        ready: false,
      },
    ],
  },
  {
    id: 6,
    name: "Brunch & Bloom",
    route: "Thảo Điền, District 2",
    time: "Sunday at 9 AM",
    spots: 4,
    bg: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=320&fit=crop",
    accent: "#EC4899",
    category: "Brunch",
    is_public: true,
    description:
      "Aesthetic brunch spots with the best avocado toast in Thảo Điền.",
    tags: ["Brunch", "Aesthetic", "D2"],
    status: "full",
    host: {
      name: "Linh",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop",
    },
    members: [
      {
        name: "Linh",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "An",
        avatar:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Kim",
        avatar:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Ngân",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop",
        ready: true,
      },
    ],
  },
  {
    id: 7,
    name: "Dessert Crawl",
    route: "Pasteur St. → Lê Lợi",
    time: "Friday at 7 PM",
    spots: 5,
    bg: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=320&fit=crop",
    accent: "#A855F7",
    category: "Dessert Crawl",
    is_public: true,
    description:
      "Taste 6 dessert stops — from chè to tiramisu to boba. Sweet mission.",
    tags: ["Dessert", "Sweets", "Crawl"],
    status: "waiting",
    host: {
      name: "Vy",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop",
    },
    members: [
      {
        name: "Vy",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Thanh",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop",
        ready: true,
      },
    ],
  },
  {
    id: 8,
    name: "Street Food Sprint",
    route: "Võ Văn Tần corridor",
    time: "Tonight at 6 PM",
    spots: 6,
    bg: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=320&fit=crop",
    accent: "#3B82F6",
    category: "Street Food",
    is_public: true,
    description:
      "30-minute sprint through Võ Văn Tần — as many stalls as possible.",
    tags: ["Street Food", "Sprint", "Competitive"],
    status: "in-progress",
    host: {
      name: "Bảo",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop",
    },
    members: [
      {
        name: "Bảo",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Hùng",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Nhi",
        avatar:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Tú",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Khải",
        avatar:
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=64&h=64&fit=crop",
        ready: true,
      },
      {
        name: "Ngọc",
        avatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop",
        ready: true,
      },
    ],
  },
  {
    id: 9,
    name: "Secret Tasting Club",
    route: "Members only — TBA",
    time: "Friday at 8 PM",
    spots: 4,
    bg: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=320&fit=crop",
    accent: "#6366F1",
    category: "Hidden Gems",
    description:
      "An exclusive private tasting for invited guests only. Use the invite code to join.",
    tags: ["Private", "Exclusive", "Tasting"],
    status: "waiting",
    is_public: false,
    invite_code: "SQUAD-X9K2",
    host: {
      name: "Minh",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop",
    },
    members: [
      {
        name: "Minh",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop",
        ready: true,
      },
    ],
  },
];
