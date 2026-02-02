import { create } from 'zustand'

type OpenPayerRateState = {
    payerId?: string
    rateId?: string
    isOpen: boolean
    onOpen: (payerId: string, rateId: string) => void
    onClose: () => void
}

export const useOpenPayerRate = create<OpenPayerRateState>((set) => ({
    payerId: undefined,
    rateId: undefined,
    isOpen: false,
    onOpen: (payerId: string, rateId: string) => set({ isOpen: true, payerId, rateId }),
    onClose: () => set({ isOpen: false, payerId: undefined, rateId: undefined }),
}))