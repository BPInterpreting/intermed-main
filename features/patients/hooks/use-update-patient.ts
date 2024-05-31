import { create } from "zustand";

type EditPatientState = {
    id?: string;
    isOpen: boolean;
    onOpen: ( id:string ) => void;
    onClose: () => void;
}

export const useUpdatePatient = create<EditPatientState>((set) => ({
    id: undefined,
    isOpen: false,
    onOpen: (id: string) => set({ isOpen: true, id }),
    onClose: () => set({ isOpen: false, id: undefined}),
}));

