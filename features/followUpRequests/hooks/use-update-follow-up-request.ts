import { create } from "zustand";

type UpdateFollowUpRequestState = {
    id?: string;
    isOpen: boolean;
    onOpen: ( id:string ) => void;
    onClose: () => void;
}

export const useUpdateFollowUpRequest = create<UpdateFollowUpRequestState>((set) => ({
    id: undefined,
    isOpen: false,
    onOpen: (id: string) => set({ isOpen: true, id }),
    onClose: () => set({ isOpen: false, id: undefined}),
}));

