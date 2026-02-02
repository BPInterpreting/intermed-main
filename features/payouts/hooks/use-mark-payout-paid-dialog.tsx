import { create } from 'zustand'

type MarkPayoutPaidDialogState = {
    id?: string
    isOpen: boolean
    onOpen: (id: string) => void
    onClose: () => void
}

export const useMarkPayoutPaidDialog = create<MarkPayoutPaidDialogState>((set) => ({
    id: undefined,
    isOpen: false,
    onOpen: (id: string) => set({ isOpen: true, id }),
    onClose: () => set({ isOpen: false, id: undefined }),
}))