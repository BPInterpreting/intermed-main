import { create } from 'zustand'

type GeneratePayoutsDialogState = {
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
}

export const useGeneratePayoutsDialog = create<GeneratePayoutsDialogState>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}))