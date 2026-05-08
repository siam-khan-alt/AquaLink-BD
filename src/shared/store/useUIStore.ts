import { create } from "zustand";
import { IAIState } from "@/shared/types/ai.types";

export const useAIStore = create<IAIState>((set) => ({
  isChatOpen: false,
  toggleChat: () => 
    set((state) => ({ 
      isChatOpen: !state.isChatOpen,
    })),
}));