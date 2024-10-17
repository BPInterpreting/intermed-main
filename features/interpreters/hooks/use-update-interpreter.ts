import { create } from "zustand";

type UpdateInterpreterState = {
    id?: string;
    isOpen: boolean;
    onOpen: ( id:string ) => void;
    onClose: () => void;
}

export const useUpdateInterpreter = create<UpdateInterpreterState>((set) => ({
    id: undefined,
    isOpen: false,
    onOpen: (id: string) => set({ isOpen: true, id }),
    onClose: () => set({ isOpen: false, id: undefined}),
}));

