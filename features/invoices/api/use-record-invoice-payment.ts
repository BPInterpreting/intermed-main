import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

export const useRecordInvoicePayment = (invoiceId: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (json: { amount: string; paidAt?: Date; notes?: string }) => {
            const response = await client.api.invoices[':id']['record-payment'].$post({
                param: { id: invoiceId },
                json,
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Payment recorded')
            queryClient.invalidateQueries({ queryKey: ['invoice', { id: invoiceId }] })
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
            queryClient.invalidateQueries({ queryKey: ['billing-dashboard'] })
        },
        onError: () => {
            toast.error('Failed to record payment')
        }
    })

    return mutation
}