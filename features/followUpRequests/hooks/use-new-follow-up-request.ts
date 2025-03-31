import { create } from "zustand";

type NewFollowUpRequestState = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useNewFollowUpRequest = create<NewFollowUpRequestState>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));

