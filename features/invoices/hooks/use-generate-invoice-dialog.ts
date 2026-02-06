import { create } from 'zustand'

type GenerateInvoiceDialogState = {
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
}

export const useGenerateInvoiceDialog = create<GenerateInvoiceDialogState>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}))