import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

export const useMarkInvoiceSent = (invoiceId: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (json?: { dueDate?: Date }) => {
            const response = await client.api.invoices[':id']['mark-sent'].$post({
                param: { id: invoiceId },
                json: json || {},
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Invoice marked as sent')
            queryClient.invalidateQueries({ queryKey: ['invoice', { id: invoiceId }] })
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
            queryClient.invalidateQueries({ queryKey: ['billing-dashboard'] })
        },
        onError: () => {
            toast.error('Failed to mark invoice as sent')
        }
    })

    return mutation
}