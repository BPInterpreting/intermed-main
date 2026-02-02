import { create } from 'zustand'

type ProcessPayoutDialogState = {
    id?: string
    isOpen: boolean
    onOpen: (id: string) => void
    onClose: () => void
}

export const useProcessPayoutDialog = create<ProcessPayoutDialogState>((set) => ({
    id: undefined,
    isOpen: false,
    onOpen: (id: string) => set({ isOpen: true, id }),
    onClose: () => set({ isOpen: false, id: undefined }),
}))