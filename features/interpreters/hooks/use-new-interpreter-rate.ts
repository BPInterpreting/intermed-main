import { create } from 'zustand'

type NewInterpreterRateState = {
    interpreterId?: string
    isOpen: boolean
    onOpen: (interpreterId: string) => void
    onClose: () => void
}

export const useNewInterpreterRate = create<NewInterpreterRateState>((set) => ({
    interpreterId: undefined,
    isOpen: false,
    onOpen: (interpreterId: string) => set({ isOpen: true, interpreterId }),
    onClose: () => set({ isOpen: false, interpreterId: undefined }),
}))