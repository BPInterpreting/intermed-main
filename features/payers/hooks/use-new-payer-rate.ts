import { create } from 'zustand'

type NewPayerRateState = {
    payerId?: string
    isOpen: boolean
    onOpen: (payerId: string) => void
    onClose: () => void
}

export const useNewPayerRate = create<NewPayerRateState>((set) => ({
    payerId: undefined,
    isOpen: false,
    onOpen: (payerId: string) => set({ isOpen: true, payerId }),
    onClose: () => set({ isOpen: false, payerId: undefined }),
}))