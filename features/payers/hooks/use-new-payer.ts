import { create } from 'zustand'

type NewPayerState = {
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
}

export const useNewPayer = create<NewPayerState>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}))