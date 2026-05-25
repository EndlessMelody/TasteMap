import { create } from "zustand";
import { ComposerType } from "@/types/contentCreation";

interface UiState {
  isCreatePostModalOpen: boolean;
  createPostType: ComposerType;
  openCreatePost: (type?: ComposerType) => void;
  closeCreatePost: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isCreatePostModalOpen: false,
  createPostType: "post",
  openCreatePost: (type = "post") =>
    set({ isCreatePostModalOpen: true, createPostType: type }),
  closeCreatePost: () => set({ isCreatePostModalOpen: false }),
}));
