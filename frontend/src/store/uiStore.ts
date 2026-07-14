import { create } from "zustand";
import { ComposerType } from "@/types/contentCreation";

interface UiState {
  isCreatePostModalOpen: boolean;
  createPostType: ComposerType;
  openCreatePost: (type?: ComposerType) => void;
  closeCreatePost: () => void;

  // Membership checkout — global so any upgrade CTA / quota upsell can open it.
  isCheckoutOpen: boolean;
  checkoutPlan: "feast_monthly" | "feast_yearly";
  openCheckout: (plan?: "feast_monthly" | "feast_yearly") => void;
  closeCheckout: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isCreatePostModalOpen: false,
  createPostType: "post",
  openCreatePost: (type = "post") =>
    set({ isCreatePostModalOpen: true, createPostType: type }),
  closeCreatePost: () => set({ isCreatePostModalOpen: false }),

  isCheckoutOpen: false,
  checkoutPlan: "feast_monthly",
  openCheckout: (plan = "feast_monthly") =>
    set({ isCheckoutOpen: true, checkoutPlan: plan }),
  closeCheckout: () => set({ isCheckoutOpen: false }),
}));
