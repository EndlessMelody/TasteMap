import { create } from "zustand";
import { PostData, ReelData } from "@/types/dashboard";

interface SocialState {
  posts: PostData[];
  reels: ReelData[];
  setPosts: (posts: PostData[]) => void;
  setReels: (reels: ReelData[]) => void;
  updatePost: (id: number, data: Partial<PostData>) => void;
  updateReel: (id: number, data: Partial<ReelData>) => void;
}

export const useSocialStore = create<SocialState>((set) => ({
  posts: [],
  reels: [],
  setPosts: (posts) => set({ posts }),
  setReels: (reels) => set({ reels }),
  updatePost: (id, data) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id ? { ...post, ...data } : post
      ),
    })),
  updateReel: (id, data) =>
    set((state) => ({
      reels: state.reels.map((reel) =>
        reel.id === id ? { ...reel, ...data } : reel
      ),
    })),
}));
