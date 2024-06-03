import { create } from "zustand";

type NewFacilityState = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useNewFacility = create<NewFacilityState>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));

