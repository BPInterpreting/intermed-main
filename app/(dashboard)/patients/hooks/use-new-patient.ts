import { create } from "zustand";

type NewPatientState = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useNewPatient = create<NewPatientState>((set) => ({
    isOpen: true,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));