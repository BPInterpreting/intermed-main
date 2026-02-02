import { create } from 'zustand'

type OpenPayerState = {
    id?: string
    isOpen: boolean
    onOpen: (id: string) => void
    onClose: () => void
}

export const useOpenPayer = create<OpenPayerState>((set) => ({
    id: undefined,
    isOpen: false,
    onOpen: (id: string) => set({ isOpen: true, id }),
    onClose: () => set({ isOpen: false, id: undefined }),
}))