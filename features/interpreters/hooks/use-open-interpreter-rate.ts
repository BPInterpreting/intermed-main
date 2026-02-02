import { create } from 'zustand'

type OpenInterpreterRateState = {
    interpreterId?: string
    rateId?: string
    isOpen: boolean
    onOpen: (interpreterId: string, rateId: string) => void
    onClose: () => void
}

export const useOpenInterpreterRate = create<OpenInterpreterRateState>((set) => ({
    interpreterId: undefined,
    rateId: undefined,
    isOpen: false,
    onOpen: (interpreterId: string, rateId: string) => set({ isOpen: true, interpreterId, rateId }),
    onClose: () => set({ isOpen: false, interpreterId: undefined, rateId: undefined }),
}))