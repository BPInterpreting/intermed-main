import { create } from "zustand";

type NewInterpreterState = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useNewInterpreter = create<NewInterpreterState>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));

